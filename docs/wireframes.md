# Wireframe descriptions

Layout descriptions for the major pages. Each page has **one purpose** and **one primary action**, with
a 12-column grid on desktop, a single column below 768 px and 16 px gutters at 360 px.

---

## 1. Public home (`/`)

```
+------------------------------------------------------------------+
| [logo] YouthRise        Programmes  How it works  Impact  [Sign in]|
+------------------------------------------------------------------+
|  dark hero: headline (h1), one-sentence promise,                  |
|  [Join YEP] primary   [See programmes] secondary                  |
|  right: illustrative exchange-network graphic (labelled)          |
+------------------------------------------------------------------+
|  3 capability cards: Level One · Level Two · Recognition          |
+------------------------------------------------------------------+
|  "How it works" 4-step horizontal strip (mobile: vertical)        |
+------------------------------------------------------------------+
|  Final call to action: [Create an account]                        |
+------------------------------------------------------------------+
| footer: programme links · legal · accessibility · verify          |
+------------------------------------------------------------------+
```

Purpose: explain the programme. Primary action: **Join YEP**.

---

## 2. Sign in (`/login`)

```
+-------------------------------+----------------------------------+
|  dark stage with segmented ring|  editorial photograph + chips    |
|   [logo]                      |                                  |
|   "Welcome back"  (h1)        |  static, hidden below 1024 px    |
|   Email        [__________]   |                                  |
|   Password     [__________]   |                                  |
|   [ ] Remember me  Forgot?    |                                  |
|   [ Sign in ]  full width     |                                  |
|   New here? Create an account |                                  |
+-------------------------------+----------------------------------+
```

Purpose: authenticate. Primary action: **Sign in**. Errors appear above the field, announced via
`aria-live`.

---

## 3. Registration (`/register`)

```
[h1 Create your account]
[Full name]            [E-mail]
[Phone (optional)]     [Country]
[Date of birth]  <-- hint: YEP is for young people aged 18-35
[Password]  strength hint, one rule per line
[Interests] chip selector
[x] I accept the privacy notice   (required)
[ ] Send me programme updates     (optional)
[ Create account ]  primary, full width
```

Purpose: create one eligible account. Primary action: **Create account**. Eligibility errors come back
from the server and are shown on the date-of-birth field.

---

## 4. Participant dashboard (`/app`)

```
Sidebar (7 items)        | Topbar: search · bell · profile menu
                         +------------------------------------------+
                         | [h1] Welcome back, Amara                 |
                         | progress ring | next session | team card |
                         +------------------------------------------+
                         | Announcements (3 newest, "View all")     |
                         +------------------------------------------+
                         | Next actions: continue lesson · submit   |
                         | milestone · assessment due               |
                         +------------------------------------------+
```

Purpose: answer "what do I do next". Primary action: the single next action card (progressively
disclosed; everything else is secondary).

---

## 5. Programme catalogue and detail (`/programmes`, `/programmes/:id`)

```
Catalogue: [search] [level v] [theme v] [sort v]   "12 programmes"
           card grid, 3 / 2 / 1 columns
           empty state: "No programmes match those filters" + [Clear filters]

Detail:    breadcrumb · [h1] title · level badge · dates · commitment
           tabs: Overview | Modules | Sessions | Discussions
           sticky aside: enrolment status + [Enrol now] primary
```

Purpose: choose a programme. Primary action: **Enrol now**.

---

## 6. Learning centre and lesson (`/app/programmes`, `/app/learning/:programmeId/:lessonId`)

```
Learning centre: [h1] My learning
   module accordion: title · n of m lessons · progress bar
   lesson rows: title · type icon · duration · [Open]

Lesson: breadcrumb · [h1] lesson title · type · duration
   body: measured 68ch column, headings, lists, one resource link
   [Mark complete] primary, right aligned
   pager: ← Previous | Next →
```

Purpose: read and complete one lesson. Primary action: **Mark complete**.

---

## 7. Team workspace (`/app/team`)

```
[h1] My team                                  [Create a team] primary
[team name] [theme] [capacity 3/5]
members table: name · role chip · joined · actions (lead only)
tab: Overview | Discussion | Milestones
empty state: "You are not on a team yet" + explanation + primary action
```

Purpose: coordinate one team. Primary action depends on state: **Create a team** or **Post message**.

---

## 8. Impact project (`/app/project`)

```
[h1] project title · status badge · team name
Problem statement (read-only card)
Milestones timeline: status pill · due date · [Submit evidence]
Evidence dialog: file picker (type/size validated) + note + [Submit]
Mentor feedback list: author · date · body · revision flag
```

Purpose: track and submit one project. Primary action: **Submit evidence** on the current milestone.

---

## 9. Assessments (`/app/assessments`)

```
[h1] Assessments      tabs: Available | Submitted | Graded | Locked
rows: title · type · due · status · [Start] / [View feedback]
Quiz view: progress "3 of 8 answered", question card with radio options,
           [Submit answers] disabled until every question is answered
Written view: textarea + character counter + [Submit]
```

Purpose: complete one assessment. Primary action: **Submit answers**.

---

## 10. Certificates (`/app/certificates`)

```
[h1] Certificates and badges
card: programme · level · issued date · code · [Download] [Verify]
pending card: checklist of what remains
badges grid: earned (colour + label) vs not yet earned (outline + label)
```

Purpose: see and share recognition. Primary action: **Download** (print view).

---

## 11. Public verification (`/verify`)

```
[h1] Verify a certificate
[code input] [Verify] primary
result states: valid (green + details) · revoked (red + reason)
             · not found (neutral) · pending (amber)
```

Purpose: check one code. Primary action: **Verify**. Rate limited against enumeration.

---

## 12. Facilitator workspace (`/app/facilitator/...`)

```
Overview: 4 stat cards · cohort progress table · pending reviews
Programmes: list + [Create programme] dialog (progressive disclosure)
Cohorts: roster table with progress, attendance, completion risk chips
Sessions: schedule list + [Schedule session]
Teams: team list, member counts, mentor assignment,
       [Form team] -> select participants from "not yet placed"
Assessments: list + [Create assessment] (quiz builder: question, options,
       correct answer, points; total must equal max score)
Reports: charts above, data table below, export button
```

Purpose per page: one management task. Primary action: the single create/assign button.

---

## 13. Mentor workspace (`/app/mentor/...`)

```
Overview: assigned teams · reviews waiting
Reviews: submission card -> decision radio (approve / revise) + feedback textarea [Save review]
Meetings: upcoming list + [Schedule meeting]
```

---

## 14. Admin console (`/app/admin/...`)

```
Dashboard: summary cards (users, active programmes, cohorts, pending, incidents, certificates)
Users: [search] [role v] [status v] table + row actions (status, role, invite)
Programmes / Sessions / Projects / Certificates: table + detail drawer
Announcements: compose [title][message][audience] -> [Publish]
Governance: incidents and privacy queues with status filters and note-required resolution
Audit: filterable log, [Export CSV]
Reports: aggregate charts with small-cell suppression notice
```

Purpose per page: one administrative decision. Destructive actions open a confirmation dialog that
names the object and the consequence.

---

## Responsive behaviour

| Width | Behaviour |
|---|---|
| 360 px | single column, 16 px gutters, sidebar becomes a modal drawer, tables become stacked cards, primary action full width |
| 768 px | two-column grids, tables keep 2–3 columns, top bar keeps search |
| 1024 px+ | persistent sidebar, three-column grids, sticky side panels |
| 1440 px+ | content capped at 1280 px with centred gutters |

Every interactive target is at least 44 × 44 CSS px on touch, and no layout scrolls horizontally at
320 px.
