"""Bank validation failures must preserve the previous published artifacts."""
import copy
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]

class BankTransactionTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix='study-atlas-test-')
        self.addCleanup(self.tmp.cleanup)
        self.base = Path(self.tmp.name) / 'fixture'
        for directory in ['sources/slides', 'activities', 'source-analysis/lectures']:
            (self.base / directory).mkdir(parents=True, exist_ok=True)
        source = b'%PDF-1.4\nSynthetic workflow fixture, not teaching material.\n'
        (self.base / 'sources/slides/source.pdf').write_bytes(source)
        self.write('sources/manifest.json', {'subject':'Fixture', 'total_pdf_pages':1, 'lectures':[
            {'id':'lesson','title':'Lesson','path':'slides/source.pdf','pdf_pages':1,'sha256':hashlib.sha256(source).hexdigest()}]})
        self.record = {'lectureId':'lesson', 'title':'Lesson', 'pages':[
            {'pdfPage':1,'printedSlide':None,'kind':'teaching','title':'Fixture','topics':['Fixture'],
             'concepts':[{'id':'lesson-one','label':'One','detail':'Synthetic detail','priority':'core','rationale':'Test fixture'}],
             'visualReview':'reviewed','visualNotes':'Synthetic fixture','uncertainties':[]}]}
        self.write('source-analysis/lectures/lesson.json', self.record)
        (self.base/'source-analysis/lectures/lesson.md').write_text('# Lesson\n\n## PDF page 1\n\nSynthetic fixture.\n',encoding='utf-8')
        self.item = {'id':'lesson-item','revision':1,'type':'mcq','lectureId':'lesson','conceptIds':['lesson-one'],
                     'sourceRefs':[{'lectureId':'lesson','pdfPage':1}],'prompt':'Choose the synthetic fixture key.',
                     'explanation':{'en':'Synthetic fixture.','ar':'اختبار اصطناعي'},'status':'validated',
                     'review':{'sourceChecked':True,'ambiguityChecked':True,'cueChecked':True,'bilingualChecked':True,
                               'peerReviewedBy':'fixture-reviewer','peerReviewNotes':'Synthetic workflow fixture only.'},
                     'options':[{'id':str(i),'text':'Option '+str(i),'evidence':'Synthetic fixture option.'} for i in range(5)],'correctOptionId':'0'}
        self.write('activities/lesson.json', {'lectureId':'lesson','activities':[self.item]})
        self.write('subject.json', {'id':'fixture'})
        result = self.build()
        self.assertEqual(result.returncode, 0, result.stderr)

    def write(self, relative, value):
        (self.base/relative).write_text(json.dumps(value,ensure_ascii=False),encoding='utf-8')

    def build(self):
        return subprocess.run([sys.executable,str(ROOT/'scripts/build_bank.py'),'--subject','fixture','--subject-root',str(self.base)],
                              capture_output=True,text=True,encoding='utf-8',errors='replace')

    def published(self):
        paths = [self.base/'activities.json',self.base/'subject.json'] + list((self.base/'source-analysis').glob('*'))
        return {p.relative_to(self.base).as_posix():p.read_bytes() for p in paths if p.is_file()}

    def test_valid_build_updates_bank_and_catalog(self):
        bank=json.loads((self.base/'activities.json').read_text(encoding='utf-8'))
        self.assertEqual(bank['activities'][0]['id'],'lesson-item')
        catalog=json.loads((self.base/'subject.json').read_text(encoding='utf-8'))['catalog']
        self.assertEqual(catalog,{'lectures':1,'pages':1,'pdfPages':1,'mcqs':1,'total':1})

    def test_invalid_options_preserve_all_published_artifacts(self):
        before=self.published()
        broken=copy.deepcopy(self.item);broken['options'].pop()
        self.write('activities/lesson.json',{'lectureId':'lesson','activities':[broken]})
        result=self.build()
        self.assertNotEqual(result.returncode,0)
        self.assertIn('five distinct options',result.stderr)
        self.assertEqual(self.published(),before)

    def test_uncovered_core_preserves_all_published_artifacts(self):
        before=self.published()
        record=copy.deepcopy(self.record)
        record['pages'][0]['concepts'].append({'id':'lesson-two','label':'Two','detail':'Another synthetic detail','priority':'core','rationale':'Test fixture'})
        self.write('source-analysis/lectures/lesson.json',record)
        result=self.build()
        self.assertNotEqual(result.returncode,0)
        self.assertIn('Core concepts without activities',result.stderr)
        self.assertEqual(self.published(),before)

if __name__=='__main__':
    unittest.main()
