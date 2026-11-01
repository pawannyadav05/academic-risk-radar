# Academic Risk Radar — Design System Specification

## Overview
Academic Risk Radar is a Next.js (App Router), TypeScript, Tailwind CSS + shadcn/ui web application built for Lovely Professional University (LPU) mentors and students.
- **Mentors** see students' academic risk early, identify contributing factors, and log structured interventions.
- **Students** view their own academic progress, coursework standing, and trajectories.
- **Core Principle**: The student view must be calm, clear, and non-alarming.

---

## 1. Colours

Colours are defined as CSS variables in `styles/tokens.css` and mapped into `tailwind.config`.

### 1.1 Palette
- **page**: `#F2F4F3`
- **surface**: `#FFFFFF`
- **text**: `#1B2A33`
- **muted text**: `#5B6B75`
- **border**: `#D9DFDD`
- **accent** (actions, links): `#2D5BA3`

### 1.2 Band Colours
- **steady**: `#2E8B7A`
- **watch**: `#D49A1F`
- **needs-support**: `#8A4A7B`

### 1.3 Palette Rules
- **No red anywhere on student screens**: Student views must remain encouraging and constructive; red badges, highlights, or alerts are strictly prohibited.
- **No colour-only indicators**: A band is never shown by colour alone: always pair with an icon + text label.

### 1.4 CSS Tokens (`styles/tokens.css`)
```css
:root {
  --color-page: #F2F4F3;
  --color-surface: #FFFFFF;
  --color-text: #1B2A33;
  --color-text-muted: #5B6B75;
  --color-border: #D9DFDD;
  --color-accent: #2D5BA3;
  --color-band-steady: #2E8B7A;
  --color-band-watch: #D49A1F;
  --color-band-needs-support: #8A4A7B;

  --radius-input: 4px;
  --radius-panel: 8px;
}
```

### 1.5 Tailwind Configuration Mapping (`tailwind.config`)
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        page: 'var(--color-page)',
        surface: 'var(--color-surface)',
        text: {
          DEFAULT: 'var(--color-text)',
          muted: 'var(--color-text-muted)',
        },
        border: 'var(--color-border)',
        accent: 'var(--color-accent)',
        band: {
          steady: 'var(--color-band-steady)',
          watch: 'var(--color-band-watch)',
          'needs-support': 'var(--color-band-needs-support)',
        },
      },
      borderRadius: {
        input: '4px',
        panel: '8px',
      },
      fontFamily: {
        sans: ['var(--font-atkinson)', 'sans-serif'],
      },
    },
  },
};
```

---

## 2. Type

- **One family**: Atkinson Hyperlegible Next, loaded with `next/font`. No other fonts.
- **Hierarchy**: Hierarchy through weight and size only.
- **Line length**: Body line length max 70 characters (`max-w-prose` / ~70ch).
- **Tabular numerals**: Tabular numerals in tables (`tabular-nums` / `font-variant-numeric: tabular-nums`).

---

## 3. Shape

- **Radius**: 4px on inputs and buttons, 8px on panels, none on table rows. Not one radius everywhere.
- **Borders over shadows**: Use 1px borders rather than box shadows.
- **No effects**: No gradients, glass effects or glows.

---

## 4. Layout

- **Information views**:
  - Lists are tables.
  - Detail pages are a split view.
  - History is a timeline.
- **No stat card rows**: No row of stat cards at the top of pages.
- **No hero sections**: No marketing hero sections or generic welcome banners.
- **Action focus**: Each screen has one primary action.
- **Signature element**: A weekly strip per student showing attendance and marks over time. Use it on the mentee list and the mentee detail page.

---

## 5. Copy

- **Tone**: Plain, specific, sentence case.
- **Punctuation & greetings**: No exclamation marks, no "Oops", no "Welcome back".
- **Forbidden marketing buzzwords**: Never use:
  - *Unlock*
  - *Empower*
  - *Seamless*
  - *Leverage*
  - *Supercharge*
- **Student-facing forbidden terms**: Student-facing text never uses:
  - *risk of failing*
  - *danger*
  - *alert*
  - *warning*
- **State guidance**:
  - Errors say what happened and what to do next.
  - Empty states say why they are empty and what to do.
- **Buttons**:
  - Buttons name the action ("Save conversation", not "Submit").
  - No arrow characters on buttons (e.g. no `→`, `->`, `>`).

---

## 6. Avoid (Common Generated-Site Tells)

- Identical rounded cards with the same shadow repeated down the page
- ALL-CAPS labels above headings, or a labelled eyebrow above every heading
- One word in a headline made bold, italic or coloured
- Numbered markers (01/02/03) on content that is not a sequence
- Middle-dot meta strings like "CSE · Sem 5 · K"
- Fade-and-slide-up on every section, hover effects on every card
- Placeholder data like "John Doe" or round numbers like 85% / 90%

