# Design Audit — Academic Risk Radar (`apps/web`)

> **Audit Context**: Comparative assessment of the current frontend implementation in `apps/web` against the canonical design system specification in `docs/design-system.md`.
> **Mode**: Read-only audit. Findings listed by screen and file. No code modifications applied.

---

## Executive Summary: The Five Worst Screens

1. **Student Academic Standing / Progress View** (`app/(student)/risk/page.tsx` & components)
   - Severe non-compliance with the calm, non-alarming mandate: uses red status badges, red progress fills, glowing neon drop shadows, repeated dark cards, multiple emojis, and aggressive alarmist vocabulary ("Risk Score", "Risk Factor Breakdown", "High Risk", "Critical Risk", "Composite Risk Score").
2. **Mentor Alert Inbox** (`app/(mentor)/inbox/page.tsx`)
   - Monolithic 716-line component (rule: ~120 lines), contains `any`, a top row of 4 KPI stat cards, a repeated card list instead of a data table ("Lists are tables"), button with arrow character icon, floating toast notification, and arbitrary dark theme colors.
3. **Instructor Sections & Data Submission** (`app/(instructor)/sections/page.tsx`)
   - 470 lines, contains `any`, gradient buttons (`linear-gradient(135deg, #2563eb, #4f46e5)`), colored shadow glows, a row of circular stat cards, ALL-CAPS headers, and multiple inconsistent radii.
4. **Admin Connectors & Quarantine View** (`app/(admin)/connectors/page.tsx`)
   - 522 lines, contains `any`, a top row of 5 KPI stat cards with ALL-CAPS headers, hardcoded dark mode palette, and mismatched component radii.
5. **Mentor Interventions Screen** (`app/(mentor)/interventions/page.tsx` & modals)
   - Gradient buttons (`linear-gradient(135deg, #3b82f6, #6366f1)`), top row of stat cards, ALL-CAPS eyebrows, exclamation marks in confirmation messages, and heavy modal backdrop drop shadows.

---

## Detailed Findings by Screen

---

### Screen 1: Student Academic Standing View
*Directory: `apps/web/app/(student)/risk/`*

#### 1. `app/(student)/risk/page.tsx`
- **1. Hard-coded colours or fonts**: Font family declared as `'Inter', 'Segoe UI', system-ui, sans-serif` (violates Atkinson Hyperlegible Next requirement). Hard-coded background `#090e1a` and text `#e2e8f0`.
- **2. Gradients, glows, shadows, radii**: Inline margin hack `margin: "-2rem"` to override root shell; rigid `320px 1fr` grid.
- **3. Repeated card layouts**: Split view is attempted but wrapped inside dark container panels instead of clean border panels.
- **4. Stat-cards / hero / ALL-CAPS / arrows**: N/A on page container itself.
- **5. Copy issues**: Generic fallback strings ("Student", "Failed to load student standing.").
- **6. Placeholder / unrealistic seed data**: Fallback mock values: section `SEC-CSE-101`, department `DEP-CSE`, programme `B.Tech (Computer Science & Engineering)`, email `student@radar.edu`, attendance rate fallback `1.0` (round 100%), assessment average fallback `0.8` (round 80%).
- **7. Student-facing forbidden words**: 
  - `"Authentication required. Please log in as a student to view your academic risk standing."`
  - `"Failed to fetch risk calculation"`
  - `riskScore={riskPct}`, `rawRiskScore` passed down to child views.

#### 2. `app/(student)/risk/components/StudentProfileCard.tsx`
- **1. Hard-coded colours or fonts**: Hardcoded palette `#22c55e`, `#f59e0b`, `#ef4444`, `#dc2626`, `#0f172a`, `#1e293b`, `#0d1f3c`, `#162544`, `#0f2238`, `#f8fafc`, `#f97316`, `#475569`, `#64748b`, `#f1f5f9`.
- **2. Gradients, glows, shadows, radii**:
  - Gradient banner: `linear-gradient(120deg, #0d1f3c 0%, #162544 50%, #0f2238 100%)`.
  - Neon glow shadow: `boxShadow: 0 0 0 3px #0f172a, 0 0 18px ${bandInfo.color}55`.
  - Radius: `16px` on card, `50%` on avatar, `9999px` on badge.
