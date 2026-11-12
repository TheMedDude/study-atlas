"""Validate a staged subject bank before replacing any published content files."""
import argparse
import collections
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]

def read(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))

def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--subject', default='molecular-biology')
    parser.add_argument('--subject-root', type=Path, help='Explicit subject directory, including isolated validation fixtures')
    args = parser.parse_args()
    target = (args.subject_root or ROOT / 'subjects' / args.subject).resolve()
    manifest = read(target / 'sources/manifest.json')
    activities, deferrals = [], []
    for lecture in manifest['lectures']:
        data = read(target / 'activities' / (lecture['id'] + '.json'))
        for item in data['activities']:
            if item['lectureId'] != lecture['id'] or item['status'] != 'validated':
                raise ValueError(f'Unvalidated or wrong-lecture item: {item["id"]}')
            if not item['review'].get('peerReviewedBy') or not item['review'].get('peerReviewNotes'):
                raise ValueError(f'Missing independent review: {item["id"]}')
            activities.append(item)
        deferrals.extend({**d, 'lectureId': lecture['id']} for d in data.get('coverageDeferrals', []))
    # Inputs and original PDFs are copied into a temporary validation tree. A failed
    # source, item, or coverage gate leaves every existing app artifact unchanged.
    with tempfile.TemporaryDirectory(prefix='study-atlas-bank-') as tmp:
        stage = Path(tmp) / args.subject
        shutil.copytree(target, stage, ignore=shutil.ignore_patterns('.git', 'node_modules', 'work'))
        analysis = stage / 'source-analysis'
        analysis.mkdir(exist_ok=True)
        write(stage / 'activities.json', {'schemaVersion':1, 'subjectId':args.subject, 'scopeId':'midterm', 'activities':activities})
        write(analysis / 'activity-deferrals.json', {'schemaVersion':1, 'items':deferrals})
        for script in ['build_source_index.py', 'validate_content.py']:
            subprocess.run([sys.executable, str(ROOT / 'scripts' / script), '--subject', args.subject, '--subject-root', str(stage)], check=True)
        concepts = read(analysis / 'concept-index.json')['concepts']
        deferred = {d['conceptId'] for d in deferrals if d.get('reason')}
        uncovered = [c['id'] for c in concepts if c['priority']=='core' and not c['activityIds'] and c['id'] not in deferred]
        if uncovered:
            raise ValueError(f'Core concepts without activities or justified deferrals: {uncovered}')
        report = {'schemaVersion':1, 'activities':len(activities), 'types':dict(collections.Counter(a['type'] for a in activities)),
                  'conceptsWithActivities':sum(bool(c['activityIds']) for c in concepts), 'totalConcepts':len(concepts),
                  'coreConcepts':sum(c['priority']=='core' for c in concepts),
                  'coreConceptsWithActivities':sum(c['priority']=='core' and bool(c['activityIds']) for c in concepts),
                  'explicitDeferrals':len(deferrals), 'independentlyReviewed':True}
        write(analysis / 'activity-review-summary.json', report)
        outputs = ['activities.json'] + ['source-analysis/' + name for name in [
            'activity-deferrals.json', 'activity-review-summary.json', 'page-ledger.json', 'concept-index.json',
            'uncertainties.json', 'chapters.json', 'coverage-summary.json', 'coverage-ledger.csv',
            args.subject + '_detailed_structured_study_source.md', 'INDEX.md']]
        if (stage / 'subject.json').exists():
            config = read(stage / 'subject.json')
            coverage = read(analysis / 'coverage-summary.json')
            config['catalog'] = {'lectures':len(manifest['lectures']), 'pages':coverage['teachingPages'],
                                 'pdfPages':manifest['total_pdf_pages'], 'mcqs':sum(a['type']=='mcq' for a in activities), 'total':len(activities)}
            write(stage / 'subject.json', config)
            outputs.append('subject.json')
        # Validation succeeded. Each destination replacement is atomic at file level.
        for relative in outputs:
            source, destination = stage / relative, target / relative
            destination.parent.mkdir(parents=True, exist_ok=True)
            with tempfile.NamedTemporaryFile(dir=destination.parent, prefix='.bank-build-', delete=False) as handle:
                temporary = Path(handle.name)
                handle.write(source.read_bytes())
            try:
                os.replace(temporary, destination)
            finally:
                temporary.unlink(missing_ok=True)
        print(json.dumps(report, indent=2))

if __name__ == '__main__':
    main()
