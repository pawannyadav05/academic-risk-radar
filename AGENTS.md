# Workspace Rules — Academic Risk Radar

## Project & Scope Directives
- **Project**: Academic Risk Radar (Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui).
- **Purpose**: Mentors see academic risk early; students see their own progress in a calm, non-alarming view.
- **Process Guardrails**:
  - Do exactly the step asked. Do not add pages, libraries or features that were not requested.
  - If something outside the step looks wrong, say so. Do not fix it.
  - Components stay under about 120 lines. No `any`. User-visible strings go through `lib/i18n`.

---

## Design System Rules

### Colours
- Define as CSS variables in `styles/tokens.css` and map in `tailwind.config`:
  - `page`: `#F2F4F3`
  - `surface`: `#FFFFFF`
  - `text`: `#1B2A33`
  - `muted text`: `#5B6B75`
  - `border`: `#D9DFDD`
  - `accent`: `#2D5BA3` (actions, links)
  - `steady`: `#2E8B7A`
  - `watch`: `#D49A1F`
  - `needs-support`: `#8A4A7B`
- No red anywhere on student screens.
- A band is never shown by colour alone: always icon + text label.

### Type
- One family: Atkinson Hyperlegible Next, loaded with `next/font`. No other fonts.
- Hierarchy through weight and size only.
- Body line length max 70 characters.
- Tabular numerals in tables.

### Shape
- Radius: 4px on inputs and buttons, 8px on panels, none on table rows. Not one radius everywhere.
- Borders over shadows. No gradients, glass effects or glows.

### Layout
- Lists are tables. Detail pages are a split view. History is a timeline.
- No row of stat cards at the top of pages. No hero sections.
- Each screen has one primary action.
- Signature element: a weekly strip per student showing attendance and marks over time (used on mentee list and mentee detail page).

### Copy
- Plain, specific, sentence case. No exclamation marks, no "Oops", no "Welcome back".
- Never: Unlock, Empower, Seamless, Leverage, Supercharge.
- Student-facing text never uses: risk of failing, danger, alert, warning.
- Errors say what happened and what to do next. Empty states say why they are empty and what to do.
- Buttons name the action ("Save conversation", not "Submit"). No arrow characters on buttons.

### Avoid (Common Generated-Site Tells)
- Identical rounded cards with the same shadow repeated down the page.
- ALL-CAPS labels above headings, or a labelled eyebrow above every heading.
- One word in a headline made bold, italic or coloured.
- Numbered markers (01/02/03) on content that is not a sequence.
- Middle-dot meta strings like "CSE · Sem 5 · K".
- Fade-and-slide-up on every section, hover effects on every card.
- Placeholder data like "John Doe" or round numbers like 85% / 90%.