- **3. Repeated card layouts**: Protruding avatar hero card with banner.
- **4. Stat-cards / hero / ALL-CAPS / arrows**:
  - Hero profile banner section with overlapping avatar.
  - Row of big stat numbers (2rem CGPA, 2rem Attendance).
  - ALL-CAPS labels: `textTransform: "uppercase"`, `letterSpacing: "0.1em"`, "CGPA", "ATTENDANCE".
  - Middle-dot string: ` · Model ${modelVersion}`.
  - Emojis used as tab icons: `"🧮"`, `"📊"`.
- **5. Copy issues**: Tab copy "Risk Overview" rather than calm progress terminology.
- **6. Placeholder data**: Initials fallback `"ST"`.
- **7. Student-facing forbidden words**:
  - Direct red colours on student screen: `#ef4444`, `#dc2626`.
  - Forbidden student labels: `"Low Risk"`, `"Moderate Risk"`, `"High Risk"`, `"Critical Risk"`.
  - Tab title: `"Risk Overview"`.

#### 3. `app/(student)/risk/components/PersonalInfoCard.tsx`
- **1. Hard-coded colours or fonts**: Hardcoded dark theme `#0f172a`, `#1e293b`, `#f1f5f9`, `#0d1526`, `#94a3b8`, `#090e1a`, `#64748b`, `#f97316`.
- **2. Gradients, glows, shadows, radii**: Radius `16px` on outer card, `10px` on inner meta box.
- **3. Repeated card layouts**: Card containing nested secondary card.
- **4. Stat-cards / hero / ALL-CAPS / arrows**:
  - Emojis as icons: `👤`, `✉️`, `🆔`, `🏫`, `🏛️`.
  - ALL-CAPS eyebrow: `SCORING ENGINE` (`textTransform: "uppercase"`, `letterSpacing: "0.1em"`).
- **5. Copy issues**: "Scoring Engine" metadata exposed directly in student view.
- **6. Placeholder data**: "Assigned Section", "Computer Science".
- **7. Student-facing forbidden words**:
  - `"Composite Risk: {riskScore} / 100"`
  - `"Assigned Band: {bandInfo.label}"` (renders "High Risk", "Critical Risk" in student screen).

#### 4. `app/(student)/risk/components/MetricsSummaryCards.tsx`
- **1. Hard-coded colours or fonts**: Hardcoded `#0f172a`, `#1e293b`, `#f1f5f9`, `#64748b`, `#f59e0b`, `#22c55e`.
- **2. Gradients, glows, shadows, radii**: Radius `16px` on all three cards.
- **3. Repeated card layouts**: Row of 3 identical square cards each housing an SVG donut chart.
- **4. Stat-cards / hero / ALL-CAPS / arrows**:
  - Stat-card row pattern: `gridTemplateColumns: "repeat(3, 1fr)"`.
  - Emojis as header icons: `⚡`, `🏫`, `📝`.
- **5. Copy issues**: Generic threshold strings ("In good standing (≥75%)").
- **6. Placeholder data**: Rigid denominator scales ("out of 10", "/ 100").
- **7. Student-facing forbidden words**:
  - `"Risk Score"`
  - Displays band label containing `"Risk"` (e.g., "High Risk", "Critical Risk") directly to student.

#### 5. `app/(student)/risk/components/FactorBreakdownList.tsx`
- **1. Hard-coded colours or fonts**: Hardcoded `#0f172a`, `#1e293b`, `#f1f5f9`, `#64748b`, `#f97316`, `#475569`, `#090e1a`, `#ef4444`, `#f59e0b`, `#22c55e`.
- **2. Gradients, glows, shadows, radii**:
  - Radii: `16px` on card, `12px` on item, `4px` on badge, `3px` on progress bar.
- **3. Repeated card layouts**: Repeated stacked card rows with borders and background fills instead of a clean table.
- **4. Stat-cards / hero / ALL-CAPS / arrows**:
  - Emojis: `🏫`, `📝`, `📋`, `💻`, `📉`, `⚙️`.
  - ALL-CAPS labels: `"TOP DRIVER"`, `"Σ COMPOSITE RISK SCORE"`.
  - Middle-dot string: `Weight: XX% · Raw deficit: XX%`.
- **5. Copy issues**: Exposes mathematical scoring formulas (`SUM(weight × factor value) across all academic signals`) to student.
- **6. Placeholder data**: Hardcoded weight / deficit formatting.
- **7. Student-facing forbidden words**:
  - Active red bar on student screen: `factor.contribution >= 0.07 ? "#ef4444"`.
  - `"Risk Factor Breakdown"`.
  - `"Σ Composite Risk Score"`.
  - Band labels containing `"Risk"`.

