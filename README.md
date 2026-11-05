# Study Atlas

A study platform that turns course materials into focused practice, interactive drills, and clear progress across subjects.

## Project status

Product discovery is complete. The first subject is Molecular Biology, using six lecture PDFs totaling 191 PDF pages before covers and administrative pages are excluded. Source extraction and analysis are complete: 183 teaching pages, 8 cover/administrative exclusions, 303 indexed concepts, and 50 uncertainty entries. Source-linked activity authoring and application implementation are in progress.

The public repository is https://github.com/TheMedDude/study-atlas. The repository now contains the reviewed study source and coverage ledger. A live study website remains a separate deployment milestone.

## Project structure

- `docs/DISCOVERY.md`: confirmed platform and first-subject decisions.
- `subjects/molecular-biology/sources/manifest.json`: lecture IDs, page counts, original filenames, and file hashes.
- `subjects/molecular-biology/sources/slides/`: unchanged copies of the six uploaded lecture PDFs.
- `subjects/molecular-biology/source-analysis/`: complete slide-indexed source, concept index, coverage ledger, and uncertainty register.
- `docs/CONTENT_MODEL.md`: source-linked activity contracts and honest evidence policy.
- `AGENTS.md`: instructions for continuing in Codex.

Add future subjects under `subjects/<subject-id>/`, with their own source inventories, chapters, validated activities, and progress namespaces. Keep shared study modes, settings, and the interface independent of the first subject.

## Confirmed direction

Warm editorial design with a cream background, charcoal text, coral/lime accents, strong typography, and clear layouts. English questions; English/Arabic explanation toggle retaining English scientific terminology. Five-option MCQs and automatically scored concept/diagram drills. No typed answers or confidence prompts.

Practice checks on option click by default, with a select-then-confirm setting. Exam sessions use a student-selected count and optional timer. Progress starts on each device with export/import; account syncing comes later.

## Next work

1. Author and independently audit source-linked MCQs and automatically scored concept drills.
2. Implement the shared platform and first subject using the confirmed design and settings.
3. Validate study behavior, source links, progress backup/restore, and mobile usability before website deployment.
