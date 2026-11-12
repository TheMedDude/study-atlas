# Code arrangement and extension boundaries

## Runtime

Static ES modules with no browser package dependencies. index.html loads bundled fonts, tokens, component styles, responsive overrides and app/app.js. Serve over HTTP; file:// cannot fetch content. No production API, accounts or payments exist.

## Responsibilities

| Location | Owns | Must not own |
| --- | --- | --- |
| app/app.js | Routes, render, DOM actions, course loading, source viewer | Teaching truth or billing |
| app/model.js | Scoring, evidence, selections/results | Browser persistence |
| app/storage.js | Settings/history, backup, merge/reset/archive | Layout |
| app/study.js | Bookmarks/resume, attempts/order, tombstones | Altering history identity |
| app/notes.js, app/pdf.js | Factual notes/direct PDF export | Invented facts |
| app/tokens.css | Visual primitives | Route-specific layout |
| app/styles.css | Incumbent component styles | Competing global palette |
| app/responsive.css | Final responsive/touch contracts | Teaching data |
| subjects/index.json | Course registry | UI hardcoded totals |
| subjects/<id>/subject.json | Scope, languages, assessment, paths | Global account policy |
| sources/ | Original PDFs, manifest, renders/provenance | Questions |
| source-analysis/ | Detailed source, indices, coverage, uncertainty/deferrals | Hidden assumptions |
| activities/ | Reviewed lecture records | Unreviewed drafts |
| activities.json | Compiled release | Independent authoring |
| synthesis/ | Subject-connected reference tools | Scored evidence from reveals |
| work/, outputs/ | Ignored drafts/QA working artifacts | Sole durable release truth |

## Data flow

PDF -> faithful extraction/visual QA -> page/concept index and uncertainty -> blueprint/candidates -> independent review -> reviewed records -> staged compile -> app fetch -> pure scoring -> local history/study state -> backup.

Preserve exact refs through every layer. History/study keys include subject and scope; settings are separate. Cross-tab reconciliation, reset generations, archived revisions and session tombstones are deliberate. Do not reduce these to last-write-wins snapshots.

## Run/check

```sh
npm run dev
npm run check
npm test
python -m unittest discover -s tests -p test_bank_transaction.py -v
python scripts/validate_content.py --subject pharmacology
```

Source tooling needs pypdf, pypdfium2 and Pillow. Rebuild only after verifying current reviewed files:

```sh
python scripts/build_source_index.py --subject pharmacology
python scripts/build_bank.py --subject pharmacology
```

Optional browser regression: install Playwright in the development environment and run npm run test:browser. PLAYWRIGHT_MODULE can select its module URL; CHROME_PATH can select installed Chrome. These are QA dependencies, never downloads required of students. Tests start a local server and isolated contexts, not the owner's browser profile.

## Arrangement debt

app/app.js is still a large combined view/controller. Legacy CSS contains repeated desktop/mobile declarations. 1.3 adds an explicit final responsive owner rather than a risky wholesale rewrite. Later, extract navigation/source viewer, session rendering and Memorize adapters incrementally behind behavior checks. Avoid changing progress schemas and UI together.

Before a backend, introduce a catalog/content repository boundary and a separate student-data service. Preserve IDs/revisions. A static public bank cannot enforce paid access by hiding a button. See SUBSCRIPTION_FOUNDATION.md.