#### 6. `app/(student)/risk/components/DonutRing.tsx`
- **1. Hard-coded colours or fonts**: Font declared as `system-ui, sans-serif`. Hardcoded track `#1e293b`, text `#f1f5f9` and `#64748b`.
- **2. Gradients, glows, shadows, radii**: SVG circular progress ring instead of signature weekly strip.
- **3. Repeated card layouts**: N/A (component primitive).
- **4. Stat-cards / hero / ALL-CAPS / arrows**: Gauge/donut visual presentation.
- **5. Copy issues**: N/A.
- **6. Placeholder data**: N/A.
- **7. Student-facing forbidden words**: Used to display risk score values.

#### 7. `app/(student)/risk/components/StudentRiskEmpty.tsx`
- **1. Hard-coded colours or fonts**: Font family `'Inter', 'Segoe UI', system-ui, sans-serif`. Colors `#e2e8f0`, `#090e1a`, `#0f172a`, `#1e293b`, `#2563eb`, `#3b82f6`, `#f8fafc`, `#64748b`, `#94a3b8`.
- **2. Gradients, glows, shadows, radii**: Heavy drop shadow: `boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)"`. Radius `16px` on panel, `50%` on icon container, `8px` on button (should be 4px).
- **3. Repeated card layouts**: Floating modal-like card in empty state.
- **4. Stat-cards / hero / ALL-CAPS / arrows**: Circular icon container atop greeting.
- **5. Copy issues**:
  - Banned greeting & exclamation mark: `"Welcome, {studentName || "Student"}!"` (violates "no Welcome back / Welcome" and "no exclamation marks").
- **6. Placeholder data**: Fallback `"Student"`.
- **7. Student-facing forbidden words**:
  - `"Your academic risk profile has not been calculated yet."`

#### 8. `app/(student)/risk/components/StudentRiskError.tsx`
- **1. Hard-coded colours or fonts**: Font `'Inter', 'Segoe UI', system-ui, sans-serif`. Colors `#e2e8f0`, `#090e1a`, `#0f172a`, `#ef4444`, `#fca5a5`, `#f8fafc`.
- **2. Gradients, glows, shadows, radii**: Radius `16px` on card, `50%` on icon, `8px` on button.
- **3. Repeated card layouts**: Centered alert card.
- **4. Stat-cards / hero / ALL-CAPS / arrows**: Circular icon container.
- **5. Copy issues**: Button label "Retry Connection" rather than simple specific action.
- **6. Placeholder data**: N/A.
- **7. Student-facing forbidden words**:
  - Heavy red UI on student screen: border `rgba(239, 68, 68, 0.3)`, icon `#ef4444`, background `rgba(239, 68, 68, 0.12)`, text `#fca5a5`, button `#ef4444` (violates "No red anywhere on student screens").
  - Icon: `AlertCircle` (violates "Student-facing text never uses: alert").

#### 9. `app/(student)/risk/components/StudentRiskSkeleton.tsx`
- **1. Hard-coded colours or fonts**: Font `'Inter', 'Segoe UI', system-ui, sans-serif`. Background `#090e1a`, `#0f172a`, `#1e293b`.
- **2. Gradients, glows, shadows, radii**: Radii `16px` across all placeholder blocks.
- **3. Repeated card layouts**: Replicates the 3-stat-card row skeleton (`gridTemplateColumns: "repeat(3, 1fr)"`).
- **4. Stat-cards / hero / ALL-CAPS / arrows**: Stat-card layout skeleton.
- **5. Copy issues**: N/A.
- **6. Placeholder data**: N/A.
- **7. Student-facing forbidden words**: N/A.

---

### Screen 2: Mentor Alert Inbox Screen
*File: `apps/web/app/(mentor)/inbox/page.tsx`*

- **File Length & TypeScript**: **716 lines** (violates ~120-line limit). Contains `catch (err: any)` (violates `no any`).
- **1. Hard-coded colours or fonts**: Hardcoded colors `#f59e0b`, `#10b981`, `#ef4444`, `#94a3b8`, `#f87171`, `#fbbf24`, `#60a5fa`, `#065f46`, `#d1fae5`, `#0f172a`, `#1e293b`, `#334155`, `#cbd5e1`, `#34d399`, `#3b82f6`.
- **2. Gradients, glows, shadows, radii**: 
  - Toast shadow: `boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.4)"`.
  - Inconsistent radii: `6px`, `8px`, `10px`, `12px` across different elements.
