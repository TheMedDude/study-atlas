# Pharmacology midterm — implementation and question-writing handoff

Prepared for Study Atlas version 1.2.14 on November 12, 2026.

**Release status:** version 1.2.14 is published and verified on the public website. CI, Pages deployment, live workflows and exact-byte public resources passed verification. The canonical checkout remains `C:\Users\musta\OneDrive\Documents\study-atlas`.

## Scope and preserved work

The user switched this task from Microbiology to Pharmacology after completing Microbiology through Antigravity. Work continued from the existing 1.2.13 checkout, commit `08f2b6a`. The existing Molecular Biology and General Microbiology question banks were preserved: their JSON content matches that commit, and neither bank was reauthored during this task.

The four supplied Pharmacology PDFs are the only teaching authority. Their unchanged originals, original filenames and SHA-256 hashes are recorded in [the manifest](../subjects/pharmacology/sources/manifest.json). No outside pharmacology content was added to repair slides or create questions.

| Chapter | PDF pages | Teaching pages | Reviewed MCQs | Matching | Ordering | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Introduction & ROA | 47 | 45 | 60 | 6 | 0 | 66 |
| Pharmacokinetics | 95 | 90 | 165 | 15 | 0 | 180 |
| Pharmacodynamics | 49 | 48 | 89 | 10 | 0 | 99 |
| ANS & Adrenergic Drugs | 92 | 86 | 169 | 20 | 4 | 193 |
| **Total** | **283** | **269** | **483** | **51** | **4** | **538** |

## Work from the original files to the app

1. Imported the four PDFs from the uploaded ZIP without modifying their bytes. Extracted embedded text and rendered every page for visual review.
2. Reviewed all 283 pages, including image-only diagrams, receptor/drug tables, graphs, symbols, clipped text and prescription examples. Recorded printed slide labels separately from one-based PDF pages. Excluded 14 cover, objective or pure-divider pages from assessment while retaining them for navigation.
3. Produced faithful per-lecture Markdown and page/concept records, then assembled [one detailed study source](../subjects/pharmacology/source-analysis/pharmacology_detailed_structured_study_source.md), a page ledger, chapter index, concept index, coverage ledger and uncertainty register. The index contains 576 source concepts/relationships and 66 source notes.
4. Passed the full source gate before authoring activities. Generated 283 faithful lossless WebP pages for the portable viewer: 32,881,018 bytes, with original-PDF hashes, image hashes, dimensions and decoded pixels checked.
5. Authored 603 candidate activities in ignored working files. Separate reviewers checked different chapters from those they authored. Review repaired weak alternatives, ambiguous keys, inaccurate references, Arabic wording and non-unique orderings. It removed 65 duplicate, weak or underspecified candidates, leaving 538 accepted activities.
6. Compiled only independently reviewed records, rebuilt coverage and integrated Pharmacology as the third subject. The app reuses Practice, Exam, concept drills, source viewing, saved questions, resumable sessions, local progress and compatible backups.

The detailed source-QA record is [source-analysis/QA.md](../subjects/pharmacology/source-analysis/QA.md). The compiled bank is [activities.json](../subjects/pharmacology/activities.json); reviewed lecture records are under `subjects/pharmacology/activities/`.

## How the questions are written

**The first three chapters prioritize principles.** Illustrative drug names and functions remain in the extraction, but they do not drive standalone name–function memorization. Questions instead test definitions, administration choices, ADME, membrane transport, distribution, metabolism, elimination, dose-response relationships, receptor signaling and calculations. A drug example can be used when its relevant properties are supplied in the stem.

**The fourth chapter includes drug-specific assessment.** It tests the ANS foundations alongside adrenergic mechanisms, receptor selectivity, paired physiological effects, distinctions between drugs, source-supported uses and adverse effects. Brand catalogs and uncertain superlatives remain reference material.

The writing rules follow the approved Molecular Biology approach:

- Ask pharmacology directly in self-contained English. Keep source links in the explanation rather than asking what a slide says. Any hypothetical scenario includes the conditions needed to determine its answer.
- Use exactly five plausible, parallel options. Distinguish related mechanisms and consequences. Each option has evidence explaining why it does or does not fit the question; absence from a slide is not evidence of falsity.
- Avoid correct-answer clues from parentheses, length, grammar, unrelated alternatives or a single qualified answer surrounded by implausible universal claims. Automated cue flags received human review and substantive repairs.
- Make variants assess a different distinction, condition or application. Remove reciprocal paraphrases and repeated recognition items that add no meaningful assessment.
- State units and assumptions for calculations. Relationships involving half-life, clearance, volume of distribution, bioavailability and steady state specify the relevant fixed parameters and first-order conditions. Numerical answers were recomputed during review.
- Explain in English and natural Arabic, retaining English scientific names and terms. Arabic explanations were independently checked for the same scientific meaning, rather than accepted from formatting alone.
- Use automatically scored matching where mappings are unique. Use ordering only for a source-supported sequence; do not impose an order on parallel or interchangeable events. No typed responses, confidence prompts or self-grading activities were added.

For example, a principle question can supply a fixed infusion rate and ask how a change in clearance affects steady-state concentration. It does not require recalling the name of an illustrative enzyme inhibitor from an introductory chapter. An adrenergic question can require distinguishing named drugs using receptor selectivity and the effects explicitly taught in chapter four.

