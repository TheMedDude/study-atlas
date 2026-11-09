# Study Atlas — Project Charter & Technical Architecture

## 1. Executive Summary & Educational Philosophy

**Study Atlas** is an on-device, source-grounded cognitive learning platform engineered specifically for medical and bioscience students. 

Traditional medical study workflows suffer from two severe structural failures:
1. **Passive Slide Review (The Illusion of Competence)**: Students repeatedly read through hundreds of lecture PDF slides, recognizing familiar terms without developing the active recall or differential discrimination required for high-stakes exams.
2. **Entity Fragmentation (The Dispersal Problem)**: In modular curricula, a single organism or concept is fragmented across multiple weeks (e.g., *Escherichia coli* morphology in Week 1, genetics in Week 2, culture in Week 3, normal flora in Week 4, and toxins in Week 5). On exams, questions require immediate, unified synthesis.

Study Atlas solves both failures through a **Dual-Engine Learning Architecture**:
- **Engine 1: The Retrieval Engine (The Drill Ground)** — Adaptive practice, timed exam simulations, weak-area targeting, and an open Question Bank Library.
- **Engine 2: The Synthesis Engine (The Memorize Room)** — 360° Organism Dossiers, interactive Diagnostic Decision Trees, High-Yield Contrast Matrices with Active Occlusion, and clinical Rules of Thumb.

Crucially, these two engines are connected by a **Bi-Directional Synaptic Bridge**: Practice questions link directly to synthesis cards, and synthesis cards launch targeted micro-drills from the validated bank.

---

## 2. Core Pillars & Guardrails

1. **Zero-Hallucination Source Authority**:
   Every question, distractor, explanation, organism dossier, and flowchart is grounded 100% strictly in the authoritative lecture PDFs. No outside medical or biological facts are introduced. Uncertainties or contradictions in lecture slides are recorded in explicit registers and barred from scored answers.
2. **On-Device Data Sovereignty**:
   No mandatory accounts, tracking cookies, or external databases. Progress, answer history, bookmarks, and sessions live securely in the browser's `localStorage`, with lossless JSON backup, restore, and cross-tab reconciliation.
3. **Cognitive Ergonomics & Warm Editorial Aesthetic**:
   Designed for deep focus and reading endurance. Clean typography (Inter for English, Noto Sans Arabic for Arabic), cream/charcoal palette with coral/lime accents, 44–48px ergonomic touch targets, safe-area calibration for iPad and mobile, and full keyboard navigation.
4. **Multi-Subject Extensibility**:
   Subject configuration, source materials, assessment parameters, and progress states are strictly decoupled. New academic courses register seamlessly via `subjects/index.json`.

---

## 3. The Dual Production Pipeline

Content is authored and verified through two parallel, verifiable production lines:

```
[ Authoritative Lecture PDFs ]
              │
              ▼
   [ Complete Source Extraction & Page Ledger ]
              │
              ▼
   [ Concept Indexing & Uncertainty Register ]
              │
      ┌───────┴───────────────────────────┐
      ▼                                   ▼
[ Production Line A: Activities ]    [ Production Line B: Synthesis ]
- Discrete 5-option MCQs            - 360° Organism Dossiers
- Scored Concept Matching           - Diagnostic Decision Trees
- Logical Sequence Ordering         - High-Yield Contrast Matrices
- Independent Bilingual Review      - Clinical Rules of Thumb
      │                                   │
      ▼                                   ▼
[ activities.json ]                 [ synthesis/*.json ]
      │                                   │
      └───────┬───────────────────────────┘
              ▼
   [ scripts/validate_content.py ]
              │
              ▼
   [ Study Atlas Application ]
```

---

## 4. Feature Specifications

### 4.1 The Question Bank Library System (Practice Mode)
The Practice experience operates as a transparent question library:
- **Bank Status Dashboard**: Instant breakdown for any selected lecture(s):
  - Total Available Questions
  - Practiced / Solved count (with breakdown: `✓ Mastered` vs `↻ Missed`)
  - Unpracticed / Unseen count
- **Target Selection Modes**:
  - `All Questions`: Practice from the full chapter bank.
  - `Unpracticed Only (New)`: Continue solving remaining unseen questions without repeating completed items.
  - `↻ Missed / Review`: Drill specifically into questions previously answered incorrectly to achieve mastery.
  - `↺ Re-solve Practiced`: Re-test previously answered questions.
- **Question Bank Library Browser**:
  - Expandable drawer in setup showing every question in the selected chapter.
  - Live status badges: `✓ Mastered` (green), `↻ Missed` (coral), `• Unseen` (neutral), `★ Saved` (gold).
  - One-click `Solve ↗` button to immediately practice any individual question.

### 4.2 The Memorize Room (Synthesis Engine)
A dedicated active-synthesis studio containing four specialized cognitive tools:
1. **Bacteria Summaries ("The Bacteria Compendium")**:
   - Comprehensive entity files consolidating literal slide-by-slide facts for each organism mentioned across the course lectures.
   - Exact source slide buttons that open original PDF pages in the side-by-side viewer.
   - `[Quiz Me on This Organism]` button launching an instant micro-drill.
2. **Classification Schemes & Trees**:
   - Interactive flowcharts mirroring exact classification schemes taught in the slides: Table 5-1 Linnean Scheme (Lecture 1), Table 6.1 Oxygen Response (Lecture 3), and Slide 32 Nutritional Requirements Flowchart (Lecture 3).
   - Step-by-step branch navigation revealing classification criteria and final organism group outcomes with direct slide references.
3. **High-Yield Contrast Matrices (With Active Occlusion)**:
   - Head-to-head comparison tables for high-yield slide topics (Cell Wall Architecture, Horizontal Gene Transfer Mechanisms Table Slide 35, Surface Virulence Factors Table 7-8, Bacterial Oxygen Classes Table 6.1, and Spores vs. Vegetative Cells).
   - **Blindfold Mode**: Toggling Active Occlusion masks table cells; tapping any masked cell reveals it, enabling active recall self-testing.
4. **High-Yield Rules of Thumb & Memory Anchors**:
   - Fast-access heuristic cards (The Master Cocci Rule, The Master Bacilli Rule, The Endospore Genera Rule, The Anthrax Polypeptide Exception, Bacteria Not Seen on Gram Stain, The TSI Decoder).

---

## 5. Course Catalog & Midterm Scope Status

| Subject | Lectures | Teaching Pages | 5-Option MCQs | Total Activities | Synthesis Modules | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **General Microbiology** | 5 | 217 | 409 | 428 | Dossiers, Trees, Matrices, Rules | **Midterm Bank Active (100% Core Coverage)** |
| **Molecular Biology** | 6 | 183 | 601 | 694 | Matrices, Heuristics | **Midterm Bank Active (100% Core Coverage)** |
| **Platform Total** | **11** | **400** | **1,010** | **1,122** | **Full Synthesis Suite** | **Version 1.2 Active** |

---

## 6. Verification Commands

To verify content, provenance, and application integrity:
```powershell
# 1. Validate General Microbiology content & synthesis
python scripts/validate_content.py --subject general-microbiology

# 2. Validate Molecular Biology content & synthesis
python scripts/validate_content.py --subject molecular-biology

# 3. Syntax checks
npm run check

# 4. Automated regression suite (57+ unit & storage tests)
npm test
```
