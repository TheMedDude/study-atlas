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

## 2026-11-05 - Public deployment verified

- Pushed application/content release 23476c2 and regression suite 1c76e100e893bc2e6c0346b35da2940130080fba to origin/main as verified TheMedDude. The tests were omitted from the first staging list and added in the next normal commit before enabling Pages; no history rewrite was used.
- Exact-head CI run 42077170918 passed syntax validation and all 44 tests (44 passed, 0 failed, 0 skipped): https://github.com/TheMedDude/study-atlas/actions/runs/42077170918 .
- Enabled GitHub Pages with legacy branch publishing from main root. No student progress or credentials were uploaded.
- Verified deployment run 42077539291 and build 1344137246 succeeded for 1c76e100e893bc2e6c0346b35da2940130080fba: https://github.com/TheMedDude/study-atlas/actions/runs/42077539291 .
- Live website: https://themeddude.github.io/study-atlas/ . Public HTTP checks returned 200 for index, app script, activity bank (222 validated), a full source-page WebP, and an original PDF. Source repository: https://github.com/TheMedDude/study-atlas .
- Saved a portable standalone Markdown deliverable with all 191 page sections in this chat's outputs folder; source links point to the published originals.
- Final handoff adds the live link and deployment record, neutralizes session-leave copy for storage-failure visits, and provides a source-close focus fallback. The latest main build is checked separately after this commit.
- Remaining verification limit: browser automation failed while awaiting a download event, preventing direct file-picker import UI completion and final browser-tool cleanup. A real exported backup restored 19 attempts through the production parser and deduplicated correctly; restore/persistence behavior passed automated tests. Physical mobile devices were not tested. Account syncing and full offline capability remain future preferences, not launch claims.


## 2026-11-05 - Documents workspace relocation

- Synchronized and SHA-256 verified all 551 repository/work files (122,636,759 bytes), preserving Git history at c530fafb413e7a7e0c582e9b7ebbaa2064dd43c0.
- Preserved the exported detailed study source under outputs/.
- Canonical project checkout: C:\Users\musta\OneDrive\Documents\study-atlas.
- Original checkout remains an unchanged backup.
- File synchronization is complete. The existing Build Study Atlas chat still requires the user sidebar move into the study-atlas project to apply its new folder access; the programmatic project move preserved the old recorded working directory.

### Chat project membership verified

Both `Plan molecular biology study engine` and `Build Study Atlas` are now members of the local `study-atlas` project (36cc0b56-5e0c-4b0d-8ab6-269a0bbb35c2). The app still records their original working directories, so project membership is complete but the chat working-directory relocation is not yet verified. The supported folder-access step is to move each chat to Recents and then back into study-atlas through the user sidebar. Do not remove membership programmatically again. Documents remains the canonical file workspace; the old checkout remains an unchanged backup.

## 2026-11-05 — Question style, bank expansion and typography revision (in progress)

- User requested substantially more questions, direct factual biology prompts instead of source-framed wording, and replacement fonts for both English and Arabic. Preserved those latest requirements in DISCOVERY.md and CONTENT_MODEL.md.
- Split six lecture banks between three authors. Existing edited records and new additions require renewed independent review before compilation; original PDFs and unresolved-claim boundaries remain unchanged.
- Checked established learning-app typography guidance (Duolingo) and official Inter/Noto resources. Bundled Inter variable WOFF2 and Noto Sans Arabic variable TTF with their SIL Open Font Licenses; removed Georgia/Times/Tahoma styling, resized questions and answers, and increased Arabic explanation readability. Added 25/50/100 session presets where the bank permits.
- In-app browser and Node REPL tools both fail during initialization with “failed to write kernel assets … (os error 3).” Local visual QA uses the existing bundled Playwright library with an isolated headless Chrome context instead. No browser profile/progress data is committed.
- Initial browser checks loaded both actual bundled fonts, confirmed 26.4px English question / 16px answer text and 18px RTL Arabic explanations, and found no horizontal overflow at 1440px or 390px. Desktop and mobile screenshots inspected; final expanded-bank verification and publication are pending.

### Workspace relocation complete

The Codex app now confirms `Build Study Atlas` (01a1ac87-ac3b-71e1-a4e7-befadf4070c5, local) uses `C:\Users\musta\OneDrive\Documents\study-atlas` as its recorded working directory under project `study-atlas` (36cc0b56-5e0c-4b0d-8ab6-269a0bbb35c2). This resolves the previously pending folder-access step. Documents is the active canonical workspace. The old checkout remains an unchanged backup; no synchronization or removal was repeated. The relocation monitor is complete.


## 2026-11-05 — Reviewed expansion and interface release candidate

- Final cross-reviewed bank: **694 validated activities**, including **601 five-option MCQs** (previously 129), 67 matching, 24 ordering and 2 original-diagram items. Added 472 MCQs while preserving all 222 original IDs. Independent reviewers pruned 59 weak/near-duplicate candidates and corrected ambiguity, distractor parallelism, Arabic phrasing, source mappings and concept tags.
- All 227 core concepts retain activity coverage; total activity availability increased from 234 to 278 of 303 concepts. The remaining 25 supporting/uncertain concepts have explicit deferrals. Original six PDF hashes, 191-page ledger and 50 uncertainty records remain unchanged. Updated provenance/coverage artifacts through build_bank.py and its source/content gates.
- All stems ask biology directly, with necessary conditions retained and source references in explanations. English and Arabic explanations no longer narrate what a source/slide says. Six original items received revision 2 where scored meaning changed; previous responses remain handled by the existing archive rules.
- Bundled fonts, smaller sans-serif question headings, clearer answer text, RTL Arabic explanation typography, Arabic Settings labels, and 25/50/100 presets passed independent code review. Versioned CSS/app URLs and no-cache JSON revalidation help returning browsers receive the revised release.
- Local npm run check and **45/45 tests passed**. Global direct-copy, prompt-uniqueness and concept/source checks passed. Isolated Chrome 156 verified 100-question practice/exam sessions, delayed exam feedback, 1/100 with 99 unanswered, real Inter/Noto font loads, source viewing, Settings Arabic font, and desktop/mobile/larger-text layouts. Screenshots and QA progress remain ignored under work/.
- This is the validated local release candidate. The public website still requires a push and a separately verified Pages deployment for these changes; that result is recorded below when complete.