## Coverage and uncertainty

The accepted activities cover 483 assessable core concepts. The source index also retains 33 core-index entries with explicit deferrals, chiefly heading-only labels, duplicate captions or insufficiently specified claims. There are 76 explicit deferrals in total, including supporting and blocked material. Other supporting examples remain visible even without activities. These distinctions remain in the ledgers; the app does not report untested reference details as learned.

Unresolved statements never determine a scored answer. Examples include dimensionally inconsistent clearance wording, ambiguous unequal-maximum potency plots, graded versus population ED50 contexts, conflicting autonomic/reflex statements, and unqualified selectivity superlatives. Clear relationships on the same page remain assessable. Explicit blocked concept IDs are also enforced by the validator.

Recognition and matching provide cued performance evidence. Repeating a question does not create a new distinct item, and a single correct answer is labelled **Last answer correct**, not mastery. Coverage, bank availability, recorded answers and performance remain separate.

## Review of the Antigravity code changes

The app audit preserved the existing Microbiology features and fixed concrete issues:

- Course cards read the correct existing progress key and include archived answers in their historical total. The label says **answers recorded**.
- Course and platform counts come from verified per-subject catalog metadata, refreshed after successful bank builds. A third course no longer inherits Microbiology's hard-coded numbers.
- Individual hidden comparison cells now receive clicks and use real keyboard-accessible buttons. Mouse, Enter, Space, hide/reveal-all and accessible revealed-value states were checked.
- Question Library correct-answer counts use its actual question pool, and its labels no longer equate one correct response with mastery.
- Returning-user release detection checks history across subjects. A student opening the new Pharmacology course can still receive the update announcement for their existing history in another course. Fresh users are marked current without a later first-practice popup.
- Release-dialog names match the release; search copy and the no-synthesis view work across subjects without promising unfinished modules.
- Bank builds validate a temporary subject copy before replacing compiled artifacts. Invalid options or uncovered core concepts leave the previous published files unchanged. This protection is covered by three Python regressions included in CI.

Existing answer-history keys, settings, backup formats and activity IDs in the two earlier subjects were preserved. Their private progress is never committed or uploaded. QA uses isolated browser contexts and ignored working files.

## Validation and continuation

Local verification passed syntax checks, 77 JavaScript tests and 3 Python pipeline tests. Real isolated Chrome checks covered the three course cards, exact counts, instant checking, Arabic feedback, source-page links, bookmarks, saved-session order and checked-state restoration, cross-subject progress isolation, delayed exam feedback, early finish with unanswered questions, All available, honest library status, chronological Updates opening at the bottom, and returning-user popup behavior. Desktop and 390px screenshots were inspected. The viewer's source-image provenance was checked for every page.

This is browser emulation, not physical-device testing. The Microbiology bank was preserved rather than fully reauthored or given a new scientific review in this task. Device progress remains local; students should export backups before clearing browser data or changing devices.

For future content changes:

1. Read `AGENTS.md`, `docs/DISCOVERY.md`, `subjects/pharmacology/DISCOVERY.md`, the manifest and source-QA record.
2. Change the reviewed lecture activity file, retaining stable IDs and incrementing revisions when scored meaning changes. Obtain renewed independent review.
3. Do not run old working author scripts over reviewed banks. Candidates belong under ignored `work/`; only reviewed records enter `activities/`.
4. Run `scripts/build_bank.py --subject pharmacology`, `scripts/validate_content.py --subject pharmacology`, `npm run check`, `npm test`, and `python -m unittest discover -s tests -p test_bank_transaction.py -v` with appropriate Python dependencies for source work.
5. Confirm TheMedDude (GitHub ID 352966162) before pushing. Repository publication and live deployment are separate facts; verify both and update the project log.

## Production verification

Functional release commit: `34a35eeb3613297a08267899f39cffee6c694968`.

- [CI 43278629249](https://github.com/TheMedDude/study-atlas/actions/runs/43278629249) completed successfully, including 77 JavaScript tests and three Python transaction regressions.
- [Pages deployment 43278629239](https://github.com/TheMedDude/study-atlas/actions/runs/43278629239) succeeded; Pages build 1363932003 reports the same commit and no error.
- [Published Pharmacology course](https://themeddude.github.io/study-atlas/?subject=pharmacology): all seven grouped release-workflow checks passed in isolated Chrome against the actual public site.
- Seventeen public resources returned HTTP 200 and matched committed SHA-256 bytes: the app files, registry, subject configuration, compiled bank, source manifest/page index, detailed study source, all four original PDFs and one rendered page per lecture.
- Published bank SHA-256: `1a57a2fd6101c384c6154118c278b6aee0535a1d09702af9b647d9f7726cf327` (1,356,156 bytes).

The initial release attempt exposed a Windows-to-Linux metadata hash mismatch in CI. Commit 34a35ee corrected manifest hashing to explicit UTF-8 without BOM and LF newlines, and the final CI passed. Original PDF and rendered-image hashes remain exact binary hashes. Later documentation-only commits do not change these application or bank bytes.

Detailed local verification evidence is retained under ignored `work/pharmacology/`; no private progress or browser history is published.
