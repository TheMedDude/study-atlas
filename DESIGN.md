---
name: Study Atlas
description: Clear, bright course study with source-linked evidence
colors:
  cream: "#f6f3e9"
  paper: "#fffdf7"
  ink: "#26352e"
  muted: "#596659"
  line: "#dcded1"
  coral: "#ed8067"
  lime: "#e2ec98"
  focus: "#397052"
typography:
  body:
    fontFamily: "Inter, Noto Sans Arabic, system-ui, sans-serif"
    fontSize: "16px"
    lineHeight: 1.65
rounded:
  control: "8px"
  surface: "16px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
  menu-toggle:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    height: "44px"
---

# Study Atlas design system

## Overview

A clear study workspace. The user's November 12 direction favors simpler, more obvious organization and a phone/iPad experience designed around touch. Cream surfaces, dark green-charcoal text, bundled sans-serif fonts and restrained coral/lime accents retain continuity. Emphasis belongs to the current task, question and feedback.

This captures the incumbent system and the 1.3 responsive extension. It does not claim that every legacy component has already been consolidated.

## Colors

`app/tokens.css` owns shared primitives. Cream is the canvas, paper the working surface, ink the primary text and selected controls. Muted text is darker than the older token for readability. Coral/lime are accents, not body text colors. Use text and shape as well as color for answer state. Preserve organism-category colors as subject-specific data, not a second global palette.

## Typography

Self-hosted Inter and Noto Sans Arabic. Base 16px; Arabic explanations retain relaxed line height. Phone page headings use 2rem, questions 1.375rem, answer choices 1rem. Inputs stay at least 16px with touch input to avoid iOS focus zoom. Retain English technical terms where useful. Avoid tracking tighter than -0.04em.

## Layout

CSS loads in order: `tokens.css`, `styles.css`, `responsive.css`. Tokens own primitives, legacy styles own desktop components, the final responsive layer owns touched layouts. Add new responsive rules there instead of below unrelated desktop rules.

- Above 1100px: persistent left navigation; source viewer may sit beside study content.
- At 1100px and below: compact brand/Menu row and full-width subject selector. Menu opens a labeled navigation grid; selecting a destination closes it. Sources open in a full-screen dialog.
- At 600px and below: single-column study, two-column Memorize section choices and a horizontal organism directory. Touch strips scroll within themselves, never widen the page.
- Tablet Memorize: 220px directory beside flexible detail. Heading/actions stack before facts so text stays readable.
- Wide matrices/diagrams remain meaningful in local scroll containers. Do not hide document overflow to mask broken layouts.
- Study dock respects bottom safe areas and reserves enough page padding. Keyboard hints recede on phones; all actions remain available.

## Elevation & Depth

Prefer surface contrast and a thin border. Memorize containers/controls lose incidental shadows in the shared layer. Modal source viewing retains functional depth. Legacy shadows elsewhere remain consolidation work; do not invent additional palettes.

## Shapes

Controls use 8px corners; content surfaces generally 12–16px. Pills are compact filter/state controls. Touch targets are at least 44px tall; icon-only actions need 44px width. Native checkboxes retain a large clickable label instead of a 44px glyph.

## Components

- **Navigation:** authored SVG strokes, native buttons, visible focus, aria-current and Menu aria-expanded/aria-controls. No hover-only navigation.
- **Buttons:** primary for next task; outline/text for secondary actions. Preserve disabled/checked states. Coarse-pointer hover never shifts targets.
- **Questions:** self-contained prompt, parallel choices, checked feedback and adjacent source refs. Dock stays stable as feedback expands.
- **Memorize:** directory, detail and explicit section controls. Revealing values changes visibility only; it never submits an answer.
- **Source viewer:** modal focus on compact devices, exact page input, previous/next, fit/zoom, PDF fallback and safe-area padding.
- **Updates:** oldest first, latest bottom. Version metadata is not a decorative heading kicker.

## Do's and Don'ts

- Do test long terms, Arabic explanations and expanded feedback at 320, 390, 768, 820, 1024px and desktop.
- Do distinguish viewport checks, synthesized touch and physical-device evidence.
- Do label actions directly and make active states clear.
- Don't hide document overflow to make tests pass.
- Don't add decorative dashboards, fake mastery claims or unexplained icon-only actions.
- Don't change source meaning or progress schemas during design refinement.