- **3. Repeated card layouts**: **Alerts rendered as repeated cards** (`borderRadius: "12px"`, `border: "1px solid #1e293b"`) instead of a table view ("Lists are tables").
- **4. Stat-cards / hero / ALL-CAPS / arrows**:
  - **Row of 4 KPI Stat Cards** at the top of the page (`gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))"` with 1.875rem count callouts).
  - Arrow icon on button link: `<ArrowRight size={15} />` on "Log Mentoring Action" (violates "No arrow characters on buttons").
  - Floating top-right toast notification (violates "Inline confirmation next to the action").
- **5. Copy issues**:
  - Banned word / buzzword in code comment: `"seamless intervention logging handover"`.
  - Subtitle: `"Module M5: Real-time risk alert routing, SLA breach tracking, and rapid intervention dispatch."` (internal module names exposed to UI).
- **6. Placeholder data**: N/A.
- **7. Student-facing forbidden words**: N/A (mentor screen, but uses alert/risk terminology internally).

---

### Screen 3: Instructor Sections & Performance Ingestion
*File: `apps/web/app/(instructor)/sections/page.tsx`*

- **File Length & TypeScript**: **470 lines** (violates ~120-line limit). Contains `catch (err: any)` (violates `no any`).
- **1. Hard-coded colours or fonts**: Monospace stack `"ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"`. Colors `#059669`, `#d97706`, `#dc2626`, `#7f1d1d`, `#eff6ff`, `#3b82f6`, `#f8fafc`, `#cbd5e1`, `#475569`, `#0f172a`, `#64748b`, `#e2e8f0`, `#f0fdf4`, `#bbf7d0`, `#166534`, `#fef2f2`, `#fecaca`, `#991b1b`, `#2563eb`, `#4f46e5`.
- **2. Gradients, glows, shadows, radii**:
  - Gradient button: `background: "linear-gradient(135deg, #2563eb, #4f46e5)"` (violates "No gradients").
  - Button box shadow: `boxShadow: "0 2px 6px rgba(37,99,235,0.25)"`.
  - Panel box shadow: `boxShadow: "0 1px 3px rgba(0,0,0,0.05)"`.
  - Inconsistent radii: `6px`, `8px`, `10px`, `12px`, `14px`, `50%`.
- **3. Repeated card layouts**: Ingestion panel, feedback banner, metric cards, and charts all styled as separate standalone rounded cards.
- **4. Stat-cards / hero / ALL-CAPS / arrows**:
  - **Row of 2 KPI stat cards** with circular icon badges (`Users`, `AlertTriangle` in 50% circular container).
  - ALL-CAPS labels: `"INSTRUCTOR PORTAL"`, `"CSV CONTENT PREVIEW / DIRECT INPUT:"`.
- **5. Copy issues**:
  - Button text: `"Submit & Recalculate Risk"` (generic word "Submit").
- **6. Placeholder data**:
  - `SAMPLE_CSV` contains `STU-001`, `STU-002`, `STU-003`, `ERP_MOCK`, `RFID_01`.
  - Hardcoded assigned section fallback `["SEC-CSE-101"]`.
- **7. Student-facing forbidden words**: N/A (staff portal).

---

### Screen 4: Admin Connectors & Quarantine Workspace
*File: `apps/web/app/(admin)/connectors/page.tsx`*

- **File Length & TypeScript**: **522 lines** (violates ~120-line limit). Contains `rawRecord: any`, `stats?: any`, `catch (err: any)`.
- **1. Hard-coded colours or fonts**: Monospace font declared inline. Dark colors `#090e1a`, `#0b1222`, `#1e293b`, `#f8fafc`, `#94a3b8`, `#64748b`, `#22c55e`, `#ef4444`, `#38bdf8`, `#334155`, `#cbd5e1`.
- **2. Gradients, glows, shadows, radii**:
  - Mismatched radii: `6px`, `8px`, `12px` across buttons, cards, and badges.
- **3. Repeated card layouts**: Ingestion workspace and status overview repeated as dark cards.
- **4. Stat-cards / hero / ALL-CAPS / arrows**:
  - **Row of 5 KPI Stat Cards** across the top of the dashboard (`Attendance`, `Assessments`, `Assignments`, `LMS Activity`, `Quarantine`).
  - ALL-CAPS labels: `textTransform: "uppercase"` on each stat card header title.
- **5. Copy issues**:
  - Generic wording on actions and status cards.
- **6. Placeholder data**:
  - Hardcoded sample dataset strings: `STD001`, `STD002`, `STD003`, `SEC_A`, `RFID_GATE_1`, `ERP_SYSTEM`.
