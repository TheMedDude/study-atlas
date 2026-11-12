# Release verification

## Source and activity review

All six supplied PDF hashes remain unchanged. All 191 pages were extracted and visually reviewed: 183 teaching pages, six covers and two administrative pages. The source contains 303 indexed concepts and 50 uncertainty entries. See the source-analysis QA record for the additional independent visual sample and fidelity corrections.

The revised bank contains 694 independently reviewed activities: 601 five-option MCQs, 67 matching drills, 24 ordering drills and two original-diagram items. All 227 core concepts have activity coverage; 278 total concepts have activities. The remaining 25 supporting or uncertain concepts have explicit deferrals and remain in the full study source and progress denominator.

Every released item has source references, concept tags, English/Arabic explanations, author review, and independent review records. Review checked keys, every distractor/pair/sequence, cueing, ambiguity, Arabic fidelity, actual concept coverage, and equivalent orderings. One near-duplicate was removed. Runtime option and match-choice order is shuffled.

All 191 portable source images are lossless 1440×1080 WebP renders of the unchanged PDFs. Source and image hashes, page sequences, and decoded pixels were checked. Dense tables and diagrams were additionally inspected at native resolution. Original PDFs remain downloadable.

## Automated verification

`npm run check` passed JavaScript syntax validation. All **56 automated tests passed**. The added content regression rejects source/slide-framed stems. `npm test` checks source hashes and page/image coverage, reviewed-bank integrity, core coverage, MCQ/match/order scoring, interchangeable groups, repeat-resistant evidence, weak-area variant selection, fixed exam result accounting, timer display, strict import validation, semantic deduplication, subject/scope isolation, storage failure, cross-tab reconciliation and clears, bank-change archives, and portable history limits.

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

Local source/content builds, syntax checks and all 45 tests passed. The exact functional release `bacf093c973b36b2db03e6339a50997b94b07bad` passed [CI 42089486350](https://github.com/TheMedDude/study-atlas/actions/runs/42089486350) with 45 tests, zero failures/skips. [Pages 42089485242](https://github.com/TheMedDude/study-atlas/actions/runs/42089485242) and build 1344295676 succeeded for that same commit.

The public 694-activity/601-MCQ bank returned HTTP 200 and matched both workspace and committed bytes (SHA-256 `c02dec0ff1ffa2dee42c4633350082a8993f6629c37bdf624a9430f7af993d53`). HTML, CSS, JavaScript and both font files returned HTTP 200. The final browser checks above were also repeated successfully against the actual public website, including font loading, mobile layout and 100-question practice/exam behavior. The following documentation-only handoff commit does not change the published application or bank.

## Version 1.1 — 2026-11-07

All 56 automated tests and syntax checks pass. New coverage includes 234 checked answers saved without finishing, exact resume/order/partial responses/skips, elapsed time excluding pauses, backup compatibility/deduplication, corrupt/quota failures, cross-tab closed-session tombstones, incompatible revisions/clears, and direct PDF structure.

In the actual in-app browser, the pre-existing local QA history remained intact. A fresh isolated QA origin imported a synthetic 234-answer / 235-question session and 30 saved notes. Save/exit, refresh/resume and early Finish left exactly 234 recorded answers. Reimporting its actual exported backup added zero attempts. Confirmed preserved shuffled choices, locked checked answers, paused time, numeric/Enter/+/- shortcuts, All available=601 and unchanged dock coordinates after feedback. Returning-history popup appeared once; subsequent refresh did not repeat it. Updates lists 1.0 then 1.1, and measured scrollTop + viewport equals document height on opening.

The in-app print dialog stalled, so the released export uses a direct local PDF download. Actual app downloads produced a one-page Arabic PDF and a six-page, 30-topic English PDF. Both parsed as A4 in pypdf and rendered with pypdfium2; sampled pages were inspected. PDF notes contain topic headings, validated facts/relationships/processes and source-page references, without stems/distractors/grading. Pages are rendered text images to preserve browser font shaping. No student records, note selections, browser histories or synthetic QA backups are committed.

Existing progress retains its v1 keys/schema. Study state is independent and appears as an optional extension in portable backups; legacy files remain accepted. Storage and combined-backup failures are surfaced truthfully. Browser data is local to a browser/device, so clearing it or moving devices still requires a backup. Source/content verification remains unchanged; production status is recorded in PROJECT_LOG.md after deployment.


Version 1.1 functional release `30ee7c403b982261a7c05f14830c311ef8ab683b` passed [CI 42388487151](https://github.com/TheMedDude/study-atlas/actions/runs/42388487151) with all 56 tests. [Pages 42388486189](https://github.com/TheMedDude/study-atlas/actions/runs/42388486189) and build 1349343996 succeeded for the same commit. Seven published application/assets returned HTTP 200 and matched committed bytes; the public bank still contains 694 activities / 601 MCQs. Subsequent handoff changes affect documentation only.
## Pharmacology 1.2.14 — local release verification

The four-PDF Pharmacology bank is complete and independently reviewed: 538 activities (483 MCQs, 51 matching, 4 ordering), covering 483 assessable core concepts with explicit deferrals for other source-index entries. All283pages are reviewed;269are teaching pages. See subjects/pharmacology/source-analysis/QA.md and ACTIVITY_REVIEW.md.

Syntax checks,77JavaScript tests and3Python bank-build regressions pass. The Python regressions now run in CI. All three subject content validators pass, and the compiled Pharmacology bank exactly matches its frozen reviewed lecture records. Final answer-format/framing audit has no remaining flags under the checked cue rules.

Isolated Chrome verified three course cards and exact counts; instant checking; Arabic feedback; bookmarking and exact source images; restored shuffled order/checked state without duplicate history; course progress isolation; delayed exam feedback and1answered/1unanswered results; Saved and All available; honest library status; chronological Updates at bottom; and cross-subject returning-history popup behavior. Desktop/390px screenshots inspected. Separate matrix checks passed mouse/Enter/Space/hide/reveal-all/accessibility/mobile overflow. This is responsive emulation, not physical-device testing.

The existing Molecular Biology and General Microbiology bank JSON content matches HEAD08f2b6a; Windows checkout line endings differ from Git bytes but no bank-content change is present. No private progress, QA screenshots, working drafts or credentials are included in the release. Production publication and verification follow separately.
