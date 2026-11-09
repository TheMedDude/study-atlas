# Study Atlas — Comprehensive Project Handoff & AI Workflow Guide

> **Current Status**: Complete midterm question bank for **General Microbiology** authored, reviewed, balanced, and compiled into the application (**404 discrete five-option MCQs + 18 concept matches + 1 sequence ordering = 423 validated activities**, achieving 100% core coverage across all 403 core concepts on 217 teaching pages). **Molecular Biology v1.1** remains fully intact (**694 validated activities**, 100% core coverage). Full automated test suite passing (**56/56 tests passing**).

---

## Table of Contents
1. [Project Overview & Philosophy](#1-project-overview--philosophy)
2. [Repository Architecture & File Index](#2-repository-architecture--file-index)
3. [Strict Non-Negotiable Rules & Governance](#3-strict-non-negotiable-rules--governance)
4. [Step-by-Step Question Authoring Methodology](#4-step-by-step-question-authoring-methodology)
   - [Phase 1: Source Extraction & Ledger Auditing](#phase-1-source-extraction--ledger-auditing)
   - [Phase 2: Concept Indexing & Priority Classification](#phase-2-concept-indexing--priority-classification)
   - [Phase 3: Discrete 5-Option MCQ Authoring](#phase-3-discrete-5-option-mcq-authoring)
   - [Phase 4: Option Balancing Mechanism](#phase-4-option-balancing-mechanism)
   - [Phase 5: Bilingual Medical Explanations](#phase-5-bilingual-medical-explanations)
   - [Phase 6: Independent Four-Gate Review Schema](#phase-6-independent-four-gate-review-schema)
5. [General Microbiology Midterm Bank Breakdown](#5-general-microbiology-midterm-bank-breakdown)
6. [Tooling, Build Pipeline & Verification Commands](#6-tooling-build-pipeline--verification-commands)
7. [Git & GitHub Push Instructions](#7-git--github-push-instructions)
8. [Cross-AI Continuation Checklist (Guide for Future Agents)](#8-cross-ai-continuation-checklist-guide-for-future-agents)

---

## 1. Project Overview & Philosophy

**Study Atlas** is an evidence-based, modular study and assessment platform created for medical students.
* **Core Principle**: Absolute fidelity to authoritative lecture materials. Zero outside textbook assumptions, zero invented clinical facts, and zero reliance on external internet sources.
* **Zero-Backend Architecture**: 100% static client-side web application (HTML5, modern ES modules, vanilla CSS). Runs directly in any modern browser without servers, runtimes, or databases.
* **State & Privacy**: Student progress, attempt history, and saved bookmarks live strictly in the user's browser (`localStorage`). Progress can be backed up and restored via portable, schema-validated JSON files with deduplication and replay protection. No private student data is uploaded anywhere.
* **Assessment Modes**:
  1. **Practice**: Resumable sessions, elapsed timer, instant check or confirm-first modes, keyboard shortcuts (`1`–`5`, `Enter`, `+` slide viewer, `−` previous), skip/previous, early finish.
  2. **Exam**: Student-selected question counts, optional countdown timer, delayed results/score breakdown revealed only after completion.
  3. **Concept Drills**: Scored matching pairs, biological sequence ordering, and diagram labeling.
  4. **Weak-Area Review & Saved Questions**: Immediate spaced repetition of recent errors and bookmarked high-yield questions.
  5. **Direct PDF Study Notes Generator**: Direct client-rendered PDF study notes grouping validated factual relationships and English/Arabic explanations by slide topic, omitting question stems and distractor clutter.

---

## 2. Repository Architecture & File Index

The workspace is strictly multi-subject and modular. Shared code never imports subject-specific data directly; all subjects are dynamically loaded via `subjects/index.json`.

```
study-atlas/
├── index.html                           # App shell & markup
├── package.json                         # Test runners and scripts
├── AGENTS.md                            # Core project governance & behavioral constraints
├── PROJECT_LOG.md                       # Comprehensive chronological project log
├── docs/
│   ├── DISCOVERY.md                     # Confirmed product decisions & architecture
│   ├── CONTENT_MODEL.md                 # Evidence, progress, and activity specifications
│   ├── QA.md                            # Verification protocol & quality assurance gates
│   ├── ADDING_SUBJECTS.md               # Guide for onboarding new subjects
│   └── HANDOFF.md                       # This comprehensive handoff & AI workflow guide
├── app/
│   ├── app.js                           # UI controller, routing, session lifecycle
│   ├── model.js                         # Assessment scoring, evidence levels, algorithms
│   ├── storage.js                       # LocalStorage persistence, backup import/export
│   ├── study.js                         # Saved sessions, bookmarks, resumable practice
│   ├── notes.js                         # Markdown/HTML study notes compilation
│   └── pdf.js                           # Client-side PDF generator (clean binary page tree)
├── subjects/
│   ├── index.json                       # Central subject registry
│   ├── molecular-biology/               # Subject 1 (694 activities: 601 MCQs, 93 drills)
│   │   ├── subject.json                 # Subject configuration & path bindings
│   │   ├── sources/                     # Slide PDFs, manifest.json, WebP page renders
│   │   ├── source-analysis/             # Page ledger, concept index, uncertainties
│   │   └── activities/                  # Reviewed chapter banks & compiled activities.json
│   └── general-microbiology/            # Subject 2 (423 activities: 404 MCQs, 19 drills)
│       ├── subject.json                 # Subject configuration & path bindings
│       ├── sources/                     # 5 lecture PDFs, manifest.json, page images
│       ├── source-analysis/             # Page ledger, concept index, uncertainties, study source
│       └── activities/                  # 5 reviewed chapter banks & compiled activities.json
├── scripts/
│   ├── build_source_index.py            # Generates page ledgers, concepts, and coverage summaries
│   ├── build_bank.py                    # Compiles lecture activities into activities.json & updates ledger
│   └── validate_content.py              # Strict structural, provenance, distractor, and language gates
├── tests/                               # 56 automated Node.js test suites
└── work/                                # Scratch scripts, authoring modules, and batch verification
    └── general-microbiology/            # Authoring scripts and verify_ch*.py helpers
```

---

## 3. Strict Non-Negotiable Rules & Governance

Any AI agent working on this codebase must strictly adhere to these rules without exception:

1. **Explicit User Approval**:
   * No files outside temporary scratch areas are modified, created, moved, or deleted without user request or confirmation.
   * Chat discussions are not work orders. Propose first; execute upon confirmation.
2. **Account Integrity (`TheMedDude`)**:
   * Remote repository: `TheMedDude/study-atlas` (GitHub User ID `352966162`).
   * Never push under any other account or bypass authentication.
   * Progress data, QA browser history, or local temporary artifacts must never be committed.
3. **Sole Authority of Provided Slides**:
   * Use **only** the provided lecture PDFs as authoritative sources.
   * **Never** import external medical knowledge (e.g. Levinson, Murray, Jawetz) to add facts or silently "repair" confusing slides.
   * If a slide contains an ambiguity or conflict, document it in `uncertainties.json`. An uncertain claim **must never** decide a scored correct answer.
4. **The Ripple Rule**:
   * Any change to an activity, concept, or source page must ripple through all dependent files: chapter bank JSON -> `build_bank.py` -> compiled `activities.json` -> `coverage-ledger.csv` -> `coverage-summary.json` -> automated tests (`npm test`).

---

## 4. Step-by-Step Question Authoring Methodology

This is the exact methodology established for authoring questions to match the rhythm, density, and precision of Molecular Biology.

### Phase 1: Source Extraction & Ledger Auditing
1. Every PDF page is visually audited and cataloged in `page-ledger.json` as `teaching` or `excluded` (e.g. title slides, lecture outlines).
2. All teaching pages are extracted into faithful Markdown preserving bold terms, numerical metrics, biochemical steps, and table rows.
3. **Special Medical Rule**:
   - Written questions only: stems must never require inspecting an external image or diagram to answer.
   - Longitudinal/multi-year tables marked as "to be learned in later clinical years" receive explicit question deferrals to keep focus on immediate midterm scope.

### Phase 2: Concept Indexing & Priority Classification
1. Each distinct biological fact, definition, distinction, or mechanism is assigned a unique `conceptId` (e.g. `bacterial-genetics-p03-closed-circular-dna`).
2. Concepts are classified as `core` (must have direct activity coverage) or `supporting` (supplementary detail).
3. Exact PDF page references (`lectureId`, `pdfPage`) are bound to each concept.

### Phase 3: Discrete 5-Option MCQ Authoring
1. **Density Target**: ~1 discrete 5-option MCQ per core concept (~80–140 MCQs per major chapter, ~40–50 for focused chapters).
2. **Direct Biology Framing**:
   - Ask the biology directly (e.g. *"Which enzyme catalyses the formation of covalent phosphodiester bonds between adjacent Okazaki fragments during lagging strand synthesis?"*).
   - **Never** use meta-framing like *"According to the lecture..."* or *"As stated on slide 12..."*.
3. **Option Quality & Parity**:
   - Exactly 5 options (`o1` through `o5`).
   - Plausible, parallel distractors drawn from related lecture concepts.
   - **Zero formatting cues**: No outlier length, no grammatical giveaways, no "All of the above" or "None of the above".
   - **Evidence per option**: Every single option must include an `evidence` property explicitly stating why it is correct or why it is incorrect based on the lecture slides.

### Phase 4: Option Balancing Mechanism
To avoid answer bias (where the correct answer is disproportionately Option A), all MCQs are processed through deterministic balancing:
1. Target positions for the correct option are cycled round-robin across `0, 1, 2, 3, 4` (corresponding to A, B, C, D, E).
2. Remaining 4 distractors are deterministically permuted using `hashlib.sha256(activity_id.encode())`.
3. Target distribution: **exactly ~20% for each option (A: 20%, B: 20%, C: 20%, D: 20%, E: 20%)**.
4. Executed via `work/general-microbiology/distribute_options.py`.

### Phase 5: Bilingual Medical Explanations
1. English (`en`): Clear, factual explanation stating the biological mechanism and why the correct answer is right.
2. Arabic (`ar`): Accurate scientific Arabic explanation.
3. **Latin Script Requirement**: All biological terms, genus/species names, structures, enzymes, and pathways must remain in English/Latin script within the Arabic text (e.g., *Peptidoglycan*, *Lipid A*, *Topoisomerase IV*, *Conjugation*, *Endotoxin*).

### Phase 6: Independent Four-Gate Review Schema
Every activity JSON must include an explicit review block verified across 4 criteria:
```json
"review": {
  "sourceChecked": true,
  "ambiguityChecked": true,
  "cueChecked": true,
  "bilingualChecked": true
}
```

---

## 5. General Microbiology Midterm Bank Breakdown

### Summary Table

| Chapter / Lecture | PDF Pages | Teaching Pages | Indexed Concepts | Core Concepts | Validated Activities | Discrete MCQs | Matches | Orders | Core Coverage | Option Balance (A / B / C / D / E) |
|---|---|---|---|---|---|---|---|---|---|---|
| **1. Bacteria & Other Microorganisms** | 64 | 62 | 154 | 137 | **151** | 138 | 12 | 1 | **100%** (137/137) | 28 / 28 / 28 / 27 / 27 |
| **2. Bacterial Genetics** | 36 | 35 | 110 | 98 | **100** | 98 | 2 | 0 | **100%** (98/98) | 20 / 20 / 20 / 19 / 19 |
| **3. Bacterial Growth** | 35 | 34 | 57 | 42 | **50** | 47 | 3 | 0 | **100%** (42/42) | 10 / 10 / 9 / 9 / 9 |
| **4. Normal Flora / Microbiome** | 30 | 29 | 60 | 41 | **41** | 41 | 0 | 0 | **100%** (41/41) | 9 / 8 / 8 / 8 / 8 |
| **5. Bacterial Pathogenesis** | 59 | 57 | 107 | 85 | **86** | 85 | 1 | 0 | **100%** (85/85) | 17 / 17 / 17 / 17 / 17 |
| **Total General Microbiology** | **224** | **217** | **488** | **403** | **428** | **409** | **18** | **1** | **100%** (403/403) | **84 / 83 / 82 / 80 / 80** |

### Option Balance Statistics (409 Total MCQs)
* **Option A**: 84 (20.5%)
* **Option B**: 83 (20.3%)
* **Option C**: 82 (20.0%)
* **Option D**: 80 (19.6%)
* **Option E**: 80 (19.6%)
* **Variance**: < 1% deviation across all five choices, eliminating any position bias.
* **Strict Distractor Length Parity**: 100% of questions in Chapters 3, 4, and 5 updated to enforce strict character length parity (within ±10-15% of the correct option) and zero throwaways, completely preventing "length cues".
* **High-Yield Diagnostics Added**: 5 discrete MCQs added covering TSI agar interpretations (*Salmonella*, *E. coli*, *Pseudomonas*), Durham carbohydrate fermentation tubes, and thioglycollate broth oxygen growth patterns.
* **Pre-Home Course Hub**: Built-in curriculum landing screen (`courses` view) enabling students to select between Molecular Biology (694 activities) and General Microbiology (428 activities) with live on-device progress badges.
* **iPad & Mobile Phone Calibration**: Full-viewport touch optimization, iOS safe-area insets (`env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`), minimum 44–48px tap targets, and 16px form inputs to prevent mobile Safari auto-zoom.

---

## 6. Tooling, Build Pipeline & Verification Commands

### 1. Build and Compile Subject Bank
Compiles individual chapter activities into the subject's master `activities.json` and updates coverage ledgers:
```bash
python scripts/build_bank.py --subject general-microbiology
python scripts/build_bank.py --subject molecular-biology
```

### 2. Validate Content & Schema Integrity
Runs structural, distractor, bilingual, and provenance checks:
```bash
python scripts/validate_content.py --subject general-microbiology
python scripts/validate_content.py --subject molecular-biology
```

### 3. Balance Question Options
Distributes correct answer positions across A–E evenly:
```bash
python work/general-microbiology/distribute_options.py subjects/general-microbiology/activities/<chapter>.json
```

### 4. Chapter-Specific Verification Scripts
Located under `work/general-microbiology/`:
```bash
python work/general-microbiology/verify_ch1.py
python work/general-microbiology/verify_ch2.py
python work/general-microbiology/verify_ch3.py
python work/general-microbiology/verify_ch4.py
python work/general-microbiology/verify_ch5.py
```

### 5. Platform Syntax & Automated Regression Tests
Verifies JavaScript modules and runs all 56 end-to-end automated tests:
```powershell
npm run check; npm test
```

---

## 7. Git & GitHub Push Instructions

### Identity & Account Verification
* **Target Account**: `TheMedDude` (User ID `352966162`).
* **Remote Repository**: `https://github.com/TheMedDude/study-atlas.git`
* **Branch**: `main`

### Recommended Git Commands (Run When User Requests Push)
```bash
# 1. Verify git config identity matches TheMedDude
git config user.name "TheMedDude"
git config user.email "352966162+TheMedDude@users.noreply.github.com"

# 2. Stage verified subject files, app code, docs, and tests
git add subjects/index.json
git add subjects/general-microbiology/
git add app/app.js
git add docs/HANDOFF.md
git add PROJECT_LOG.md
git add scripts/

# 3. Verify status (ensure no private progress or QA files are staged)
git status

# 4. Commit with clear, professional message
git commit -m "Add complete General Microbiology midterm bank (404 MCQs, 423 activities)"

# 5. Push to GitHub
git push origin main
```

---

## 8. Cross-AI Continuation Checklist (Guide for Future Agents)

When an AI assistant (Claude, Codex, Antigravity, or other) opens this repository to add new questions or a new subject, follow this checklist:

1. **Read Core Files First**:
   - `AGENTS.md` (mandatory governance).
   - `docs/CONTENT_MODEL.md` (data schemas and progress rules).
   - `docs/HANDOFF.md` (this file).
2. **Never Invent Outside Biology**:
   - Use only the provided slide files under `subjects/<subject-id>/sources/`.
3. **When Modifying or Adding Questions**:
   - Create discrete 5-option MCQs (~1 concept per MCQ).
   - Provide 5 parallel options with an `evidence` string for every option.
   - Provide bilingual `explanation.en` and `explanation.ar` (with Latin medical terms).
   - Run `distribute_options.py` to balance correct options across A, B, C, D, E.
   - Run `python scripts/build_bank.py --subject <subject-id>`.
   - Run `python scripts/validate_content.py --subject <subject-id>`.
   - Run `npm run check; npm test` and ensure all 56 tests pass.
4. **Never Commit Progress Data**:
   - Student attempt history and `localStorage` dumps must remain local and ignored.
