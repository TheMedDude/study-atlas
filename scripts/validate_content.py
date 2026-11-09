"""Structural and provenance checks. These supplement, never replace, content review."""
import hashlib, json, pathlib, re, sys, argparse

ROOT = pathlib.Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--subject', default='molecular-biology')
args = parser.parse_args()
BASE = ROOT / 'subjects' / args.subject
def read(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))
def require(condition, message):
    if not condition:
        raise ValueError(message)

manifest = read(BASE / 'sources/manifest.json')
pages = read(BASE / 'source-analysis/page-ledger.json')['pages']
concepts = read(BASE / 'source-analysis/concept-index.json')['concepts']
page_map = {(p['lectureId'], p['pdfPage']): p for p in pages}
concept_map = {c['id']: c for c in concepts}
require(len(page_map) == manifest['total_pdf_pages'] == len(pages), 'PDF page ledger is incomplete or duplicated')
for lecture in manifest['lectures']:
    path = BASE / 'sources' / lecture['path']
    require(hashlib.sha256(path.read_bytes()).hexdigest() == lecture['sha256'], f'Original changed: {path}')
    actual = sorted(p['pdfPage'] for p in pages if p['lectureId'] == lecture['id'])
    require(actual == list(range(1, lecture['pdf_pages'] + 1)), f'Non-contiguous pages: {lecture["id"]}')
    markdown = (BASE / 'source-analysis/lectures' / (lecture['id'] + '.md')).read_text(encoding='utf-8-sig')
    for number in actual:
        require(re.search(rf'(?im)^##+\s+PDF page\s+{number}\b', markdown), f'Missing Markdown page: {lecture["id"]} {number}')
for page in pages:
    require(page['visualReview'] == 'reviewed', 'Unreviewed page')
    require('printedSlide' in page, 'Missing separate printed-slide mapping')
    require(all(cid in concept_map for cid in page['conceptIds']), 'Unknown concept on page')

bank_path = BASE / 'activities.json'
if not bank_path.exists():
    print(f'Source gate passed: {len(pages)} pages; {len(concepts)} concepts. No activity bank yet.')
    sys.exit(0)

bank = read(bank_path)
require(bank['schemaVersion'] == 1 and bank['subjectId'] == args.subject, 'Wrong bank schema/subject')
ids, prompts = set(), set()
type_counts = {}
for a in bank['activities']:
    label = a.get('id', '<missing ID>')
    require(label not in ids, f'Duplicate activity ID: {label}')
    ids.add(label)
    normalized = re.sub(r'\W+', '', a['prompt']).lower()
    require(normalized not in prompts, f'Duplicate prompt: {label}')
    prompts.add(normalized)
    require(a['revision'] >= 1 and a['status'] == 'validated', f'Unvalidated item: {label}')
    require(a['type'] in ('mcq', 'match', 'order', 'diagram'), f'Unsupported interaction: {label}')
    type_counts[a['type']] = type_counts.get(a['type'], 0) + 1
    require(a['conceptIds'] and all(c in concept_map for c in a['conceptIds']), f'Unknown concepts: {label}')
    require(all(concept_map[c]['lectureId'] == a['lectureId'] for c in a['conceptIds']), f'Cross-lecture concepts need explicit support: {label}')
    require(a['sourceRefs'], f'No source refs: {label}')
    for ref in a['sourceRefs']:
        key = (ref['lectureId'], ref['pdfPage'])
        require(key in page_map and page_map[key]['kind'] == 'teaching', f'Invalid/non-teaching source: {label} {key}')
        if 'printedSlide' in ref:
            require(ref['printedSlide'] == page_map[key]['printedSlide'], f'Invented printed slide: {label}')
    for cid in a['conceptIds']:
        concept_pages = {(r['lectureId'], r['pdfPage']) for r in concept_map[cid]['sourceRefs']}
        item_pages = {(r['lectureId'], r['pdfPage']) for r in a['sourceRefs']}
        require(concept_pages & item_pages, f'Concept tagged without a supporting page: {label} {cid}')
    require(all(a['review'].get(k) is True for k in ('sourceChecked', 'ambiguityChecked', 'cueChecked', 'bilingualChecked')), f'Incomplete review: {label}')
    require(a['explanation']['en'].strip() and re.search(r'[\u0600-\u06ff]', a['explanation']['ar']), f'Incomplete bilingual explanation: {label}')
    if a['type'] in ('mcq', 'diagram'):
        opts = a['options']
        require(len(opts) == 5 and len({o['id'] for o in opts}) == 5, f'MCQ must have five distinct options: {label}')
        require(len({o['text'].strip().lower() for o in opts}) == 5, f'Duplicate option text: {label}')
        require(a['correctOptionId'] in {o['id'] for o in opts}, f'Invalid correct answer: {label}')
        require(all(o['evidence'].strip() for o in opts), f'Missing distractor evidence: {label}')
        require(not any(re.search(r'\b(all|none) of the above\b', o['text'], re.I) for o in opts), f'Answer cue: {label}')
    if a['type'] == 'match':
        pairs = a['pairs']
        require(len(pairs) >= 2 and len({p['id'] for p in pairs}) == len(pairs), f'Invalid pairs: {label}')
        require(len({p['left'] for p in pairs}) == len(pairs) and len({p['right'] for p in pairs}) == len(pairs), f'Non-unique match mapping: {label}')
    if a['type'] == 'order':
        item_ids = {i['id'] for i in a['items']}
        grouped = [x for group in a['acceptedGroups'] for x in group]
        require(len(grouped) == len(item_ids) and set(grouped) == item_ids, f'Invalid ordering groups: {label}')
    if a['type'] == 'diagram':
        asset = a['asset']
        asset_path = (BASE / asset['path']).resolve()
        require(asset_path.is_relative_to(BASE.resolve()) and asset_path.exists(), f'Missing/unsafe diagram asset: {label}')
        require((asset['lectureId'], asset['pdfPage']) in page_map, f'Missing diagram provenance: {label}')
for concept in concepts:
    expected = {a['id'] for a in bank['activities'] if concept['id'] in a['conceptIds']}
    require(expected == set(concept['activityIds']), f'Stale coverage ledger: {concept["id"]}')

synthesis_dir = BASE / 'synthesis'
synthesis_count = 0
if synthesis_dir.exists():
    def check_refs(obj, label):
        if isinstance(obj, dict):
            if 'sourceRefs' in obj:
                for ref in obj['sourceRefs']:
                    key = (ref['lectureId'], ref['pdfPage'])
                    require(key in page_map and page_map[key]['kind'] == 'teaching', f'Invalid synthesis source ref: {label} {key}')
            for k, v in obj.items():
                check_refs(v, f'{label}.{k}')
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                check_refs(item, f'{label}[{i}]')
    for json_file in sorted(synthesis_dir.glob('*.json')):
        sdata = read(json_file)
        check_refs(sdata, json_file.name)
        synthesis_count += 1

print(f'Validated structure/provenance: {len(pages)} pages, {len(concepts)} concepts, {len(ids)} activities {type_counts}, {synthesis_count} synthesis modules.')
