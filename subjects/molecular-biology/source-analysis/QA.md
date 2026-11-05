# Source extraction QA

All six supplied PDFs are preserved unchanged. Hash checks against the original manifest passed before extraction. The source-only extraction uses the embedded text plus a rendered image of every page; embedded text alone is incomplete for these lectures.

## Review performed

- All 191 PDF pages were rendered and visually read, including covers, course outlines, diagrams, tables, and image-only pages.
- The six lecture Markdown files contain exactly 191 ordered, one-based PDF-page sections, without gaps or duplicate page sections.
- A second agent independently checked 27 dense pages against full-page renders: Genes and Chromosomes 20/23/24/29/31/40/41; DNA Metabolism I 14/15/19/22/24/26/28/35/38; DNA Repair 6/13/17/23/29/31; RNA Metabolism I 11/14/22/23/31.
- The coordinating agent also inspected nine original rendered pages, including the PCR arithmetic, restriction-enzyme screenshot table, RFLP gel, ovalbumin processing diagram, polymerase table, transcription-factor table, and ambiguous numeric/repair statements. This pass overlaps some of the independent sample.
- The independent pass found and corrected literal newline formatting, visible-versus-hidden text provenance on Genes page 31, and an unjustified exponent-formatting normalization on RNA I page 11. Numerical table entries, diagram labels, and footnotes in the sampled pages match the originals.

## Fidelity decisions

PDF page position and printed slide numbers are separate. No printed slide numbers were visible; nullable printed-number fields are retained rather than inventing a mapping.

Source claims that conflict internally or have unclear typography are preserved with uncertainty IDs. Examples include the PCR cycle arithmetic, polymerase rates and masses, universal proofreading wording versus the explicit polymerase alpha exception, certain diagram arrow labels, and dense sequencing base calls. Only the affected claim is blocked from scoring. Clear neighboring claims remain usable.

Hidden text-layer claims are distinguished from visible slide content. Tiny or unclear sequence lettering is not silently guessed. Covers and administrative pages remain indexed and available in the original PDFs, while the teaching ledger excludes them from assessment.

No outside biology sources were used to add material or repair the lectures. Exact source examples, numerical values, figure relationships, screenshot-table rows, and legible footnotes are retained in the detailed source. Priority is an editorial source-analysis judgment, not a prediction of examination probability.

## Automated gate

`scripts/build_source_index.py` verifies contiguous page coverage, page classification, visual-review records, teaching-page concept indexing, and unchanged original hashes. It generates the consolidated source and coverage files. `scripts/validate_content.py` checks the resulting source ledger and, once present, source references and structural constraints in the reviewed activity bank.

These structural checks supplement the visual and content review; they do not establish biological truth independently of the supplied lectures. The uncertainty register remains the authority for claims held out of scored assessment.
