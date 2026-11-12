# Study Atlas project handoff

Read `docs/DISCOVERY.md` and `subjects/molecular-biology/sources/manifest.json` before starting. For Pharmacology work, also read `subjects/pharmacology/DISCOVERY.md`, its source manifest and `docs/PHARMACOLOGY_HANDOFF.md`. The user's latest requirements take precedence over older drafts.

## Current stage

Version 1.2.14 adds Pharmacology to the existing Molecular Biology and Antigravity General Microbiology subjects. Pharmacology has 538 independently reviewed activities (483 five-option MCQs, 51 matching, 4 ordering) from 283 reviewed PDF pages: 269 teaching and 14 exclusions. Its 576-entry source index preserves 66 source notes and explicit coverage deferrals. Chapters 1–3 prioritize principles over illustrative drug-name/function recall; chapter 4 assesses ANS foundations and drug-specific distinctions. Do not restart the superseded Microbiology task or overwrite its completed bank.

Molecular Biology remains 694 activities (601 MCQs); General Microbiology remains 428 (409 MCQs). The shared static app includes the existing study modes, source viewing, device progress, backups, saved questions, resumable practice, Question Library and Memorize features. Current release QA and deployment evidence belong in PROJECT_LOG.md, docs/QA.md and docs/PHARMACOLOGY_HANDOFF.md. A push is not proof of live deployment.

## Account constraint

The user explicitly requires TheMedDude (GitHub user ID 352966162), verified through the connected GitHub integration. The user selected public visibility for TheMedDude/study-atlas, including the supplied lecture PDFs. Verify any browser or CLI authentication separately and ensure it matches TheMedDude before creating repositories, pushing commits, or configuring Pages. Do not change or remove other account credentials as a shortcut. Do not upload private progress data or credentials.

## Content constraints

For the first subject, Molecular Biology, use only the six supplied lecture PDFs as authoritative teaching sources. Do not use outside biology information to add content or silently repair uncertain slides. Flag uncertainties and do not score unresolved claims. Do faithful extraction and indexing before study-question generation, and verify content before integrating it into an application. Future subjects need their own authoritative sources and validation; do not invent additional subject content now.

Ask the biology directly as factual, self-contained questions; do not frame stems or explanations as what the source/slide/lecture says. Keep necessary biological conditions and source links with explanations; a displayed diagram may be referenced. New variants must test a different distinction or application, not merely paraphrase another item. Five-option MCQs must have plausible, parallel distractors without formatting clues. Recognition activities must not be reported as proof of unaided recall. No typed responses, self-grading prompts, or confidence prompts. Track coverage separately from performance and from insufficient evidence.

## Workflow

Maintain a project log as work progresses. Favor simple modular static files and source-relative paths; choose implementation details to support the confirmed UX. Do not require accounts or a paid runtime for the first version. Preserve original files and map every activity to its exact source page. A GitHub repository and a live website must be reported separately.

Keep subjects, sources, assessment scopes, activity banks, and progress separable. Preserve every confirmed Molecular Biology choice in `docs/DISCOVERY.md`, while treating its midterm scope, five-option MCQs, and language settings as the first subject's configuration rather than permanent platform restrictions. Do not reopen completed product discovery or seek repeated approval for the authorized repository setup.

## Source analysis checkpoint

The consolidated Markdown and per-lecture source records are complete. Run scripts/build_source_index.py and scripts/validate_content.py with Python dependencies pypdf, pypdfium2, and Pillow available. Lecture banks under subjects/molecular-biology/activities/ have been independently reviewed. New or changed items require renewed review before rebuilding activities.json. Read docs/CONTENT_MODEL.md for activity evidence and progress rules. Only validated items enter the app. Every clear core concept needs activity coverage or an explicit source-based deferral; supporting detail stays visible even without activities.

## Development and release checks

Use the existing checkout; do not create a new checkout for routine continuation. The browser app has no dependencies. Run npm run check and npm test, plus `python -m unittest discover -s tests -p test_bank_transaction.py -v`; source/content builds use scripts/build_bank.py. Faithful page renders under sources/pages/ make the viewer work without a native PDF plug-in. Preserve their source/hash provenance and original PDFs.

Do not overwrite reviewed banks with obsolete work/ authoring scripts. Keep stable IDs and increment revisions when scored meaning changes. Only independently validated records enter the compiled bank. Progress files and QA browser history must never be committed.

Settings and subject/scope progress are separate. Cross-tab saves reconcile; clears use resetProgress, not an empty old-generation snapshot. Archived responses are excluded from current evidence. Keep backup compatibility, retention-window notices, and failure copy truthful.

Saved questions and resumable sessions use a separate subject/scope study-state key. Preserve existing answer-history keys and legacy backups. Practice answers count when checked; leaving or skipping never erases checked history or fabricates evidence. Resume keeps stable attempt IDs and shuffled order; closed-session tombstones must prevent stale-tab resurrection. Updates is a plain oldest-to-newest list, opening scrolled to the newest entry at the bottom.

Bank builds now validate a staged subject tree before replacing compiled content. Use `--subject pharmacology` for its source/content scripts. Keep source-based deferrals explicit and never score a blocked concept. Reviewed lecture records must exactly match the compiled bank.
