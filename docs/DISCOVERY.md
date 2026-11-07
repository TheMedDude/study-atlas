# Study Atlas - confirmed discovery

## Latest user revisions — 2026-11-05

- Substantially expand the Molecular Biology question bank. Add meaningful recall, comparison, mechanism and application variants across all six lectures; do not inflate the total with wording-only duplicates.
- Ask biology directly as factual, self-contained questions. Avoid stems such as “according to the source,” “the slide states,” or questions about an unseen diagram/table. Keep exact source references in answer explanations and the source viewer. A displayed diagram may be referenced directly. The six supplied PDFs remain the only teaching authority; unresolved claims remain excluded from scoring.
- Replace the previous English serif and Arabic Tahoma typography with a clean app-style sans-serif system in both languages. Use bundled Inter for English and Noto Sans Arabic for Arabic, with readable answer text and balanced question sizing. This supersedes the earlier serif interpretation of “warm editorial”; the existing cream/charcoal/coral/lime palette remains.

## Status and authorization boundary

Product discovery is complete. This is a staged implementation plan, not an implementation or a question bank. The user prohibited coding and question generation until discovery was complete; that discovery gate has now been satisfied. The user approved the platform name Study Atlas and authorized proceeding. The public repository exists at https://github.com/TheMedDude/study-atlas under the verified TheMedDude account (GitHub user ID 352966162), and the initial handoff text is committed. All six lecture PDFs have been pushed with Git and verified against the original copies by remote Git blob hash and byte size. At the original discovery handoff, implementation had not started. The subsequent source, reviewed-bank and application milestones are recorded in PROJECT_LOG.md and docs/QA.md; all confirmed choices below remain in force.

The conversation is already in Codex desktop. Continue from the established decisions rather than restarting discovery or asking the user to repeat earlier choices.

## Delivery and GitHub

- Build a maintainable multi-file project and use GitHub now. This explicitly supersedes the earlier offline-first/single-HTML delivery assumption.
- Offline capability remains a future preference; do not make complete offline operation a launch requirement without a new instruction.
- Use TheMedDude (GitHub user ID 352966162), verified through the connector. The user confirmed a PUBLIC repository at TheMedDude/study-atlas, including the lecture PDFs. Verify browser or CLI identity separately before mutations; do not use any other saved account.
- The intended audience is the user and friends. The user has accepted sharing the lecture files; do not repeat that permission question. Public repository visibility is confirmed. A live website is a later implementation/deployment milestone; no site is deployed by this handoff.
- Store student progress on the current device initially, with backup and restore. Account-based synchronization is a later feature. GitHub repository authentication is separate from student accounts.

## General platform and first subject

Study Atlas is a general study platform for future subjects; Molecular Biology is its first subject, not the platform's permanent scope. Keep subjects, their source materials, assessment scopes, activity banks, and progress separable so additional subjects can be added without rebuilding the application.

The Molecular Biology midterm decisions below remain confirmed. Keep its scope, five-option MCQ format, language choices, and learning settings in its subject configuration rather than hard-coding them as restrictions for every future subject. Future subjects require their own authoritative sources and content validation; do not invent content for them now.

## Source inventory — completed

The supplied archive is `drive-download-20261105T151329Z-1-001.zip`. It contains six unencrypted PDFs, totaling **191 PDF pages before exclusions**:

| Original filename | Pages | Identified lecture |
| --- | ---: | --- |
| `1) Genes And Chromosomes.pdf` | 41 | Genes and chromosomes |
| `2) DNA Matabolism Part (1).pdf` | 39 | DNA metabolism I |
| `3) DNA Matabolism Part (2).pdf` | 33 | DNA repair |
| `4) RNA Metabolism Part (1).pdf` | 31 | RNA metabolism I |
| `5) RNA Metabolism Part (2) .pdf` | 20 | Post-transcriptional modifications |
| `6) Techniques - PCR, Sequencing, RFLP.pdf` | 27 | PCR, sequencing, RFLP |

The user confirmed that **all six PDFs in full** are in scope, excluding covers and administrative pages. The course outline mentions material outside this archive; do not add those absent lectures. Preserve original filenames, including their spelling, while using clean display titles.

The portable inventory is in `subjects/molecular-biology/sources/manifest.json`, with unchanged PDFs in `subjects/molecular-biology/sources/slides/` and original filenames recorded in the manifest. The later source-analysis milestone reviewed every page visually and produced the complete study source, page/concept indices, coverage ledger and uncertainty register. Image-heavy pages, screenshot tables and diagrams were reconstructed; no outside biology was added.

## Confirmed Molecular Biology learning and assessment decisions

