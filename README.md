# Study Atlas

A study platform that turns course materials into focused practice, interactive drills, and clear progress across subjects.

**[Open Study Atlas](https://themeddude.github.io/study-atlas/)** · [GitHub repository](https://github.com/TheMedDude/study-atlas)

The public website is deployed on GitHub Pages. The live release has 694 independently reviewed activities, including 601 five-option questions, and passes all 56 automated tests locally and in CI. Its published bank and both fonts were verified separately from the repository push; see PROJECT_LOG.md.

The first release implements Molecular Biology from six supplied lectures. The shared platform is separate from subject sources, assessment scope, activities and progress. GitHub repository and website deployment status are recorded separately in `PROJECT_LOG.md`.

## Study

- **Practice:** chapter/count selection or All available, immediate checking or select-then-confirm, Previous/Skip, early Finish, an elapsed clock, a fixed navigation bar, and automatic save/resume. Checked answers count even if you leave before finishing.
- **Exam:** student-selected count and optional timer; the question set stays fixed and feedback follows completion.
- **Concept drills:** automatically scored matching, ordering with equivalent steps accepted, and original-diagram choices.
- **Sources:** side-by-side and full-screen original-page viewing with zoom, exact PDF-page navigation, and original PDF downloads.
- **Explanations:** English/Arabic toggle, retaining English scientific terms in Arabic. Inter and Noto Sans Arabic are bundled locally for clear typography in both languages.
- **Question style:** direct, self-contained biology questions; source references appear with explanations. Session shortcuts offer 10/25/50/100 questions when available.
- **Saved:** bookmark questions and download factual English/Arabic PDF study notes.
- **Updates:** a simple 1.0/1.1 release list; latest at the bottom, plus a one-time summary for returning users with progress.
- **Progress:** recorded-answer totals, coverage and distinct-item evidence shown separately, with JSON backup/restore including saved questions and sessions. Progress stays in the current browser; it is never uploaded to GitHub.

## Content release

All **191 PDF pages** were visually reviewed: **183 teaching pages**, six covers and two administrative pages. The complete detailed Markdown, chapter/topic index, page ledger and coverage CSV are under `subjects/molecular-biology/source-analysis/`.

The index contains **303 concepts** and **50 source uncertainty entries**. The reviewed bank has **694 activities**: 601 five-option MCQs, 67 matching drills, 24 ordering drills and two diagram activities. It covers all **227 core concepts** and 278 total concepts. The other 25 supporting or uncertain concepts have explicit deferrals and remain visible in source coverage. Source priority is not predicted exam probability.

The lecture PDFs are the sole teaching authority. Unclear or conflicting claims are preserved and excluded from determining scored answers. See `subjects/molecular-biology/source-analysis/QA.md` and `docs/QA.md` for review and verification details.

## Run locally

Use Node.js 22 or later. The app has no package dependencies or paid runtime.

```sh
npm run dev
```

Open `http://127.0.0.1:4173`. Serve the repository over HTTP; opening `index.html` directly cannot fetch the subject files.

```sh
npm run check
npm test
```

The Python source-analysis tools need `pypdf`, `pypdfium2` and `Pillow`; they are separate from the browser runtime. Rebuild a reviewed bank with `python scripts/build_bank.py`. Only independently validated lecture files can enter the compiled bank.

## Structure

- `app/`: shared interface, scoring/evidence model and local storage.
- `subjects/index.json`: subject registry.
- `subjects/<id>/subject.json`: subject/scope, language and assessment configuration.
- `subjects/<id>/sources/`: unchanged originals, manifest, faithful page renders and provenance.
- `subjects/<id>/source-analysis/`: complete study source, concept/page indices, coverage, uncertainties and deferrals.
- `subjects/<id>/activities/`: independently reviewed lecture banks; `activities.json` is the compiled release.
- `docs/DISCOVERY.md`: preserved confirmed requirements.
- `docs/CONTENT_MODEL.md`: evidence, activity and progress contracts.
- `docs/ADDING_SUBJECTS.md`: adding source-grounded subjects without rebuilding the shared interface.

Progress describes cued activity performance. Repeating one item never increases distinct-item evidence; concepts with fewer than three variants remain at limited evidence. Earlier activity revisions are archived outside current evidence and retained in backups. History is bounded to the latest 20,000 records and portable file-size limit, with a visible history notice if older records are removed.

Account syncing and complete offline capability remain future work. No accounts are required for this release.
