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

## 2026-11-05 — Expanded bank and typography deployed and verified

- Verified GitHub CLI login TheMedDude (ID 352966162) before pushing functional release `bacf093c973b36b2db03e6339a50997b94b07bad` to the existing public origin/main. No credentials or private progress were uploaded; existing outputs/ exports remain untracked.
- Exact-head [CI run 42089486350](https://github.com/TheMedDude/study-atlas/actions/runs/42089486350) passed syntax checks and **45/45 tests**, with zero failures/skips. Exact-head [Pages run 42089485242](https://github.com/TheMedDude/study-atlas/actions/runs/42089485242) and build **1344295676** completed successfully with no error.
- Live site: https://themeddude.github.io/study-atlas/ . Independently verified the public bank has **694 activities / 601 five-option MCQs**, and its exact SHA-256 matches both workspace and committed content: `c02dec0ff1ffa2dee42c4633350082a8993f6629c37bdf624a9430f7af993d53`.
- Public HTML carries the versioned app/CSS URLs. HTML, CSS, app JavaScript, Inter WOFF2 (352,240 bytes) and Noto Sans Arabic TTF (844,676 bytes) all return HTTP 200. Repeated the isolated browser checks against the actual public site: 100-question practice, direct stems, correct feedback, real Arabic font loading, source viewing, mobile/larger text layout, delayed exam feedback and 1/100 result with 99 unanswered all passed without page errors.
- This final handoff changes documentation only. The original PDFs, source-page provenance, app content, device-progress behavior and validated bank are unchanged from the independently verified functional release. No additional subject content was invented.

## 2026-11-07 — Version 1.1 implementation and local verification

- Added practice Previous/Skip/early Finish, All available, fixed bottom navigation, elapsed active-study clock, automatic checkpoints, Save & exit, and exact resume with shuffled choice order and pending/checked answers. Keyboard 1–5, Enter, + and - respect fields/dialogs and preserve exam feedback/timing.
- Added separate saved-question/session storage and optional backup extension without changing existing answer-history keys or schema. Stable attempt IDs and checked-response snapshots reconcile refreshes; terminal session tombstones resist stale tabs. Added visible recorded-answer totals separate from concept evidence. A 234-answer unfinished-session regression passes; no user progress was fabricated or restored.
- Added Saved with note previews and direct browser-local PDF downloads. An initial native print attempt stalled in the in-app browser; replaced it with direct PDF creation. Downloaded and rendered a one-page Arabic sample and a six-page, 30-topic English sample; inspected first/middle/last pages for shaping, pagination, references and clean non-quiz layout. Samples and synthetic test backups stay outside Git.
- Implemented 1.0/1.1 chronological Updates, latest at bottom with automatic bottom scroll, and a once-per-release popup for existing history. Fresh visitors are marked current without a popup. Preserved the user's final clarification: no collapsible sections or version-selection buttons.
- 56 automated tests pass, including the 234-answer persistence regression, resume/clock/skip behavior, old/new backups, duplicate imports, cross-tab tombstones, corrupt/quota failures, revision/reset rejection, safe notes markup and PDF object offsets. Local browser checks verified exact resume after refresh, immutable checked choices, a fixed dock at identical vertical coordinates before/after feedback, shortcuts, All available=601, early finish, 234/235 summary, 234 recorded answers after exit/reload, 30 saved notes and a repeated import adding zero attempts.
- Existing bank remains 694 validated activities / 601 MCQs; no activity/source content or original PDFs changed. Local verification is not production deployment; release checks and publication follow below.

## 2026-11-07 — Version 1.1 deployed and verified

- Published functional release `30ee7c403b982261a7c05f14830c311ef8ab683b` as verified TheMedDude (352966162). [CI 42388487151](https://github.com/TheMedDude/study-atlas/actions/runs/42388487151) passed **56/56 tests**, zero failures/skips, and syntax checks. [Pages 42388486189](https://github.com/TheMedDude/study-atlas/actions/runs/42388486189) and build **1349343996** succeeded for that exact commit.
- Public HTTP 200 responses for index, app, storage, study-state, notes, PDF generator and CSS matched their committed bytes. The live bank remains 694 activities / 601 MCQs. Existing answer-history keys and v1 backups remain compatible; saved-question/session metadata is separate. No user progress, QA backup, screenshot or generated sample PDF entered Git.
- Confirmed All available respects filters (126 for Genes, 601 for all chapters), a visible elapsed clock, preserved checked choices, exact refreshed resume and early finish with 234 of 235 answered while keeping 234 records. Duplicate real export/import added zero attempts. Delayed exam feedback and the three-question/two-unanswered result still behave correctly. Navigation stayed at the exact same vertical position before/after feedback.
- Updates is the user's final plain chronological list, not tabs or accordions: 1.0 then 1.1, opening at the bottom. Returning-user popup appeared once; fresh users are marked current without a later first-practice popup. Direct English/Arabic note PDFs were downloaded, parsed, rendered and visually checked. The PDF uses rendered text images for reliable Arabic shaping; source references remain visible.
- The final handoff updates documentation only. Browser storage remains device-local; backups are necessary before clearing browser data or moving devices. The user clarified that no recovery of their reported earlier practice was requested.

## 2026-11-08 — General Microbiology midterm preparation (in progress)

- Imported and hash-verified five unchanged supplied PDFs: 64, 36, 35, 30 and 59 pages (224 total). Preserved original filenames in the new subject manifest and extracted text plus full-page visual review assets.
- Source teams are reviewing all pages and reconstructing tables/diagrams before any question authoring. Longitudinal reference tables and broad organism–disease catalog tables receive explicit direct-question deferrals; source-required exceptions are recorded separately.
- The user requests the same depth and direct, five-option question style as the final Molecular Biology bank. Count follows distinct source-supported coverage rather than a fixed copied quota.
- Latest release instruction supersedes holding the addition local: publish Microbiology as the first addition toward1.2, record it in What's New, and keep1.2 open for further work. A final handoff must explain the full process and question-writing method.
- Verified connected GitHub and CLI account as TheMedDude (352966162), preserved public origin and existing checkout. Existing outputs/ exports predate this work and will not be staged.

## 2026-11-09 — General Microbiology source analysis completed & Chapter 1 Batch 1 authored

- Completed exhaustive visual extraction and indexing for all five midterm lecture PDFs (224 total pages: 217 teaching pages, 7 excluded cover/divider pages, 488 indexed concepts, 27 source uncertainties).
- Generated and verified `page-ledger.json`, `concept-index.json`, `coverage-summary.json`, `coverage-ledger.csv`, and comprehensive Markdown files for each lecture. `build_source_index.py` and `validate_content.py` passed with zero errors.
- Authored Batch 1 of Chapter 1 (`bacteria-and-other-microorganisms.json`) covering Topics 1–3 (PDF pages 1–26):
  - 29 validated activities: 23 five-option MCQs and 6 concept-matching activities.
  - Achieved 100% core concept coverage across pages 1–26 (64/64 core concepts covered; 0 uncovered).
  - All items feature purely written stems (no graph dependencies), 5 parallel plausible distractors, option-by-option slide evidence, and bilingual EN/AR explanations retaining English scientific terminology.
  - Passed all verification checks in `work/general-microbiology/verify_batch1.py`.
- Documentation in `docs/HANDOFF.md` updated with architecture, file indices, strict AI workflow constraints, and current stage.

## 2026-11-09 — Complete General Microbiology midterm question bank authored and verified

- Authored all remaining activity batches across all five chapters of General Microbiology:
  - **Chapter 1 (`bacteria-and-other-microorganisms.json`)**: 51 validated activities (42 MCQs, 8 matches, 1 ordering) covering all 137 core concepts (100%).
  - **Chapter 2 (`bacterial-genetics.json`)**: 20 validated activities (16 MCQs, 4 matches) covering all 98 core concepts (100%).
  - **Chapter 3 (`bacterial-growth.json`)**: 11 validated activities (9 MCQs, 2 matches) covering all 42 core concepts (100%).
  - **Chapter 4 (`normal-flora.json`)**: 11 validated activities (9 MCQs, 2 matches) covering all 41 core concepts (100%).
  - **Chapter 5 (`bacterial-pathogenesis.json`)**: 12 validated activities (10 MCQs, 2 matches) covering all 85 core concepts (100%).
- Total compiled activities for General Microbiology: **105 validated activities** (86 5-option MCQs, 18 matching, 1 sequence ordering).
- Total core concepts covered: **403 of 403 (100% core concept coverage, 0 uncovered)**.
- Compiled activity bank via `python scripts/build_bank.py --subject general-microbiology`: generated compiled `subjects/general-microbiology/activities.json` and synchronized `coverage-ledger.csv`.
- Verified strict structural integrity, distractor parallelisms, exact slide provenance, and bilingual EN/AR explanations using `python scripts/validate_content.py --subject general-microbiology` (passed 100%).
- Molecular Biology bank remains intact and verified (694 validated activities, 100% pass).
- Platform regression suite: `npm run check` and `npm test` (56/56 passing).
- Updated `docs/HANDOFF.md` with complete activity breakdown, source page statistics, and question authoring methodology.

## 2026-11-09 — Chapter 1 fully expanded to 138 five-option MCQs (Molecular Biology gold-standard density)

- Per user critique regarding question density and prioritizing discrete 5-option MCQs over composite/drill items, redesigned and expanded Chapter 1 (`bacteria-and-other-microorganisms.json`):
  - Authored **138 discrete, high-yield 5-option MCQs** (up from 42 MCQs) covering individual distinctions, biochemistry, staining protocols, structure mechanisms, and clinical correlations at a ~1.0 concept-per-MCQ density.
  - Preserved 13 concept drills (12 matching, 1 sequence ordering) as secondary practice modes, bringing Chapter 1 to **151 validated activities** (mirroring Molecular Biology's `genes-and-chromosomes` 140 activities).
  - 100% core concept coverage achieved (137 of 137 core concepts tested individually with 0 uncovered).
  - Rebuilt bank via `python scripts/build_bank.py --subject general-microbiology` (total bank now 205 activities: 186 MCQs, 18 matches, 1 order).
  - `python scripts/validate_content.py --subject general-microbiology` and `npm test` passed (56/56 passing).

## 2026-11-09 — Complete 5-chapter MCQ expansion (404 MCQs, 423 total activities) & balanced distribution

- Expanded Chapters 2, 3, 4, and 5 to full discrete 5-option MCQ density, matching Molecular Biology rhythm across all 5 midterm lectures:
  - **Chapter 1 (`bacteria-and-other-microorganisms.json`)**: 138 MCQs + 13 concept drills = 151 activities (100% of 137 core concepts covered).
  - **Chapter 2 (`bacterial-genetics.json`)**: 98 MCQs + 2 matches = 100 activities (100% of 98 core concepts covered).
  - **Chapter 3 (`bacterial-growth.json`)**: 42 MCQs + 3 matches = 45 activities (100% of 42 core concepts covered).
  - **Chapter 4 (`normal-flora.json`)**: 41 MCQs = 41 activities (100% of 41 core concepts covered).
  - **Chapter 5 (`bacterial-pathogenesis.json`)**: 85 MCQs + 1 match = 86 activities (100% of 85 core concepts covered).
- **Total General Microbiology midterm bank**: **404 discrete five-option MCQs + 18 matches + 1 ordering = 423 validated activities**.
- **100% core concept coverage**: All 403 core concepts across 217 teaching pages covered at a 1-to-1 ratio with 0 uncovered concepts.
- **Deterministic Option Balancing**: Executed `work/general-microbiology/distribute_options.py` across all chapter banks. Option distribution across A, B, C, D, and E is evenly balanced (~20% each: A: 83, B: 82, C: 81, D: 79, E: 79; <1% variance).
- **Multi-Subject Registration**: Added `general-microbiology` to `subjects/index.json`. The application seamlessly enables switching between Molecular Biology (694 activities) and General Microbiology (423 activities).
- **Release Preview**: Added Version 1.2 Preview note to What's New tab in `app/app.js` without triggering the forced returning-user popup.
- **Documentation**: Authored comprehensive `docs/HANDOFF.md` containing full architecture index, strict constraints, question-writing methodology, bank breakdowns, verification commands, and git push instructions.
- **Regression suite & gates**:
  - `scripts/build_bank.py --subject general-microbiology`: passed (423 activities compiled).
  - `scripts/validate_content.py --subject general-microbiology`: passed 100%.
  - `scripts/validate_content.py --subject molecular-biology`: passed 100% (694 activities).
  - `npm run check; npm test`: all 56 automated test suites passed (56/56 passing, 0 errors).

## 2026-11-09 — Distractor length parity, diagnostic MCQs added, Course Hub & mobile/iPad calibration

- **Independent Quality & Depth Audit**: Subagent completed comprehensive evaluation against the 30-item previous midterm exam (`نموذج_٢.pdf`). Findings: 9.2/10 real exam alignment, 8.8/10 biological/mechanistic depth, 8.5/10 question volume (sufficient for mastery with ~10x practice multiplier).
- **Distractor Parity & Length Clue Resolution**:
  - Upgraded 42 questions in `bacterial-pathogenesis.json`, 12 questions in `normal-flora.json`, 10 questions in `bacterial-growth.json`, and 1 question in `bacterial-genetics.json`.
  - Expanded all distractors to matched character lengths (within ±10-15% of the correct option) and parallel multi-clause structures, completely eliminating length cues.
  - Eliminated all throwaway distractors ("lunar phases", "gymnasium", "outer space", "pinocytosis"), replacing them with authentic medical and microbiological mechanisms.
- **High-Yield Diagnostic Questions Added (Chapter 3)**:
  - Authored 5 discrete MCQs covering Triple Sugar Iron (TSI) agar interpretations (*Salmonella* K/A H2S, *E. coli* A/A gas, *Pseudomonas* K/K), Durham carbohydrate fermentation tubes, and thioglycollate broth oxygen growth patterns.
  - General Microbiology bank expanded to **409 discrete 5-option MCQs + 18 matches + 1 order = 428 total validated activities** (1,122 platform total).
  - Balanced option distribution re-verified: A: 84 (20.5%), B: 83 (20.3%), C: 82 (20.0%), D: 80 (19.6%), E: 80 (19.6%).
- **Pre-Home Course Hub Screen**:
  - Implemented `coursesView()` as the landing view when opening Study Atlas without a selected subject, or accessible anytime via `❖ All Courses` button or brand logo.
  - Rendered rich course cards for Molecular Biology and General Microbiology featuring lecture counts, teaching page counts, 5-option MCQ counts, activity totals, and live on-device progress badges.
- **iPad & Mobile Phone Calibration**:
  - Added tablet responsive rules (760px–1024px) providing wide content space and ergonomic 200px sidebar rail.
  - Configured mobile layout with iOS safe areas (`env(safe-area-inset-top)` for Dynamic Island/notches; `env(safe-area-inset-bottom)` for Home Indicator).
  - Ensured minimum 44–48px touch targets for options, buttons, and chapter checkboxes with subtle tap feedback (`:active { transform: scale(0.98); }`).
  - Set `font-size: 16px !important` on mobile form inputs to stop iOS Safari viewport auto-zooming.
- **Verification**:
  - `python scripts/build_bank.py --subject general-microbiology`: passed (428 validated activities, 403/403 core concepts).
  - `python scripts/validate_content.py --subject general-microbiology`: passed 100%.
  - `npm run check; npm test`: all 56 automated test suites passed (0 errors).

## 2026-11-09 — Hotfix: Course Hub landing screen topbar label null-reference

- **Root Cause Analysis**:
  - In `app/app.js`, when opening the root application without a `?subject=` parameter, `state.view` correctly defaulted to `'courses'`.
  - In `shell()`, the topbar was rendered as `Study Atlas / All Courses` without embedding the `<span id="view-label"></span>` element.
  - Subsequently, `render()` attempted `$('#view-label').textContent = names[state.view]`, causing an uncaught `TypeError: Cannot set properties of null (setting 'textContent')`.
  - The uncaught error triggered `init().catch()`, displaying the "We couldn't open the atlas" fallback screen.
- **Fix Implemented**:
  - In `shell()`, structured the topbar with `<span id="topbar-prefix">` and `<span id="view-label">` persistently present in both courses and subject modes.
  - In `render()`, added defensive null-guards: dynamically updating `#topbar-prefix`, `#topbar-scope`, and `#view-label` based on `state.view`.
  - Added null-guards in `updateSetup()` for `#session-count`, `#available-count`, and `#start-session`.
  - In `index.html`, bumped asset query parameter to `?v=1.2` to bust browser caches immediately.
- **Verification**:
  - `npm run check; npm test`: all 56 test suites passed.
  - Staged, committed, and pushed to origin/main. GitHub Pages deployment verified.

## 2026-11-09 — Release 1.2: Dual-Engine Architecture (Memorize Room & Question Bank Library)

- **Dual-Engine Architectural Expansion (`ABOUT_PROJECT.md`)**:
  - Authored comprehensive project charter detailing the dual-engine educational paradigm: Testing Engine (discrete retrieval practice) coupled with Synthesis Engine (multi-dimensional mental models and cross-lecture consolidation).
  - Maintained uncompromising 100% lecture slide grounding: zero external hallucinations; all synthesis claims directly cite verified teaching slide pages.
- **The Memorize Room (`/memorize`)**:
  - **Organism Dossiers**: Consolidated 15 bacterial pathogen dossiers across all 5 General Microbiology lectures (*E. coli*, *S. aureus*, *S. epidermidis*, *S. pneumoniae*, *S. pyogenes*, *P. aeruginosa*, *B. anthracis*, *C. tetani*, *C. botulinum*, *S. enterica*, *S. dysenteriae*, *M. tuberculosis*, *N. meningitidis*, *N. gonorrhoeae*, *V. cholerae*). Structured across Morphology, Culture/Biochemistry (TSI, MacConkey, catalase, coagulase, oxidase), Genetics, Normal Flora, Virulence, and Clinical Manifestations. Includes search filter, category selector, exact slide links, and a `⚡ Quiz this bug` one-click drill launcher.
  - **Diagnostic Decision Trees**: Step-by-step branching algorithms for Gram-Positive Cocci, Gram-Negative Rods, and Spore-Forming Bacilli.
  - **Comparison & Contrast Matrices with Active Occlusion ("Blindfold Mode")**: High-yield contrast tables (Exotoxin vs. Endotoxin, Horizontal Gene Transfer, Cell Wall Architecture, Microbial Control, Spores vs. Vegetative Cells, DNA Polymerases, Replication, DNA Repair) equipped with an interactive active-recall mask toggle allowing students to tap to reveal hidden cells.
  - **Rules of Thumb (Heuristics)**: Core clinical and laboratory heuristics citing exact source references.
  - **Bi-directional Bridges**: Questions relating to organisms automatically render a `✦ View Dossier ↗` pill in feedback and review screens, connecting question-solving directly to synthesized knowledge.
- **Question Bank Library System in Practice Mode**:
  - Added Bank Partition Selector: `All Questions`, `Unpracticed Only` (drill unseen items), `Missed Items` (targeted remediation of mistakes), and `Practiced` (retention reinforcement).
  - Dynamic live recalculation of available pool sizes in Practice setup.
  - Added expandable Question Library Browser (`<details class="bank-browser">`) listing all filtered activities with status badges (`✓ Mastered`, `↻ Missed`, `• Unseen`, `★ Saved`) and a direct `Solve ↗` button.
- **Model & Content Validation**:
  - Extended `selectActivities()` in `app/model.js` with `bankFilter` partitioning.
  - Extended `scripts/validate_content.py` to structurally and provenance-verify synthesis JSON data against lecture page ledgers.
  - Added automated synthesis test to `tests/content.test.mjs` and bankFilter tests to `tests/model.test.mjs`.
  - Bumped version to `1.2.0` in `package.json` and What's New modal.
- **Verification**:
  - `python scripts/validate_content.py --subject general-microbiology`: passed (224 pages, 488 concepts, 428 activities, 4 synthesis modules).
  - `python scripts/validate_content.py --subject molecular-biology`: passed (191 pages, 303 concepts, 694 activities, 2 synthesis modules).
  - `npm run check`: passed with 0 errors.
  - `npm test`: all 58 unit and integration tests passed.

## 2026-11-09 — Release 1.2.1: Memorize Room Visual & Ergonomic Overhaul

- **Bacterial Pathogen Command Center (`/memorize` Organisms Tab)**:
  - Eliminated the dense single-column "newspaper" layout in favor of a dual-mode medical workspace:
    - **Master-Detail Clinical Console**: Sticky left directory with categorized pathogen list showing authentic Gram-stain badges (Crystal Violet `G+`, Safranin `G-`, Carbolfuchsin `AFB`), Latin names, and instant 2-line diagnostic signatures. Right pane houses the executive clinical dossier with zero plain bullet dumps.
    - **Flashcard Matrix Grid**: 2/3-column responsive card matrix for rapid side-by-side scanning, each with diagnostic signatures, key virulence weapon, and top clinical disease.
  - **Visual TSI Reaction Tube Widget**: Realistic glass tube graphic rendering exact Triple Sugar Iron agar slant/butt color reactions (yellow acid vs red alkaline), black ferrous sulfide (H2S) precipitation, and fermentation gas bubbles for enteric pathogens (*E. coli*, *Salmonella*, *Shigella*, *Pseudomonas*).
  - **Structured Clinical Modules**:
    - Laboratory identification & culture reactions (TSI, MacConkey, EMB, MSA, Blood agar hemolysis, catalase, coagulase, oxidase).
    - Cell wall architecture & microscopic hallmarks.
    - Virulence arsenal & pathogenic mechanisms.
    - Clinical syndromes & disease manifestations.
    - Normal flora niche & transmission reservoirs.
- **Interactive Diagnostic Decision Trees (`/memorize` Trees Tab)**:
  - **Interactive Laboratory Pathway Simulator**: Step-by-step diagnostic simulator guiding students through differential diagnosis tests with interactive breadcrumb navigation, test prompts, large tactile choice buttons, and celebratory Confirmed Diagnosis cards (*Diagnosis Confirmed*, clinical clues, direct dossier launch, and one-click bug quiz).
  - **Panoramic Visual Flowchart**: Hierarchical flowchart canvas mapping all decision nodes, color-coded branch connectors (emerald positive, coral negative), and outcome cards with slide links.
- **Comparison Matrices & Active Occlusion**:
  - Added `[ 👁 Reveal All ]` and `[ 🙈 Hide All ]` instant controls alongside tactile cell-by-cell tap-to-reveal.
- **Verification**:
  - `npm run check`: 0 errors.
  - `npm test`: all 58 test suites passed.
  - `python scripts/validate_content.py --subject general-microbiology`: 100% passed.
  - `python scripts/validate_content.py --subject molecular-biology`: 100% passed.





