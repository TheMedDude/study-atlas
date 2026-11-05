# Study Atlas project log

## 2026-11-05 - Discovery and repository handoff

- Completed product discovery and source inventory: six Molecular Biology PDFs, 191 PDF pages including covers/admin pages.
- Confirmed a general multi-subject platform; Molecular Biology is the first subject.
- User approved Study Atlas, repository slug study-atlas, public visibility, and TheMedDude as owner.
- Verified the connected GitHub identity and created the public repository.
- Preserved unchanged PDF copies and a hash-based manifest under subjects/molecular-biology/sources/.
- Completed Git authentication as TheMedDude and pushed the handoff plus all six lecture PDFs.
- Verified all six remote PDF blob hashes and byte sizes against the original copies.
- Local repository tracks the public origin/main branch.
- Full source extraction, coverage analysis, question bank, application implementation, and website deployment have not started.

## 2026-11-05 - Complete source extraction and analysis

- Continued in the original checkout on main at 6e6ffac; fetched origin and verified GitHub CLI as TheMedDude (ID 352966162).
- Reverified all six immutable source SHA-256 hashes, extracted embedded text, and rendered all 191 PDF pages.
- Completed faithful, page-indexed Markdown for all six lectures (about 24,000 words), including diagram labels/relationships, screenshot tables, numerical values, and footnotes.
- All 191 pages visually reviewed. Additional independent QA sampled 27 dense pages; coordinating review also inspected nine pages with some overlap. Corrected source-layer provenance and exponent-formatting normalization found during review.
- Classified 183 teaching pages, 6 covers, and 2 administrative pages. No printed slide numbers were visible; PDF pagination is recorded separately from nullable printed-slide numbering.
- Built 303 indexed concepts, 50 source uncertainty entries, chapter/topic indices, a page ledger, and coverage CSV. No outside biology facts added; uncertain claims remain preserved and blocked from determining scored answers.
- Source gate passed via build_source_index.py and validate_content.py, including exact page sequences and original hashes.
- Defined source-linked activity schema and coverage/performance/evidence rules in docs/CONTENT_MODEL.md before question authoring.
- Began candidate activity authoring after the source gate. Candidates require independent evidence, ambiguity, cue, and bilingual review before app integration. The application and live website are not yet complete at this checkpoint.

## 2026-11-05 - Reviewed bank and application release candidate

- Authored and independently reviewed all six lecture activity banks after the source gate. Compiled 222 validated items: 129 five-option MCQs, 67 matching, 24 ordering and 2 original-diagram activities. Removed one near-duplicate during independent review.
- All 227 core concepts have scored activity coverage; 234 of 303 total concepts have activities. The other 69 supporting or uncertain concepts have explicit deferrals and remain visible in source coverage and the full study source.
- Reviewed every answer, distractor/pair/sequence, exact source references, real concept tags, English/Arabic fidelity, formatting cues, uncertainty boundaries and equivalent/parallel steps. Release gate rejects candidates or missing independent review fields.
- Implemented the general subject registry/configuration and warm editorial static interface with Practice, Exam, weak-area review, concept drills, Settings, source materials and progress views. First-subject scope, option count and languages remain configuration.
- Implemented immediate/default and confirm-based practice, fixed exam sets with optional timers, honest distinct-item evidence, different-variant priority, local subject/scope progress, export/import, cross-tab reconciliation, clear generations, activity-revision archives and bounded portable history. No student accounts or progress uploads.
- Native PDF embeds were blank in the in-app browser. Added 191 faithful lossless WebP page renders (1440x1080, 35.71 MiB), verified image/source hashes and decoded pixels, and used them for portable side/full source viewing. Original PDFs remain downloadable.
- Browser QA verified instant/confirm practice, Arabic explanations, fixed exams with delayed results, unanswered accounting, real one-minute timer expiry, matching, keyboard ordering with retained focus, full result details, gel diagram choices, source pagination, and a 390x844 responsive viewport without document overflow.
- Browser exported a real 4,139-byte backup; its parser restored all 19 QA attempts and repeated merge added zero. No QA progress entered Git. Direct file-picker import UI verification was interrupted by a browser automation kernel failure; core restore/validation behavior is covered by automated storage tests and the actual export.
- npm run check and all 44 automated tests passed. scripts/build_bank.py provenance and coverage gates passed. Added CI using verified official actions/checkout v7.0.1 and actions/setup-node v7.1.0, Node22.
- This entry is a release-candidate checkpoint. GitHub Pages is not yet configured at this point; deployment will be verified separately below.
