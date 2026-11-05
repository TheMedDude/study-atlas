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
