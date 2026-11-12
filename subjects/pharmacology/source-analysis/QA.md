# Pharmacology source QA

All283PDF pages have a reviewed page record and faithful lecture extraction. The source gate passed before any question authoring:269teaching pages,14excluded cover/objective/divider pages,576indexed concepts and66source-note records. Page priorities describe editorial emphasis within these sources, not verified exam likelihood.

## Authority and review

Only the four unchanged supplied PDFs are teaching authority. Original filenames, page counts and SHA-256 hashes are in sources/manifest.json. Full-page PNGs and contact sheets used for review are ignored under work/pharmacology. The portable viewer has283lossless WebP renders,32,881,018bytes in total; exported image dimensions, hashes, PDF hashes and decoded RGB pixels were verified by scripts/render_source_pages.py.

- Introduction & ROA:47pages,45teaching,1cover and1learning-objectives page;56concepts and6source notes. Root reviewed all contact pages and the dense abbreviation table at full size. A separate reviewer sampled7dense/visual pages and checked the full ledger/printed-label sequence; two Latin/English table tokens were corrected.
- Pharmacokinetics:95pages,90teaching,1cover and4puredividers;210concepts and24source notes. Independent review covered all contact pages and enlarged dense/clipped pages18,24,46,55,73,84. Clean reconstruction is distinguished from retained embedded text.
- Pharmacodynamics:49pages,48teaching and1cover;80uniqueconcepts and9source notes. All contact pages and dense signaling/graph pages were reviewed. Repeated concepts retain shared IDs across pages. Root additionally inspected the worked therapeutic-index graph.
- ANS and Adrenergic Drugs:92pages,86teaching and6cover/divider exclusions;230source relationships and27source notes. All contact pages and dense tables/diagrams were reviewed, including pages18,19,21,22,47,62,65,88.

## Scoring boundaries

First-three-chapter drug examples remain available in the source with supporting priority. They do not drive standalone drug-name/function recall. The fourth chapter retains drug-specific mechanisms, selectivity, uses, adverse effects and comparisons as assessment priorities. Heading-only labels, duplicated figure captions and unresolved claims receive explicit deferrals rather than fabricated activity coverage.

Unclear claims are preserved, not silently corrected from outside knowledge. Examples include the umbrella parenteral/direct-circulation wording versus subsequent IM/SC absorption; unqualified clearance wording versus dimensional formulas; unkeyed unequal-maximum potency plots; graded versus population ED50 contexts; conflicting autonomic/reflex statements; and unqualified selectivity superlatives. Clear relationships on the same pages remain usable. Explicit blocked concept IDs are rejected by validate_content.py, and independent review must also check unblocked concepts against each source-note limitation.

Root visually checked PK pages30,37,92and PD48 independently to confirm plotted phases, first/zero-order behavior and formulas used for prospective calculations. Arithmetic variants must state assumptions/units and use the source equations, with changed quantities rather than merely repeated wording.

## Reproduction

Use the bundled Python runtime with pypdf, pypdfium2 and Pillow. Existing scripts support --subject pharmacology:

- scripts/build_source_index.py consolidates reviewed lectures, page/concept indices, coverage and source notes.
- scripts/validate_content.py checks source hashes, continuous pages, extraction headings and scored-record provenance/structure when a bank exists.
- scripts/render_source_pages.py produces faithful portable source images.
- scripts/build_bank.py requires independently reviewed activities, rebuilds coverage, enforces clear-core coverage or explicit deferrals, and updates course-catalog metadata.

Structural checks supplement content review. Candidate recommendations remain under work/pharmacology/candidates; only independently accepted records may enter activities/ and the compiled bank. At this source checkpoint no Pharmacology bank has yet been compiled or deployed.

Manifest metadata hash normalization is explicit: UTF-8 without BOM and LF newlines, matching Git text normalization across Windows/Linux. Original PDF and rendered-image hashes remain hashes of the exact binary files.
