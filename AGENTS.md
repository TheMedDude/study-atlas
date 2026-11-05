# Study Atlas project handoff

Read `docs/DISCOVERY.md` and `subjects/molecular-biology/sources/manifest.json` before starting. The user's latest requirements take precedence over older drafts.

## Current stage

Product discovery, source extraction, source QA, activity authoring and independent content review are complete. All 191 PDF pages are reviewed: 183 teaching pages, 8 cover/administrative exclusions, 303 indexed concepts and 50 uncertainty records. The compiled bank has 222 validated activities, covering all 227 core concepts and 234 total concepts; 69 supporting/uncertain concepts have explicit deferrals. See source-analysis/INDEX.md, QA.md and activity-review-summary.json.

The shared static application is implemented with Practice, Exam, concept drills, weak-area review, source page viewing, device progress and backup/restore. Read docs/QA.md and the latest PROJECT_LOG.md entry for verification and deployment status. A public repository and a live website remain separate facts; do not infer deployment from a push alone.

## Account constraint

The user explicitly requires TheMedDude (GitHub user ID 352966162), verified through the connected GitHub integration. The user selected public visibility for TheMedDude/study-atlas, including the supplied lecture PDFs. Verify any browser or CLI authentication separately and ensure it matches TheMedDude before creating repositories, pushing commits, or configuring Pages. Do not change or remove other account credentials as a shortcut. Do not upload private progress data or credentials.

## Content constraints

For the first subject, Molecular Biology, use only the six supplied lecture PDFs as authoritative teaching sources. Do not use outside biology information to add content or silently repair uncertain slides. Flag uncertainties and do not score unresolved claims. Do faithful extraction and indexing before study-question generation, and verify content before integrating it into an application. Future subjects need their own authoritative sources and validation; do not invent additional subject content now.

Five-option MCQs must have plausible, parallel distractors without formatting clues. Recognition activities must not be reported as proof of unaided recall. No typed responses, self-grading prompts, or confidence prompts. Track coverage separately from performance and from insufficient evidence.

## Workflow

Maintain a project log as work progresses. Favor simple modular static files and source-relative paths; choose implementation details to support the confirmed UX. Do not require accounts or a paid runtime for the first version. Preserve original files and map every activity to its exact source page. A GitHub repository and a live website must be reported separately.

Keep subjects, sources, assessment scopes, activity banks, and progress separable. Preserve every confirmed Molecular Biology choice in `docs/DISCOVERY.md`, while treating its midterm scope, five-option MCQs, and language settings as the first subject's configuration rather than permanent platform restrictions. Do not reopen completed product discovery or seek repeated approval for the authorized repository setup.

## Source analysis checkpoint

The consolidated Markdown and per-lecture source records are complete. Run scripts/build_source_index.py and scripts/validate_content.py with Python dependencies pypdf, pypdfium2, and Pillow available. Lecture banks under subjects/molecular-biology/activities/ have been independently reviewed. New or changed items require renewed review before rebuilding activities.json. Read docs/CONTENT_MODEL.md for activity evidence and progress rules. Only validated items enter the app. Every clear core concept needs activity coverage or an explicit source-based deferral; supporting detail stays visible even without activities.

## Development and release checks

Use the existing checkout; do not create a new checkout for routine continuation. The browser app has no dependencies. Run npm run check and npm test; source/content builds use scripts/build_bank.py. Faithful page renders under sources/pages/ make the viewer work without a native PDF plug-in. Preserve their source/hash provenance and original PDFs.

Do not overwrite reviewed banks with obsolete work/ authoring scripts. Keep stable IDs and increment revisions when scored meaning changes. Only independently validated records enter the compiled bank. Progress files and QA browser history must never be committed.

Settings and subject/scope progress are separate. Cross-tab saves reconcile; clears use resetProgress, not an empty old-generation snapshot. Archived responses are excluded from current evidence. Keep backup compatibility, retention-window notices, and failure copy truthful.
