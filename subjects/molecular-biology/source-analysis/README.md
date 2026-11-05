# Source-analysis methods

- Originals are immutable. `sources/manifest.json` records each SHA-256 hash and PDF-page count.
- `scripts/extract_sources.py` verifies those hashes, extracts the embedded text, renders every PDF page with PDFium, and creates four-page review sheets under ignored `work/extraction/`.
- Human-readable extraction is authored from both rendered pages and extracted text. Image-only pages, diagrams, screenshot tables, and footnotes require visual reading. The embedded text is an aid, not the authority.
- One record per PDF page records page kind, visible printed number (or null), topics, concepts, visual review, and source uncertainty. An uncertainty blocks only the unresolved claim, not every clear statement on its page.
- `scripts/build_source_index.py` checks contiguous page coverage, review status, and immutable original hashes, then builds the consolidated Markdown, chapter index, concept index, uncertainty register, and coverage ledger.
- The page ledger records exclusions explicitly; excluded pages remain available in the original PDFs. All teaching content from the supplied six files is in scope.
- `activityAvailability: not-yet-authored` means a concept is extracted but has no validated activity. It must not disappear from progress denominators or be called mastered.

Priority rationale is source emphasis, prerequisite relationships, repeated comparisons, mechanisms, and named processes. Priority is not a claim about exam probability. Supporting details and unclear claims remain in the complete source even when they receive no scored activity.

The extracted source records what these lectures teach. Source inconsistencies remain visible, without silently substituting outside biology facts.
