# Release verification

## Source and activity review

All six supplied PDF hashes remain unchanged. All 191 pages were extracted and visually reviewed: 183 teaching pages, six covers and two administrative pages. The source contains 303 indexed concepts and 50 uncertainty entries. See the source-analysis QA record for the additional independent visual sample and fidelity corrections.

The revised bank contains 694 independently reviewed activities: 601 five-option MCQs, 67 matching drills, 24 ordering drills and two original-diagram items. All 227 core concepts have activity coverage; 278 total concepts have activities. The remaining 25 supporting or uncertain concepts have explicit deferrals and remain in the full study source and progress denominator.

Every released item has source references, concept tags, English/Arabic explanations, author review, and independent review records. Review checked keys, every distractor/pair/sequence, cueing, ambiguity, Arabic fidelity, actual concept coverage, and equivalent orderings. One near-duplicate was removed. Runtime option and match-choice order is shuffled.

All 191 portable source images are lossless 1440×1080 WebP renders of the unchanged PDFs. Source and image hashes, page sequences, and decoded pixels were checked. Dense tables and diagrams were additionally inspected at native resolution. Original PDFs remain downloadable.

## Automated verification

`npm run check` passed JavaScript syntax validation. All **45 automated tests passed**. The added content regression rejects source/slide-framed stems. `npm test` checks source hashes and page/image coverage, reviewed-bank integrity, core coverage, MCQ/match/order scoring, interchangeable groups, repeat-resistant evidence, weak-area variant selection, fixed exam result accounting, timer display, strict import validation, semantic deduplication, subject/scope isolation, storage failure, cross-tab reconciliation and clears, bank-change archives, and portable history limits.

The source pipeline also passed `build_source_index.py`, `validate_content.py`, and `build_bank.py`. Structural checks supplement source review; they do not independently certify biological truth beyond the supplied lectures.

## Browser verification

Tested in the in-app Chromium browser, including a 390×844 viewport (375 CSS-pixel document width after its scrollbar). Verified:

- Immediate practice checking and select-then-confirm, with feedback withheld until the explicit check in confirm mode.
- Arabic explanations retaining English scientific terms.
- Fixed exam selection and delayed feedback; manual completion with one unanswered item reports its separate status and includes it in the exam denominator.
- Real one-minute timer expiry automatically ends an unanswered exam. Late-answer clicks are rejected after the deadline; background-tab timing is accounted for by the fixed deadline.
- Matching selections, automatic grading, and submitted/source-match result tables.
- Keyboard ordering retains focus after moves; result review shows submitted and accepted sequences, including interchangeable groups.
- Original RFLP gel diagram choices and mobile readability.
- Source side pane/full-screen controls, exact PDF-page references, page navigation, faithful page renders, and original-PDF links.
- Mobile overview and drill layouts without horizontal document overflow.

Native PDF embeds were blank in this browser, so the released viewer uses faithful page renders. Native JavaScript confirmation dialogs also stalled the automation; the released app uses accessible page dialogs for leaving a session, finishing an unanswered exam, and clearing progress.

The browser downloaded a real 4,139-byte progress backup. Parsing that exported file restored 19 QA attempts, and merging it again added zero attempts. The test data stayed outside Git. The automation kernel became unavailable while awaiting its download event, so a direct file-picker import roundtrip could not be completed; serialization, parsing, validation, merging, error handling and restore logic are covered by the storage tests and the actual exported file.

No claim is made about testing on physical mobile hardware or every browser. Account syncing and complete offline operation remain future work. Source uncertainties remain excluded from determining scored answers.


## Production verification

The exact release head `1c76e100e893bc2e6c0346b35da2940130080fba` passed [CI run 42077170918](https://github.com/TheMedDude/study-atlas/actions/runs/42077170918), including 44 tests with no failures/skips and JavaScript syntax checks. [Pages deployment 42077539291](https://github.com/TheMedDude/study-atlas/actions/runs/42077539291) succeeded for that head. Public HTTP checks returned 200 for the index, app script, 222-item validated bank, source WebP and original PDF at https://themeddude.github.io/study-atlas/ . Final handoff changes are verified by the subsequent main-branch CI/Pages runs.


## 2026-11-05 question-bank and typography revision

Three authors expanded and rewrote their lecture pairs, then cross-reviewed a different pair. Independent review removed 59 weak or repetitive candidates from the 753-record candidate set. All 222 original IDs remain; 472 new five-option MCQs were added. Six original records received revision 2 where the scored meaning changed, allowing existing progress handling to retain their old responses in the historical archive. See [activity review](../subjects/molecular-biology/source-analysis/ACTIVITY_REVIEW.md).

Direct English/Arabic visible-copy checks found no remaining source/lecture narration, and normalized stems contain no exact duplicate. Concept coverage and the 25 remaining explicit deferrals were rebuilt; all original PDF and page-image hashes remain unchanged.

The updated interface was checked in isolated headless Chrome 156.0.8078.80 using the existing bundled Playwright library because the in-app browser/Node REPL tools fail to initialize (“failed to write kernel assets … os error 3”). Verified the 601-MCQ total, 100-question practice and exam sets, correct practice feedback, delayed exam feedback, and an exam result with one correct response plus 99 unanswered. Both self-hosted fonts returned HTTP 200 and actually loaded. Arabic explanations use Noto Sans Arabic at 18px with RTL layout; English uses Inter, and the Settings Arabic label has its language and font specified.

Inspected desktop, 390px mobile and larger-text screenshots, including the source panel and its close transition. Mobile content width and document width were checked after the layout transition settled, with no clipping or horizontal overflow. No page errors occurred. This is responsive emulation, not physical-device testing. The earlier file-picker import verification limit remains unchanged; storage code was not changed in this revision.

Local source/content builds, syntax checks and all 45 tests passed. Production verification for this revised release is recorded separately in PROJECT_LOG.md after publication.