- **7. Student-facing forbidden words**: N/A (admin screen).

---

### Screen 5: Mentor Interventions Workspace
*Directory: `apps/web/app/(mentor)/interventions/`*

#### 1. `app/(mentor)/interventions/page.tsx`
- **1. Hard-coded colours or fonts**: Colors `#f8fafc`, `#f97316`, `#94a3b8`, `#3b82f6`, `#6366f1`, `#0f172a`, `#1e293b`, `#64748b`, `#22c55e`, `#f59e0b`, `#86efac`, `#fca5a5`.
- **2. Gradients, glows, shadows, radii**:
  - Gradient button: `background: "linear-gradient(135deg, #3b82f6, #6366f1)"` (violates "No gradients").
  - Radii: `8px`, `10px`.
- **3. Repeated card layouts**: Three stat panels arranged side-by-side.
- **4. Stat-cards / hero / ALL-CAPS / arrows**:
  - **Row of 3 stat cards** across the top (`Active Interventions`, `Pending Outcome`, `Improved Outcome`).
  - ALL-CAPS eyebrow: `"MODULE M6"` (`textTransform: "uppercase"`, `letterSpacing: "0.05em"`).
- **5. Copy issues**:
  - Exclamation marks in confirmation messages: `"Intervention created successfully!"`, `"Outcome updated successfully!"`, `"Intervention withdrawn successfully!"` (violates "No exclamation marks").
- **6. Placeholder data**: N/A.
- **7. Student-facing forbidden words**: N/A.

#### 2. `app/(mentor)/interventions/components/InterventionList.tsx`
- **1. Hard-coded colours or fonts**: Monospace font declared inline for alert IDs. Colors `#22c55e`, `#f59e0b`, `#ef4444`, `#94a3b8`, `#0f172a`, `#1e293b`, `#0b1120`, `#f1f5f9`, `#64748b`, `#334155`, `#38bdf8`, `#475569`.
- **2. Gradients, glows, shadows, radii**: Radii `14px` on container, `8px` on filter buttons, `999px` on badges. Table rows lack borders over card container.
- **3. Repeated card layouts**: Renders as a table (compliant with "Lists are tables"), but nested inside a rounded card wrapper.
- **4. Stat-cards / hero / ALL-CAPS / arrows**:
  - Table header uses ALL-CAPS (`textTransform: "uppercase"`).
- **5. Copy issues**: Generic empty state: `"No interventions found in this view."` (does not say what to do next).
- **6. Placeholder data**: N/A.
- **7. Student-facing forbidden words**: N/A.

#### 3. `app/(mentor)/interventions/components/InterventionForm.tsx`
- **1. Hard-coded colours or fonts**: Colors `#0f172a`, `#1e293b`, `#f8fafc`, `#94a3b8`, `#64748b`, `#334155`, `#cbd5e1`, `#fca5a5`, `#3b82f6`, `#6366f1`.
- **2. Gradients, glows, shadows, radii**:
  - Heavy modal backdrop shadow: `boxShadow: "0 20px 40px rgba(0,0,0,0.5)"`.
  - Gradient button: `background: "linear-gradient(135deg, #3b82f6, #6366f1)"`.
  - Radii: `14px`, `8px`.
- **3. Repeated card layouts**: Modal overlay box.
- **4. Stat-cards / hero / ALL-CAPS / arrows**: Preset buttons grid.
- **5. Copy issues**: Action button says `"Log Intervention"` (acceptable, but gradient styled).
- **6. Placeholder data**: N/A.
- **7. Student-facing forbidden words**: N/A.

#### 4. `app/(mentor)/interventions/components/OutcomeModal.tsx`
- **1. Hard-coded colours or fonts**: Colors `#22c55e`, `#f59e0b`, `#ef4444`, `#64748b`, `#0f172a`, `#1e293b`, `#f8fafc`, `#94a3b8`, `#38bdf8`, `#fca5a5`, `#334155`, `#3b82f6`, `#6366f1`.
- **2. Gradients, glows, shadows, radii**:
  - Heavy modal drop shadow: `boxShadow: "0 20px 40px rgba(0,0,0,0.5)"`.
  - Gradient button: `background: "linear-gradient(135deg, #3b82f6, #6366f1)"`.
  - Radii: `14px`, `10px`, `8px`.
- **3. Repeated card layouts**: Modal grid with 4 outcome selection cards.
- **4. Stat-cards / hero / ALL-CAPS / arrows**: 2x2 grid of buttons.
- **5. Copy issues**: "Save Outcome" button.
- **6. Placeholder data**: N/A.
- **7. Student-facing forbidden words**: N/A.

