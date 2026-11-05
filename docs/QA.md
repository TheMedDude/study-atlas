# Release verification

## Source and activity review

All six supplied PDF hashes remain unchanged. All 191 pages were extracted and visually reviewed: 183 teaching pages, six covers and two administrative pages. The source contains 303 indexed concepts and 50 uncertainty entries. See the source-analysis QA record for the additional independent visual sample and fidelity corrections.

The released bank contains 222 independently reviewed activities: 129 five-option MCQs, 67 matching drills, 24 ordering drills and two original-diagram items. All 227 core concepts have activity coverage; 234 total concepts have activities. The remaining 69 supporting or uncertain concepts have explicit deferrals and remain in the full study source and progress denominator.

Every released item has source references, concept tags, English/Arabic explanations, author review, and independent review records. Review checked keys, every distractor/pair/sequence, cueing, ambiguity, Arabic fidelity, actual concept coverage, and equivalent orderings. One near-duplicate was removed. Runtime option and match-choice order is shuffled.

All 191 portable source images are lossless 1440×1080 WebP renders of the unchanged PDFs. Source and image hashes, page sequences, and decoded pixels were checked. Dense tables and diagrams were additionally inspected at native resolution. Original PDFs remain downloadable.

## Automated verification

`npm run check` passed JavaScript syntax validation. All **44 automated tests passed**. `npm test` checks source hashes and page/image coverage, reviewed-bank integrity, core coverage, MCQ/match/order scoring, interchangeable groups, repeat-resistant evidence, weak-area variant selection, fixed exam result accounting, timer display, strict import validation, semantic deduplication, subject/scope isolation, storage failure, cross-tab reconciliation and clears, bank-change archives, and portable history limits.

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
