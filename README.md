# Study Atlas

A study platform that turns course materials into focused practice, interactive drills, and clear progress across subjects.

## Project status

Product discovery is complete. The first subject is Molecular Biology, using six lecture PDFs totaling 191 PDF pages before covers and administrative pages are excluded. Full extraction, study-question authoring, and application implementation are next.

The public repository is https://github.com/TheMedDude/study-atlas. This initial handoff establishes the plan and source materials; a live study website is a later development milestone.

## Project structure

- `docs/DISCOVERY.md`: confirmed platform and first-subject decisions.
- `subjects/molecular-biology/sources/manifest.json`: lecture IDs, page counts, original filenames, and file hashes.
- `subjects/molecular-biology/sources/slides/`: unchanged copies of the six uploaded lecture PDFs.
- `AGENTS.md`: instructions for continuing in Codex.

Add future subjects under `subjects/<subject-id>/`, with their own source inventories, chapters, validated activities, and progress namespaces. Keep shared study modes, settings, and the interface independent of the first subject.

## Confirmed direction

Warm editorial design with a cream background, charcoal text, coral/lime accents, strong typography, and clear layouts. English questions; English/Arabic explanation toggle retaining English scientific terminology. Five-option MCQs and automatically scored concept/diagram drills. No typed answers or confidence prompts.

Practice checks on option click by default, with a select-then-confirm setting. Exam sessions use a student-selected count and optional timer. Progress starts on each device with export/import; account syncing comes later.

## Next work

1. Extract faithful, slide-indexed Markdown and visually verify figures and screenshot tables.
2. Build a concept and coverage index, marking administrative exclusions and uncertain source content.
3. Author and audit source-linked MCQs and automatically scored concept drills.
4. Implement the shared platform and first subject using the confirmed design and settings.
5. Validate study behavior, source links, progress backup/restore, and mobile usability before website deployment.
