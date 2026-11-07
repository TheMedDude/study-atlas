# Content and evidence model

Study Atlas separates platform behavior from each subject's sources, scope, activities, and progress. Molecular Biology is the first subject. Its six supplied lecture PDFs are the sole teaching authority.

## Source analysis gate

Before authoring activities, every PDF page must have an extraction record, a visual-review record, a teaching/cover/administrative/divider classification, and an explicit PDF-page reference. Printed slide numbers are a separate nullable field; they must never be inferred from PDF position. Covers and administrative material remain indexed but are excluded from assessment. A divider containing teaching content remains in scope.

The detailed study source preserves legible slide text, figures, screenshot tables, labels, numerical values, and source uncertainty. The page ledger and concept index retain supporting detail even when it receives lighter activity coverage. Priority describes editorial emphasis within this source, never predicted exam probability.

An unresolved source statement is preserved with an uncertainty ID. Activities may assess other clear claims from that page, but the uncertain statement cannot determine a scored answer. No external biology content may fill a gap.

## Activity records

Each activity has a stable ID, subject ID, lecture ID, type, concept IDs, and exact source references. Source references use `{lectureId, pdfPage}` plus an optional printedSlide copied from the source-analysis ledger. Activity IDs survive wording edits; a revision changes when scored meaning changes.

- `mcq`: one correct answer and exactly five unique, plausible, parallel options. English prompt/options, English and Arabic explanations retaining English scientific terminology. Per-option evidence explains why each option does or does not satisfy the prompt. Absence from a slide alone does not establish falsity.
- `match`: a small set of source-supported pairs, automatically scored after all links are selected. Choices are shuffled independently. Distinct pairs must have unique valid mappings within the activity's stated scope.
- `order`: only when the source establishes a sequence. Accepted groups permit equivalent or parallel steps. Do not turn an unordered list into a unique temporal sequence.
- `diagram`: a crop of an original source diagram with a prompt and source-supported label choices. The asset records its original PDF page and crop. Do not redraw biology from memory or hide source uncertainty.

Question quality review checks evidence for the correct answer, distractors, both explanation languages, source pagination, plausible alternatives, answer cues, duplicate items, unique match mappings, and sequence validity. All review results are recorded; structural validation alone is not content validation.

Prompts assess the biology directly and stand alone. Do not ask what a source/lecture/slide says, or refer to an unseen table or diagram. Explanations also state the supported relationship directly; citation links provide provenance. A displayed original diagram can be referenced by the corresponding diagram activity. New variants must change the knowledge, comparison, inference or application being tested, rather than merely paraphrasing an existing question. Wording edits retain stable IDs; changes to the scored response or its meaning increment the activity revision. All changed records require renewed independent review.

A content release includes only activities marked `validated`, with no unresolved claim used in scoring. Unvalidated drafts remain outside the app's activity bank.

## Coverage and evidence

Coverage, performance, and insufficient evidence are separate:

- **Untested**: no distinct completed activity for a concept.
- **Limited evidence**: one or two distinct completed activities, regardless of score.
- **Inconsistent results**: at least three distinct activities with fewer than 80% correct on their latest attempts, or any recent error.
- **Consistent performance**: at least three distinct activities, at least 80% correct on their latest attempts, and no error in the latest three distinct activities.

These are descriptive thresholds, not a calibrated mastery scale. Recognition, matching, ordering, and diagram selection are cued evidence; none proves unaided recall or complete memorization. A concept with fewer than three validated activity variants cannot reach consistent performance until the bank grows. Repeating one item never increases the distinct-item evidence count.

Coverage is the number of eligible concepts encountered divided by all eligible concepts, with bank availability shown separately. Reading a source page does not count as a correct answer. A concept without any validated activity remains explicitly untested. Supporting and blocked material remains visible in the source ledger.

Practice may prioritize concepts with errors and then untested concepts, avoiding an item just answered when alternatives exist. Initial recommendation is 10 questions or the available count if smaller. Students may choose chapter filters and count. No confidence, typing, or self-grading prompts.

Exams fix their item list and optional timer at session start. They do not show answer feedback until the session ends. Unanswered items count as unanswered and incorrect in the exam result, without being mislabeled attempted-correct. Only completed scored responses contribute to practice evidence; an unanswered exam item is a coverage opportunity, not a completed concept attempt.

## Storage and transfer

Progress keys include subject and scope. Each attempt records activity ID, activity revision, timestamp, mode, chosen response, and correctness. The platform records aggregate history locally in the browser, and supports versioned JSON backup/import with validation. No progress is committed or sent to GitHub. Account syncing and complete offline availability remain future work.

Import rejects malformed files, unknown schema versions, excessive sizes, impossible timestamps, invalid activity IDs, and malformed attempts before changing progress. Valid backups merge by attempt ID to prevent duplicate imports inflating evidence. Settings are grouped independently from subject progress.


## Implemented persistence safeguards

Each subject/scope history has a reset generation and clear timestamp. Saves reconcile with the latest persisted history, and storage events converge overlapping tab writes. An older tab cannot resurrect pre-clear attempts; newly completed responses after the clear and explicit user imports are handled separately.

Local activity-bank changes archive removed or revised activity responses while preserving compatible records. Archived responses are bounded historical records, never current evidence. Exports retain that archive. Active attempts in external imports must match the current bank and have scores that recompute correctly; unsupported active revisions receive a compatibility error rather than being silently accepted.

Portable history retains at most the latest 20,000 active-plus-archived records and stays below the 8 MB import limit, reserving space for export metadata. If older records are removed, `historyLimited` is retained and the progress view states that evidence reflects retained history. Compact JSON exports remain reloadable. Malformed/oversized imports are rejected before changing current progress. Storage failure is reported as visit-only retention, never durable save success.

## Version 1.1 sessions, saved questions and notes

Existing v1 subject/scope answer-history keys and schema remain unchanged. Saved questions and resumable non-exam sessions use a separate subject/scope study-state key. Bookmarks merge by last edit; session removal/completion tombstones prevent stale tabs resurrecting a closed session. At most ten unfinished sessions and one MiB of study state are accepted; failures remain visible and do not overwrite a previously stored copy.

Practice checks append answer history immediately. Session snapshots retain stable per-question attempt IDs, checked response records, chosen order, pending answers, skips, position and elapsed active time. Resume reconciles compatible history and checks so a refresh does not duplicate answers. Paused/hidden time is excluded. Bank revision changes and cleared history reject incompatible resumes; earlier answer history remains governed by the existing archive/reset rules. Unanswered/skipped practice questions create no performance evidence. Early practice finish reports answered and unanswered separately; exams keep their fixed denominator and delayed feedback.

Backups remain schema version 1 with an optional validated studyState extension. Older backups remain readable and do not clear saved questions or sessions. Combined backup size is checked before download; invalid study payloads and oversized merged study data are rejected before importing progress. Local-storage failures are described as visit-only retention, never durable success.

PDF study notes reuse validated explanations, matching relationships and accepted process orderings under concept headings, grouped by lecture, with PDF-page references. They omit question stems, answer alternatives and grading. Browser-local canvas typesetting preserves English/Arabic shaping and creates a direct PDF download; the PDF pages contain rendered text images rather than selectable text. No saved questions, progress or note selections are uploaded.
