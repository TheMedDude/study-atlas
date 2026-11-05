"""Publish only independently reviewed lecture activities and rebuild coverage."""
import collections, json, pathlib, subprocess, sys
ROOT = pathlib.Path(__file__).resolve().parents[1]
BASE = ROOT / 'subjects/molecular-biology'
def read(path): return json.loads(path.read_text(encoding='utf-8-sig'))
manifest = read(BASE / 'sources/manifest.json')
activities, deferrals = [], []
for lecture in manifest['lectures']:
    data = read(BASE / 'activities' / (lecture['id'] + '.json'))
    for item in data['activities']:
        assert item['lectureId'] == lecture['id'], item['id']
        assert item['status'] == 'validated', ('Not independently validated', item['id'])
        assert item['review'].get('peerReviewedBy') and item['review'].get('peerReviewNotes'), ('Missing independent review', item['id'])
        activities.append(item)
    deferrals += [{**d, 'lectureId': lecture['id']} for d in data.get('coverageDeferrals', [])]
bank = {'schemaVersion': 1, 'subjectId': 'molecular-biology', 'scopeId': 'midterm', 'activities': activities}
(BASE / 'activities.json').write_text(json.dumps(bank, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
(BASE / 'source-analysis/activity-deferrals.json').write_text(json.dumps({'schemaVersion':1,'items':deferrals}, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
subprocess.run([sys.executable, str(ROOT / 'scripts/build_source_index.py')], check=True)
subprocess.run([sys.executable, str(ROOT / 'scripts/validate_content.py')], check=True)
concepts = read(BASE / 'source-analysis/concept-index.json')['concepts']
deferred_ids = {d['conceptId'] for d in deferrals}
uncovered_core = [c for c in concepts if c['priority']=='core' and not c['activityIds'] and c['id'] not in deferred_ids]
assert not uncovered_core, ('Clear core concepts without coverage or explicit deferral', [c['id'] for c in uncovered_core])
report = {'schemaVersion':1, 'activities':len(activities), 'types':dict(collections.Counter(a['type'] for a in activities)),
          'conceptsWithActivities':sum(bool(c['activityIds']) for c in concepts), 'totalConcepts':len(concepts),
          'coreConcepts':sum(c['priority']=='core' for c in concepts),
          'coreConceptsWithActivities':sum(c['priority']=='core' and bool(c['activityIds']) for c in concepts),
          'explicitDeferrals':len(deferrals), 'independentlyReviewed':True}
(BASE / 'source-analysis/activity-review-summary.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,indent=2))