- Purpose: challenging Molecular Biology midterm preparation, balancing factual knowledge and understanding. No previous exams were supplied.
- Authority: the lecture materials only. Do not import outside facts or present inferred importance as verified exam probability.
- Coverage: comprehensive treatment of important material, lighter question coverage elsewhere, and exhaustive detail testing when justified. Do not indiscriminately memorize screenshot tables; preserve their information in source analysis and prioritize clearly important relationships.
- MCQs: five plausible options. Include direct recall, individual concepts, and comparisons, with greater emphasis on discrimination between related concepts. Avoid answer giveaways from formatting, parentheses, length, grammar, or implausible alternatives.
- Questions are in English. Explanations can be toggled between English and Arabic; retain English technical terminology in Arabic explanations.
- Practice recommends an initial session size and adapts follow-up to performance. Question-bank size follows source coverage, not a fixed quota. Retest missed concepts later using different questions where the validated bank permits.
- Practice checks immediately when an option is clicked by default. Settings must offer selecting an option and then confirming it. This later decision resolves and supersedes the earlier ambiguous request for feedback “after.”
- Exam mode: students choose the question count and may add a timer. There is no official-exam preset. Session length is fixed after the exam begins; feedback/results follow the exam.
- Use only automatically scored tapping, matching, ordering, and suitable diagram activities. The user rejected typing and think/reveal/self-grading. Do not add confidence prompts.
- The user delegated the progress policy. Track coverage and demonstrated performance honestly; do not label these cued activities as verified unaided recall or proof of complete memorization.

## Confirmed experience and visual direction

- Warm editorial design: cream background, charcoal text, coral/lime accents, strong typography, and clean layouts. Keep it bright, modern, restrained, comfortable to read, and concise in its functional UI text. Avoid generic decorative dashboards and long app explanations.
- Retain Practice, Exam, weak-area review, and automatically scored concept/diagram activities. A suitable truthful label for the non-MCQ activities is “Concept drills”; this label is a recommendation, not a separately approved name.
- Source references should usually open side-by-side, with full-screen viewing also available. From the subject home, students can browse the available midterm materials and view/download the PDFs.
- Collect similar interaction preferences in Settings. Only instant checking versus select-then-confirm is individually confirmed. Viewer layout, explanation reveal, text size, and reduced motion are reasonable recommendations, not additional confirmed requirements.

## Source-analysis and content requirements

1. Identify cover/administrative exclusions and preserve exact PDF page references separately from any printed slide numbers.
2. Produce a faithful Markdown source and chapter/topic index, reviewing image-heavy pages, diagrams, screenshot tables, labels, and reading order visually. Mark unclear material rather than guessing.
3. Build a coverage ledger linking each concept and important relationship to its source pages, priority rationale, and eventual activity coverage. Record lower-priority/deferred material explicitly.
4. Flag contradictions or unclear statements for resolution. Do not silently repair lecture content using outside knowledge.
5. Define a source-linked activity schema and an honest performance model before authoring the bank. Separate untested material, limited evidence, inconsistent results, and consistent performance.
6. When question authoring begins, validate every correct answer, distractor, explanation, relationship, diagram target, and ordering rule against the supplied source. Accept all supported solutions; do not impose a unique sequence on parallel/interchangeable steps. Absence from a slide is not proof that an alternative is false.
7. Review answer cues, ambiguity, duplication, bilingual explanation fidelity, diagram readability, and chapter/slide coverage before publishing the bank. Repeated identical items must not inflate evidence of learning.

## Implementation handoff

Source analysis and independent activity review are complete. The shared application implements the confirmed study modes, settings, source references and local progress policy. See PROJECT_LOG.md for exact counts, commits and live deployment status, and docs/QA.md for verification evidence and limits. Future subjects still need their own authoritative sources and review; the first subject's midterm scope, five-option format and language choices remain subject configuration.

## Latest user revisions — 2026-11-07 / version 1.1

- Practice needs Previous, Skip, an elapsed study clock, a Finish session action available before answering everything, and All available for the selected chapters.
- Save and resume practice later, including question order, shuffled choices, checked and selected answers, skipped items and elapsed active study time. Checked answers count immediately even when a session is left unfinished. Keep a visible answer-history total separate from concept coverage and evidence.
- Keep Next/Previous visible in a fixed bottom navigation bar when feedback expands. Keyboard: 1–5 select displayed options; Enter checks in confirmation mode then advances, + toggles the source slide in practice, and - goes to the previous question. Do not intercept editing fields, dialogs or modified browser shortcuts.
- Save individual questions in a Saved tab. Export selected saved material as factual study notes in a directly downloaded PDF, with topic headings, explanations and exact source references, rather than question stems, distractors or scoring UI. Reuse validated content without adding outside biology.
- Updates is a plain chronological page: version 1.0 first, version 1.1 latest at the bottom. Open scrolled to the bottom. No version buttons or expanding sections. Show a brief 1.1 popup once on first return for users who already had answer history; fresh users do not get an update popup after their first practice. The popup can lead to Updates.
- Preserve existing browser data and older backup compatibility. Explain truthfully that device-local storage is not cloud backup and clearing site data can remove the local copy. The user clarified that the reported 234-question problem is a behavior to fix, not a request to recover their previous session.