#### 5. `app/(mentor)/interventions/components/WithdrawModal.tsx`
- **1. Hard-coded colours or fonts**: Monospace font on alert ID. Colors `#0f172a`, `#ef4444`, `#f8fafc`, `#64748b`, `#cbd5e1`, `#1e293b`, `#334155`, `#94a3b8`, `#f1f5f9`, `#38bdf8`, `#fbbf24`, `#fca5a5`, `#dc2626`.
- **2. Gradients, glows, shadows, radii**: Heavy drop shadow: `boxShadow: "0 20px 40px rgba(0,0,0,0.6)"`. Radii `14px`, `8px`, `6px`.
- **3. Repeated card layouts**: Modal overlay dialog.
- **4. Stat-cards / hero / ALL-CAPS / arrows**: N/A.
- **5. Copy issues**: "Confirm Withdrawal" action button.
- **6. Placeholder data**: N/A.
- **7. Student-facing forbidden words**: N/A.

---

### Screen 6: HoD Department Dashboard
*File: `apps/web/app/(hod)/hod-dashboard/page.tsx`*

- **1. Hard-coded colours or fonts**: Colors `#1e293b`, `#6366f1`, `#0f172a`, `#64748b`, `#f8fafc`, `#cbd5e1`, `#e0e7ff`, `#4f46e5`, `#1e1b4b`, `#4338ca`, `#475569`, `#e2e8f0`, `#eff6ff`, `#3b82f6`, `#fef2f2`, `#dc2626`, `#b91c1c`, `#fecaca`.
- **2. Gradients, glows, shadows, radii**: Radii `12px` on cards, `8px` on icon containers, `50%` on stat icon circles, `999px` on roadmap pill badge.
- **3. Repeated card layouts**: Three repeated stat cards side-by-side.
- **4. Stat-cards / hero / ALL-CAPS / arrows**:
  - **Row of 3 stat cards** at the top (`Total Department Students`, `Students At Risk`, `Escalated Alerts`).
  - ALL-CAPS labels: `"HOD MANAGEMENT PORTAL"`, `"STAGE 3 ROADMAP (WEEK 13)"`.
  - Roadmapping deferral notice banner.
- **5. Copy issues**: Explanatory developer roadmap text ("As specified in the Master Stage Plan...") in end-user screen.
- **6. Placeholder data**: Fallback department ID `"CSE"`.
- **7. Student-facing forbidden words**: N/A.

---

### Screen 7: Dean Institution Dashboard
*File: `apps/web/app/(dean)/dean-dashboard/page.tsx`*

- **1. Hard-coded colours or fonts**: Colors `#1e293b`, `#8b5cf6`, `#0f172a`, `#64748b`, `#f8fafc`, `#cbd5e1`, `#f3e8ff`, `#7c3aed`, `#2e1065`, `#6d28d9`, `#475569`, `#e2e8f0`, `#eff6ff`, `#3b82f6`, `#fef2f2`, `#dc2626`, `#16a34a`, `#bbf7d0`, `#166534`, `#fecaca`, `#b91c1c`.
- **2. Gradients, glows, shadows, radii**: Radii `12px`, `8px`, `50%`, `999px`.
- **3. Repeated card layouts**: Three repeated stat cards side-by-side.
- **4. Stat-cards / hero / ALL-CAPS / arrows**:
  - **Row of 3 stat cards** at the top (`Total Enrolled Students`, `Students At Risk`, `Intervention Success Rate`).
  - ALL-CAPS labels: `"EXECUTIVE DEAN PORTAL"`, `"STAGE 3 ROADMAP (WEEK 13)"`.
  - Roadmapping deferral banner.
- **5. Copy issues**: Roadmapping text ("As planned in the Master Specification Blueprint...") presented in production UI.
- **6. Placeholder data**: N/A.
- **7. Student-facing forbidden words**: N/A.

---

### Screen 8: Authentication Screen (Sign In)
*Files: `apps/web/app/login/page.tsx` & `apps/web/app/login/LoginForm.tsx`*

- **1. Hard-coded colours or fonts**: 
  - `page.tsx`: Font declared as `Source Serif 4, Georgia, serif` (violates single font family Atkinson Hyperlegible Next). Colors `#E4ECE9`, `#3F5E5A`, `#FAF7F2`, `#94A3B8`, `#FFFDF9`, `#E6DFD5`, `#6F665E`, `#2B2623`, `#EFE8DE`, `#8C827A`.
  - `LoginForm.tsx`: Colors `#6F665E`, `#3F5E5A`, `#FFFDF9`, `#FBF2EE`, `#E4C8BD`, `#B5654A`, `#2B2623`, `#D8C7B5`.
