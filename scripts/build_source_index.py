"""Build the consolidated source, page ledger, and concept index from reviewed lectures."""
import json, pathlib, csv, io, hashlib, re
ROOT=pathlib.Path(__file__).resolve().parents[1]
BASE=ROOT/'subjects/molecular-biology'; ANALYSIS=BASE/'source-analysis'
def read(path): return json.loads(path.read_text(encoding='utf-8-sig'))
def write(path,value): path.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
manifest=read(BASE/'sources/manifest.json')
allpages=[]; concepts={}; uncertainties=[]; chapters=[]; sections=[]
for lec in manifest['lectures']:
    data=read(ANALYSIS/'lectures'/f"{lec['id']}.json")
    assert data['lectureId']==lec['id']
    pages=data['pages']; assert [p['pdfPage'] for p in pages]==list(range(1,lec['pdf_pages']+1)),lec['id']
    assert hashlib.sha256((BASE/'sources'/lec['path']).read_bytes()).hexdigest()==lec['sha256']
    for p in pages:
        assert p['visualReview']=='reviewed', (lec['id'],p['pdfPage'])
        assert p['kind'] in ('teaching','cover','administrative','divider')
        assert 'printedSlide' in p
        assert p['kind']!='teaching' or p['concepts'],(lec['id'],p['pdfPage'],'unindexed teaching page')
        ref={'lectureId':lec['id'],'pdfPage':p['pdfPage'],'printedSlide':p['printedSlide']}
        page={**p,'lectureId':lec['id'],'sourcePath':'../sources/'+lec['path'],'conceptIds':[c['id'] for c in p['concepts']]}
        page.pop('concepts'); allpages.append(page)
        for c in p['concepts']:
            assert c['id'].startswith(lec['id']+'-'),c['id']
            current=concepts.setdefault(c['id'],{'id':c['id'],'lectureId':lec['id'],'label':c['label'],'priority':c['priority'],'rationale':c['rationale'],'rationales':[],'sourceRefs':[],'details':[],'activityIds':[]})
            if c['priority']=='core':
                current['priority']='core'
                current['rationale']=c['rationale']
            if c['rationale'] not in current['rationales']: current['rationales'].append(c['rationale'])
            current['sourceRefs'].append(ref)
            if c['detail'] not in current['details']: current['details'].append(c['detail'])
        for u in p['uncertainties']:
            uncertainties.append({**u,**ref})
    chapters.append({'id':lec['id'],'title':lec['title'],'pdfPages':lec['pdf_pages'],'teachingPages':[p['pdfPage'] for p in pages if p['kind']=='teaching'],'exclusions':[{'pdfPage':p['pdfPage'],'kind':p['kind'],'title':p['title']} for p in pages if p['kind']!='teaching'],'topics':list(dict.fromkeys(t for p in pages for t in p['topics']))})
    lecture_md=(ANALYSIS/'lectures'/f"{lec['id']}.md").read_text(encoding='utf-8-sig')
    lecture_md=lecture_md.replace('../../sources/', '../sources/')
    sections.append(re.sub(r'^(#+) ', r'#\1 ', lecture_md, flags=re.MULTILINE))
# Attach bank coverage if a reviewed bank exists. Zero availability stays visible.
bankpath=BASE/'activities.json'; bank=read(bankpath)['activities'] if bankpath.exists() else []
for activity in bank:
    for cid in activity['conceptIds']:
        assert cid in concepts,(activity['id'],cid)
        concepts[cid]['activityIds'].append(activity['id'])
for c in concepts.values(): c['activityAvailability']='available' if c['activityIds'] else 'not-yet-authored'
write(ANALYSIS/'page-ledger.json',{'schemaVersion':1,'subjectId':'molecular-biology','pages':allpages})
write(ANALYSIS/'concept-index.json',{'schemaVersion':1,'subjectId':'molecular-biology','concepts':list(concepts.values())})
write(ANALYSIS/'uncertainties.json',{'schemaVersion':1,'subjectId':'molecular-biology','items':uncertainties})
write(ANALYSIS/'chapters.json',{'schemaVersion':1,'subjectId':'molecular-biology','chapters':chapters})
summary={'totalPdfPages':len(allpages),'visuallyReviewedPages':len(allpages),'teachingPages':sum(p['kind']=='teaching' for p in allpages),'excludedPages':sum(p['kind']!='teaching' for p in allpages),'indexedConcepts':len(concepts),'sourceUncertainties':len(uncertainties),'validatedActivities':len(bank),'conceptsWithActivities':sum(bool(c['activityIds']) for c in concepts.values())}
write(ANALYSIS/'coverage-summary.json',summary)
stream=io.StringIO(newline=''); w=csv.writer(stream); w.writerow(['lecture_id','pdf_page','printed_slide','kind','title','concept_ids','visual_review','uncertainty_ids','activity_ids'])
for p in allpages:
    aids=sorted({a for cid in p['conceptIds'] for a in concepts[cid]['activityIds']})
    w.writerow([p['lectureId'],p['pdfPage'],p['printedSlide'] or '',p['kind'],p['title'],';'.join(p['conceptIds']),p['visualReview'],';'.join(u['id'] for u in p['uncertainties']),';'.join(aids)])
(ANALYSIS/'coverage-ledger.csv').write_text(stream.getvalue(),encoding='utf-8')
header='''# Molecular Biology detailed structured study source

Authority: the six unchanged supplied lecture PDFs. No outside biology sources.

References below use **PDF page**, starting at 1 in each file. A printed slide number is recorded separately only when visible. Covers and administrative pages are retained in the page ledger and excluded from assessment. Source inconsistencies and unclear labels are preserved and blocked from determining scored answers.

This document is the consolidated extraction. The adjacent lecture files preserve editing boundaries; `page-ledger.json`, `concept-index.json`, `coverage-ledger.csv`, and `uncertainties.json` provide machine-readable traceability. Activity availability is distinct from source coverage and from a student's performance.

'''
(ANALYSIS/'molecular-biology_detailed_structured_study_source.md').write_text(header+'\n\n---\n\n'.join(sections)+'\n',encoding='utf-8')
lines=['# Molecular Biology source index','',f"{summary['totalPdfPages']} PDF pages visually reviewed; {summary['teachingPages']} teaching pages; {summary['excludedPages']} excluded pages; {summary['indexedConcepts']} indexed concepts.",'','All pagination below is PDF pagination. See `uncertainties.json` for unresolved source claims. Priority is based on source emphasis and relationships, not predicted exam likelihood.','']
for ch in chapters:
    lines += [f"## {ch['title']}",'',f"{ch['pdfPages']} PDF pages. Teaching pages: {', '.join(map(str,ch['teachingPages']))}.",'',f"[Detailed extraction](lectures/{ch['id']}.md) · [Original PDF](../sources/{next(l['path'] for l in manifest['lectures'] if l['id']==ch['id'])})",'','Topics: '+ '; '.join(ch['topics'])+'.','']
    for p in [p for p in allpages if p['lectureId']==ch['id']]: lines.append(f"- PDF p{p['pdfPage']}: {p['title']} ({p['kind']}); {len(p['conceptIds'])} concepts"+(f"; {len(p['uncertainties'])} source notes" if p['uncertainties'] else ''))
    lines.append('')
(ANALYSIS/'INDEX.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print(json.dumps(summary,indent=2))

