# Metabolic Biochemistry midterm — local content QA

## Scope and review boundary

Four supplied midterm PDFs only; not the full course. Local speed-first shortcut authorized in the task: a different, fresh Codex agent checks every accepted question and reference-card fact before local integration. This is not Antigravity checking or Claude final review. Neither has happened; nothing is authorized for commit, push or deployment.

## Source gate

- All 154 PDF pages rendered and visually inspected: 137 teaching pages, 17 covers/dividers/administrative pages.
- 245 concepts indexed; 18 source notes preserved. Doubtful claims are blocked from deciding scored answers.
- `build_source_index.py --subject metabolic-biochemistry` and `validate_content.py --subject metabolic-biochemistry` passed before activity writing.
- Twelve source tables and one optional comparison figure shown to the owner. Exact final selections and qualitative-only restrictions are recorded in `blueprint.md` and the lecture source records.
- The old `extract_sources.py` is hardcoded to Molecular Biology and has no subject option. It was inspected but never run. The new task-specific `work/metabolic-biochemistry/prepare_sources.py` performed unchanged-PDF extraction and scratch renders; the supported `render_source_pages.py --subject metabolic-biochemistry` produced the app viewer images. No shared script was modified.

## Chapter acceptance log

All four chapters are checked by fresh second Codex agents, compiled and browser-tested locally: **193 activities (168 MCQ, 16 matching, 9 ordering), 52 cards, 161 card facts**. There are 270 per-candidate findings (77 removals) and 161 per-fact findings. No unchecked draft or empty placeholder is in the finished bank. This remains a local candidate for Antigravity and Claude review.

- Bioenergetics and Metabolism: 65 candidates checked by fresh `second-codex-agent-check_bioenergetics`; 42 accepted (36 MCQ, 4 matching, 2 ordering), 23 removed. All 10 cards / 32 facts checked and accepted; every candidate and fact has a recorded finding. Source images, keys, alternatives/mappings/orders, English/Arabic, cues, duplicates, exact refs and selected-table scope checked. Compiled and registered locally; validator passed. Browser: answered `bioenergetics-and-metabolism-exergonic-sign` correctly, switched EN/Arabic explanation, opened the exact PDF p10/39 image and verified the 10-card reference view. Antigravity and Claude unchecked. Exact report: `bioenergetics-and-metabolism-second-agent-review.json`.
- Glycolysis and Fermentation: fresh `second-codex-agent-check_glycolysis` checked all 86 candidates and 46 card facts; accepted **69 activities (62 MCQ, 4 matching, 3 ordering), removed 17** after the browser/cross-chapter follow-up. All 18 cards / 46 facts accepted. Source images, keys/all alternatives, mappings/sequences, both languages, cues/duplicates, exact refs, qualitative red-row restrictions and excluded amino-acid table checked per item/fact. Removed the weak lactate-route set and the enediol paraphrase already assessed in Bioenergetics; rechecked the Vmax card's direct wording. Browser: correctly answered `glycolysis-and-fermentation-acetylcoa-pyruvate-switch` and opened PDF p60/61. Antigravity/Claude unchecked. Report: `glycolysis-and-fermentation-second-agent-review.json`.
- The citric acid cycle and PDH: fresh `second-codex-agent-check_citric` checked all 78 candidates and 55 card facts; **50 activities accepted (43 MCQ, 4 matching, 3 ordering), 28 removed; 15 cards / 55 facts accepted**. Source images, each key/alternative/mapping/order, English/Arabic, cues/duplicates, exact refs and approved p30/p32 table scope checked per item/fact. Doubtful pyruvate-carboxylation reversibility never scores. Browser: correctly answered `citric-acid-cycle-and-pdh-pdh-ratio-response` and opened PDF p12/33; the approved anaplerotic reference card renders. Antigravity/Claude unchecked. Report: `citric-acid-cycle-and-pdh-second-agent-review.json`.
- Oxidative Phosphorylation: fresh `second-codex-agent-check_oxidative` checked all 41 candidates and 28 card facts; **32 accepted activities (27 MCQ, 4 matching, 1 ordering), 9 removed; 9 cards / 28 facts accepted**. Source images, every key/alternative/mapping/order, English/Arabic, cues/duplicates, exact refs, specified electron routes, p18 table approval and excluded table-only claims checked per item/fact. Browser: correctly answered `oxidative-phosphorylation-estimated-proton-cost` and opened PDF p11/21; approved p18 accounting card renders. Antigravity/Claude unchecked. Report: `oxidative-phosphorylation-second-agent-review.json`.

## Final checks

- `npm run check`: exit 0.
- `npm test`: 99 passed, 0 failed, 0 skipped. No tests changed.
- Bank transaction regression: 3 tests passed, including preservation of published artifacts on invalid options and uncovered core concepts.
- Final subject validation/build: passed; every one of 214 core concepts has an activity or a written reasoned deferral. 172 core concepts have activities; the bank records 67 deferral entries across core and supporting concepts/partial targets. Reading cards/source pages does not imply scored coverage.
- All four unchanged originals, saved ZIP/download copies, all 154 lossless viewer images and normalized manifest hash verified. No source-page changes after that provenance pass.
- Scoring audit: all 193 accepted activities produce complete correct responses; 697 deliberately incorrect responses reject as expected.
- Recorded-check completeness audit: all 270 candidate IDs and 161 fact IDs have findings; accepted bank exactly matches the four accepted lecture authorities.
- Cross-chapter prompt/key similarity audit identified the enediol paraphrase; checker removed it. Other reviewed pairs concern different distinctions (reaction identity versus aldose/ketose class; complete balance versus direct ATP; substrate functional group versus coenzyme redox; enzyme identity versus carbon loss; TCA redox pair versus shuttle role/location). This is an additional duplicate audit, not Antigravity or Claude review.
- Protected existing books: all 238 Molecular Biology files, 264 Microbiology files and 320 Pharmacology files match baseline SHA-256. Counts remain **694, 428, 538**.
- `npm run dev` failed to bind because 127.0.0.1:4175 was already in use. Reused the existing server; the owner signed in without sharing credentials. One final-bank question was answered correctly in each chapter and its exact source-page image opened. Four QA answers exist in the task browser's new-subject history; one earlier weak-item session was ended unanswered before the item was removed. No existing book was answered, and no private progress was exported or committed.
- Actual command output and browser observations/screenshots are listed in `projects/content/exam-course/HANDOFF.md`; physical phones/tablets were not tested.

## Browser access and shelf limitation

The owner signed into the task browser; no credentials were given to the agent. The new subject opens at `http://127.0.0.1:4175/index.html?subject=metabolic-biochemistry`, labelled Midterm. The room shelf at `/app/room/index.html` still shows only the three original books after a reload. The subject registry and shared study engine recognize the new course, but automatic room-shelf appearance is **not working**. Per task, room/app code is not changed; use the direct study URL. No existing subject was answered in browser testing.

## Legacy build summary field

The unchanged bank builder emits `independentlyReviewed: true` in its generated summary when the separate-author/checker fields pass. In this task it denotes the recorded **second Codex agent** checks only. It must not be interpreted as Antigravity checking, Claude review or approval to publish. Actual reviewer identities/findings and these explicit pending-review labels govern the review claim; the generated summary was not edited by hand.