- **2. Gradients, glows, shadows, radii**:
  - Multi-layer box shadow: `boxShadow: "0 1px 3px rgba(43,38,35,0.06), 0 4px 16px rgba(43,38,35,0.06)"`.
  - Radii: `20px` pill on badge, `8px` on card, `6px` on inputs and buttons (inputs/buttons should be 4px).
- **3. Repeated card layouts**: Centered login card container.
- **4. Stat-cards / hero / ALL-CAPS / arrows**:
  - ALL-CAPS labels: `"INSTITUTIONAL ACCESS CONTROL · WEEK 9"`, `"SECURE SIGN IN"`.
  - Middle-dot string: `Institutional Access Control · Week 9`.
- **5. Copy issues**: Sub-footer refers directly to repository technical artifacts: `"Refer to README.md for evaluation credentials."`
- **6. Placeholder data**:
  - Input placeholder lists demo accounts: `"e.g. instructor@radar.edu, mentor@radar.edu, student@radar.edu"`.
- **7. Student-facing forbidden words**: N/A.

---

### Screen 9: Institutional Access Forbidden Screen (403)
*File: `apps/web/app/forbidden/page.tsx`*

- **1. Hard-coded colours or fonts**: Colors `#FFFDF9`, `#E6DFD5`, `#E4ECE9`, `#3F5E5A`, `#B5654A`, `#2B2623`, `#6F665E`, `#FAF7F2`.
- **2. Gradients, glows, shadows, radii**: Box shadow: `boxShadow: "0 2px 8px rgba(43, 38, 35, 0.04)"`. Radii `10px` on card, `6px` on icon and buttons.
- **3. Repeated card layouts**: Centered dialog card.
- **4. Stat-cards / hero / ALL-CAPS / arrows**:
  - ALL-CAPS label: `"403 · ACCESS RESTRICTED"`.
  - Middle-dot string: `403 · Access Restricted`.
  - Icon on button: `<ArrowLeft size={16} />` on "Return to Dashboard".
- **5. Copy issues**: Technical governance copy ("Under institutional governance rules...").
- **6. Placeholder data**: Fallback "Unknown", "No email".
- **7. Student-facing forbidden words**: N/A.

---

### Screen 10: Root Landing Page
*File: `apps/web/app/page.tsx`*

- **1. Hard-coded colours or fonts**: Colors `#ffffff`, `#475569`, `#e2e8f0`, `#1e293b`, `#64748b`, `#0284c7`.
- **2. Gradients, glows, shadows, radii**: Box shadow: `boxShadow: "0 1px 3px rgba(0,0,0,0.1)"`. Radius `8px` on container, `6px` on links.
- **3. Repeated card layouts**: 2x2 grid of identical rounded clickable cards with borders and shadows.
- **4. Stat-cards / hero / ALL-CAPS / arrows**:
  - Hero card section greeting.
- **5. Copy issues**:
  - Banned headline structure: `"Welcome to Academic Risk Radar"` (violates "no Welcome back" / generic greetings).
  - Internal module labels exposed in links: `"(Admin / M1)"`, `"(Admin)"`.
- **6. Placeholder data**: N/A.
- **7. Student-facing forbidden words**:
  - `"Student Early Support View"` link description: `"View academic indicators and contributing risk factors..."`.

---

### Screen 11: Global Layout Shell
*File: `apps/web/app/layout.tsx`*

- **1. Hard-coded colours or fonts**: Font declared as `fontFamily: "system-ui, -apple-system, sans-serif"`. Hardcoded dark shell `#090e1a`, `#f8fafc`, `#0b1222`, `#ffffff`, `#1e293b`, `#f97316`, `#f1f5f9`, `#64748b`, `#38bdf8`, `#334155`, `#0f172a`, `#94a3b8`, `#f87171`.
- **2. Gradients, glows, shadows, radii**: Radii `6px`, `4px`.
- **3. Repeated card layouts**: N/A (header shell).
- **4. Stat-cards / hero / ALL-CAPS / arrows**:
  - ALL-CAPS text: square marker `■`, `"EARLY WARNING PLATFORM"`, role badge (`textTransform: "uppercase"`).
- **5. Copy issues**:
  - Title subtitle: `"Early Warning Platform"` (violates student calm non-alarming mandate).
