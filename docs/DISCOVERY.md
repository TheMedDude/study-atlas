# Study Atlas - confirmed discovery

## Status and authorization boundary

Product discovery is complete. This is a staged implementation plan, not an implementation or a question bank. The user prohibited coding and question generation until discovery was complete; that discovery gate has now been satisfied. The user approved the platform name Study Atlas and authorized proceeding. The public repository exists at https://github.com/TheMedDude/study-atlas under the verified TheMedDude account (GitHub user ID 352966162), and the initial handoff text is committed. All six lecture PDFs have been pushed with Git and verified against the original copies by remote Git blob hash and byte size. No application code, study questions, full source extraction, or content QA has been produced.

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

The portable inventory is in `subjects/molecular-biology/sources/manifest.json`, with unchanged PDFs in `subjects/molecular-biology/sources/slides/` and original filenames recorded in the manifest. This is an inventory and limited cover/content inspection, not a completed study source. Several pages have very little extractable text and need visual review before their contents can be understood reliably.

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

## Pending source-analysis and content work

1. Identify cover/administrative exclusions and preserve exact PDF page references separately from any printed slide numbers.
2. Produce a faithful Markdown source and chapter/topic index, reviewing image-heavy pages, diagrams, screenshot tables, labels, and reading order visually. Mark unclear material rather than guessing.
3. Build a coverage ledger linking each concept and important relationship to its source pages, priority rationale, and eventual activity coverage. Record lower-priority/deferred material explicitly.
4. Flag contradictions or unclear statements for resolution. Do not silently repair lecture content using outside knowledge.
5. Define a source-linked activity schema and an honest performance model before authoring the bank. Separate untested material, limited evidence, inconsistent results, and consistent performance.
6. When question authoring begins, validate every correct answer, distractor, explanation, relationship, diagram target, and ordering rule against the supplied source. Accept all supported solutions; do not impose a unique sequence on parallel/interchangeable steps. Absence from a slide is not proof that an alternative is false.
7. Review answer cues, ambiguity, duplication, bilingual explanation fidelity, diagram readability, and chapter/slide coverage before publishing the bank. Repeated identical items must not inflate evidence of learning.

## Next implementation stage

The local project folder and source inventory are prepared, and the public repository TheMedDude/study-atlas exists with the initial handoff text committed. The six-PDF upload is complete and verified. Continue the staged content workflow; report actual repository and deployment status separately. Keep source content, validated assessment data, presentation, and progress storage separable, with Molecular Biology as the first subject in the general Study Atlas platform. Choose routine implementation details without reopening completed discovery. Do not populate a polished shell with unverified study content or claim that the inventory constitutes completed extraction or QA.
