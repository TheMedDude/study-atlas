# Adding a subject

The browser app reads `subjects/index.json`; it does not import Molecular Biology content into shared code. Each registry entry points to a subject configuration. The selector loads the selected configuration through `?subject=<id>`, and progress is namespaced by subject ID and assessment-scope ID.

Add a new folder under `subjects/<subject-id>/` containing:

1. `subject.json`: title, scope ID/title, question/explanation languages, assessment settings, source paths, and optional short chapter labels.
2. `sources/manifest.json`: immutable original-file inventory, PDF counts and hashes. Each lecture has a stable ID, title, original filename, relative PDF path and PDF-page count.
3. Reviewed source analysis: one record per PDF page, chapter/topic and concept indices, and an uncertainty register. Preserve printed numbering separately from PDF positions. Future subjects need their own authoritative source review.
4. A consolidated study source and coverage ledger. Every source concept stays visible even without an activity.
5. An independently reviewed `activities.json` using the shared interaction fields described in `CONTENT_MODEL.md`. MCQ option count belongs to the subject configuration. The app supports automatically scored MCQs, matching, ordering with interchangeable groups, and original-diagram choices.
6. Optional faithful page images and provenance index for a portable source viewer. The first subject uses full-page lossless WebP renders; original PDFs remain available for download. Set `paths.pageImages` in the configuration.

Register `{ "id": "<subject-id>", "config": "<subject-id>/subject.json" }` in `subjects/index.json`. No invented second subject is shipped with the first release.

The current Python content-generation scripts and source-specific tests target Molecular Biology. Reuse their validation patterns with the new source's own scope and schema; do not copy its midterm scope, five-option format, or English/Arabic choices as universal subject requirements. The shared browser model and source/progress separation remain independent.

Activity IDs are stable. Increment an activity's revision when scored meaning changes; earlier local responses are archived outside current evidence and retained in backups. Keep source references exact and do not let unreviewed candidate banks enter the app.