- **6. Placeholder data**: N/A.
- **7. Student-facing forbidden words**:
  - Title and header branding persistently displays `"Academic Risk Radar"` and `"Early Warning Platform"` across student sessions.

---

### Screen 12: Admin Scaffolds (Model Versions & Audit Logs)
*Files: `apps/web/app/(admin)/model-versions/page.tsx` & `apps/web/app/(admin)/audit/page.tsx`*

- **1. Hard-coded colours or fonts**: Hardcoded `#ffffff`, `#64748b`.
- **2. Gradients, glows, shadows, radii**: Radius `8px`.
- **3. Repeated card layouts**: Card placeholder container.
- **4. Stat-cards / hero / ALL-CAPS / arrows**: N/A.
- **5. Copy issues**: Scaffold placeholder text referencing module codes ("Scaffold — Module M8").
- **6. Placeholder data**: Static placeholder descriptions.
- **7. Student-facing forbidden words**: N/A.

---

## Summary Matrix Across All 7 Design System Criteria

| Screen | 1. Hardcoded Colours / Fonts | 2. Gradients / Glows / Radii | 3. Repeated Cards (Not Tables/Timeline) | 4. Stat-Card Rows / Hero / ALL-CAPS / Arrows | 5. Banned Words / Exclamation / Generic Copy | 6. Placeholder / Unrealistic Seed Data | 7. Student-Facing Risk / Alarmist Text |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Student Risk / Progress** | ❌ Multiple | ❌ Glows, 16px radius | ❌ Repeated nested cards | ❌ Hero banner, emojis, ALL-CAPS | ❌ "Welcome, Student!", math formulas | ❌ Round 80%, 100%, fallback IDs | ❌ Red badges/bars, "Risk Score", "Critical Risk" |
| **Mentor Alert Inbox** | ❌ Multiple | ❌ Toast shadow, 4 radii | ❌ Cards instead of data table | ❌ 4 Stat-card row, `<ArrowRight />` button | ❌ "seamless", internal M5 codes | ❌ Search query ID fallbacks | N/A (Staff) |
| **Instructor Sections** | ❌ Multiple | ❌ Linear gradient, shadows | ❌ Standalone panel cards | ❌ 2 Stat-card row, ALL-CAPS | ❌ "Submit" action button | ❌ Hardcoded sample CSVs | N/A (Staff) |
| **Admin Connectors** | ❌ Multiple | ❌ Multiple radii | ❌ Panel blocks | ❌ 5 Stat-card row, ALL-CAPS headers | ❌ Generic status labels | ❌ `STD001`, `RFID_GATE_1` mocks | N/A (Staff) |
| **Mentor Interventions** | ❌ Multiple | ❌ Linear gradients, 40px shadows | ❌ Status cards & modal cards | ❌ 3 Stat-card row, ALL-CAPS eyebrows | ❌ Exclamation marks in 3 toast messages | N/A | N/A (Staff) |
| **HoD Dashboard** | ❌ Multiple | ❌ Multiple radii | ❌ Stat panels | ❌ 3 Stat-card row, ALL-CAPS eyebrows | ❌ Roadmap deferral text in UI | ❌ Fallback "CSE" | N/A (Staff) |
| **Dean Dashboard** | ❌ Multiple | ❌ Multiple radii | ❌ Stat panels | ❌ 3 Stat-card row, ALL-CAPS eyebrows | ❌ Roadmap deferral text in UI | N/A | N/A (Staff) |
| **Login Screen** | ❌ Inline serif | ❌ 16px multi-shadow, 20px pill | ❌ Centered card | ❌ ALL-CAPS eyebrows, middle dots | ❌ "Refer to README.md" | ❌ In-field demo emails | N/A (Pre-auth) |
| **403 Forbidden** | ❌ Multiple | ❌ Box shadow, 10px radius | ❌ Centered card | ❌ ALL-CAPS eyebrows, `<ArrowLeft />` | ❌ Governance jargon | ❌ Fallback "Unknown" | N/A |
| **Home Page** | ❌ Multiple | ❌ Box shadow | ❌ 2x2 rounded card grid | ❌ Hero-style navigation card grid | ❌ "Welcome to...", internal codes | N/A | ❌ "contributing risk factors" |
| **Global Layout Shell** | ❌ Dark theme | ❌ Fixed 6px/4px | N/A | ❌ ALL-CAPS badges, square symbol | ❌ "Early Warning Platform" subtitle | N/A | ❌ "Early Warning" / "Risk" persistent header |

