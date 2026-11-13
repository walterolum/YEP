# YEP – Youth Empowerment Management System

A two-level youth employability programme, implemented as a Java/Spring Boot backend with a
MySQL database and the original single-page front end split into HTML, CSS and vanilla JS.
The browser and the API are served from one origin, so the whole system runs with one command.

**Level One** is five modules of three lessons each (15 lessons). **Level Two** is a team impact
project with milestones. A certificate is issued only when both levels are at 100%, and every
certificate has a public verification code and a downloadable PDF.

---

## 1. Prerequisites

| Requirement | Version used | Notes |
|---|---|---|
| JDK | 17+ (tested on 26) | `java -version` |
| Maven | wrapper included | `./mvnw` (Git Bash / macOS / Linux) or `mvnw.cmd` |
| MySQL | 8.x (tested on MariaDB 12.2) | running on `localhost:3306` |
| Browser | current Chrome/Edge/Firefox | |

Maven dependencies are resolved from the local repository (`-o` offline flag), because the build
environment has no network access. The parent is Spring Boot 4.1.2 — the only web starter present
in that offline repository — while the code uses Boot 3-compatible APIs.

## 2. Create the database

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS yep CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Flyway creates every table and loads the demo data on first start. Do **not** import the SQL files
by hand; that bypasses the migration history and Flyway will refuse to start.

## 3. Configuration

Defaults live in `src/main/resources/application.properties` and can be overridden with environment
variables (see `application-example.properties`):

| Variable | Default | Purpose |
|---|---|---|
| `DB_URL` | `jdbc:mysql://localhost:3306/yep?...` | JDBC URL |
| `DB_USERNAME` / `DB_PASSWORD` | `root` / empty | credentials |
| `APP_JWT_SECRET` | dev fallback (≥32 chars) | HS256 signing key — change in production |
| `APP_JWT_TTL_HOURS` | `2` | token lifetime |
| `PORT` | `8080` | HTTP port |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:8080` | comma-separated |
| `UPLOAD_DIR` | `uploads` | uploads live outside the web root |

Hibernate runs with `ddl-auto=none`: Flyway owns the schema. The MariaDB dialect is pinned because
the local server version is newer than Hibernate's automatic detection table.

## 4. Run

```bash
cd yep-backend
./mvnw -o spring-boot:run
# or: PORT=8080 ./mvnw -o spring-boot:run
```

Open **http://localhost:8080**.

Run the tests with:

```bash
./mvnw -o test
```

## 5. Demo accounts

Password for every seeded account: **`Password123!`**

| Role | Email | State |
|---|---|---|
| Administrator | `admin@yep.example` | approved ("YEP Administrator") |
| Participant | `amara@yep.example` | approved; seeded at 80% Level One. In the running dev database she was advanced to 100%/100% and holds certificate `YEP-2026-0001` from the certificate walkthrough |
| Participant | `brian@yep.example` | approved, 27% Level One (Level Two still locked) |
| Mentor | `grace@yep.example` | approved |
| Facilitator | `daniel@yep.example` | approved |
| Sponsor | `sponsor@yep.example` | approved |
| Participant | `pending@yep.example` | pending approval (login blocked) |
| Participant | `rejected@yep.example` | rejected (login blocked) |
| Participant | `suspended@yep.example` | suspended (login blocked) |

## 6. Business rules (all server-side)

- **Account states:** `PENDING → APPROVED | REJECTED`, `APPROVED → SUSPENDED | REJECTED`,
  `SUSPENDED → APPROVED`, `REJECTED → PENDING`. Every other transition is rejected with 400.
- **Age:** 18–35, configurable in `settings` (`min_age`, `max_age`).
- **Level One %** = completed lessons ÷ 15 (derived, never stored).
- **Level Two** unlocks at `level2_min_completion` (80%). Its % = completed team milestones ÷ total.
- **Level Two eligibility:** completion ≥ 80%, assessment average ≥ 65%, attendance ≥ 75% — all
  three thresholds are editable in Settings.
- **Certificates:** require 100% in both levels, one per participant, code `YEP-{year}-{0001}`
  sequential and unique, public verification, PDF download.
- **Assessments:** scores are hidden until an administrator/facilitator publishes results.
- **Programmes:** applications blocked when the deadline has passed, the programme is unpublished,
  is at capacity, or the participant already applied.
- **Messaging:** announcements are read-only for their audience; sponsor enquiries are answerable
  only by the sponsor and administrators; direct/team threads only by members.
- **Permissions:** the role/permission matrix is stored in `role_permissions` and enforced
  server-side for report access.

## 7. Architecture and OOP

```
ug.yep
├── YepApplication
├── config/            (security configuration lives in security/)
├── entity/            BaseEntity, User + Participant/Mentor/Facilitator/Sponsor/Admin, 30 more
├── dto/               Views (responses) and Requests (validated input)
├── repository/        Spring Data JPA interfaces
├── service/           service classes + interfaces (CertificateService, MessagingService, ReportService)
│   └── impl/          CertificateServiceImpl, MessagingServiceImpl, ReportServiceImpl
├── report/            ReportGenerator strategy + one class per report
├── controller/        thin controllers, no business logic
├── exception/         ApiException, BusinessRuleException, NotFoundException, ForbiddenException,
│                      GlobalExceptionHandler (@RestControllerAdvice)
├── security/          JwtUtil (dependency-free HS256), JwtFilter, SecurityConfig, CurrentUser
└── util/              CsvExporter, PdfExporter
```

Encapsulation: entities keep private fields and behaviour (`User.changeStatus`, `Application.decide`,
`Milestone.toggle`, `Assessment.percentage`). Controllers only translate HTTP. Strategy pattern is
used for reports, template-method-style base entity for ids/timestamps, and polymorphism for
accounts (`User.create` returns the concrete subclass; the JPA discriminator is `users.role`).

## 8. API summary

All routes are under `/api`. Send `Authorization: Bearer <token>` for authenticated routes.

### Authentication and profile

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/auth/signup` | public | Register a participant (PENDING) |
| POST | `/auth/login` | public | Sign in, returns JWT + user |
| GET | `/auth/me` | any | Current account |
| PUT | `/auth/profile` | any | Update own profile and skills |
| POST | `/auth/password` | any | Change own password |

### Public

| Method | Path | Purpose |
|---|---|---|
| GET | `/public/stats` | Landing-page counts |
| GET | `/public/programmes` | Published programmes |
| GET | `/public/mentors` | Mentor directory |
| GET | `/public/certificates/{code}` | Certificate verification |

### Programmes

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/programmes` | any | Published catalogue |
| GET | `/programmes/mine` | any | My applications |
| POST | `/programmes/apply` | any | Apply (capacity/deadline enforced) |

### Learning

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/learning/modules` | any | Modules, outcomes, lessons, progress |
| GET | `/learning/progress` | any | Level One/Two %, thresholds, eligibility |
| GET | `/learning/lessons/{id}` | any | Lesson content and duration |
| POST/DELETE | `/learning/lessons/{id}/complete` | any | Mark lesson done / undone |
| GET | `/learning/materials` | any | Resources and real free courses |
| GET/POST | `/learning/discussions` | any | Discussion board |
| POST | `/learning/discussions/{id}/posts` | any | Reply |

### Projects and teams

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/projects` | any | Projects |
| GET | `/projects/my-team` | any | My team with milestones |
| GET | `/projects/teams` | any | Teams (all for staff, mine otherwise) |
| PUT | `/projects/milestones/{id}` | team member | Tick a milestone |
| POST | `/projects` | admin | Create project + milestones |
| POST | `/projects/{id}/milestones` | admin/facilitator | Add milestone |

### Assessments

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/assessments` | any | List (participants never see hidden scores) |
| GET | `/assessments/{id}/questions` | any | Question paper |
| POST | `/assessments/{id}/submit` | any | Auto-scored submission |
| POST | `/assessments` | staff | Create with questions |
| POST | `/assessments/{id}/publish` | admin/facilitator | Publish results + notify |
| GET | `/assessments/{id}/roster` | staff | Scores roster |

### Sessions and virtual classrooms

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/sessions` | any | Sessions with registration state |
| GET | `/sessions/{id}` | any | Session + room name |
| POST | `/sessions/{id}/register` | any | Register |
| POST | `/admin/sessions` | admin | Create (assigns a virtual room) |
| PUT | `/admin/sessions/{id}/attendance` | admin | Mark present/absent |
| GET | `/admin/sessions/{id}/roster` | admin | Attendance roster |
| GET | `/facilitator/sessions` | facilitator | Delivery schedule |
| POST | `/facilitator/sessions` | facilitator | Create a session |
| GET | `/facilitator/sessions/{id}/roster` | facilitator | Attendance roster |
| PUT | `/facilitator/sessions/{id}/attendance` | facilitator | Mark present/absent |
| GET | `/facilitator/participants` | facilitator | Participant register |

Live sessions use an embedded video room (Jitsi Meet) built from `room_name`. Every "Join" or
"Open room" button opens a modal with the room in an iframe and an "open in a new tab" fallback.

### Certificates

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/certificates` | admin | Issue at 100%/100% |
| GET | `/certificates/me` | any | My certificate (204 if none) |
| GET | `/certificates/verify/{code}` | public | Verification |
| GET | `/certificates/issued` | admin/facilitator | Issued list |
| GET | `/certificates/{userId}/pdf` | owner or admin | PDF download |
| GET | `/certificates/summary` | admin | Counts |

### Messaging and notifications

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/messages` | any | My threads |
| GET | `/messages/{id}` | member | Thread with replies |
| POST | `/messages` | any | Start announcement/enquiry/DM/team thread |
| POST | `/messages/{id}/posts` | member with reply rights | Reply |
| GET | `/messages/directory` | any | People you can message |
| GET | `/messages/notifications` | any | Feed + unread count |
| POST | `/messages/notifications/read` | any | Mark all read |
| POST | `/messages/notifications/{id}/read` | any | Mark one read |

### Mentorship

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/mentorships` | participant | Request a mentor |
| GET | `/mentorships` | any | Mine (mentor or mentee view) |
| PUT | `/mentorships/{id}` | mentor | Accept/decline |
| PUT | `/mentorships/{id}/progress` | mentor | Update progress |
| POST | `/mentorships/{id}/sessions` | mentor | Schedule a meeting |
| GET | `/mentor/resources` | mentor/admin | Shared resource library |
| POST | `/mentor/resources` | mentor/admin | Add a resource |

### Sponsor

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/sponsor/impact` | sponsor/admin | Impact numbers |
| GET | `/sponsor/pledges` | sponsor/admin | My pledges |
| POST | `/sponsor/pledges` | sponsor/admin | Record a pledge |
| GET | `/sponsor/partners` | sponsor/admin | Partners |

### Administration

| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/dashboard` | Counts |
| GET | `/admin/users` | Filter by `role`, `status`, `q` |
| POST | `/admin/users` | Create an account |
| PUT | `/admin/users/{id}/status` | Status transition |
| GET | `/admin/staff` | Mentors, facilitators, sponsors |
| GET | `/admin/applications` | All applications |
| PUT | `/admin/applications/{id}` | Approve/reject |
| GET/POST | `/admin/programmes` | List / create |
| PUT | `/admin/programmes/{id}` | Update / publish |
| GET/POST | `/admin/teams` | List / create team |
| GET/PUT | `/admin/settings` | Business rules |
| GET/PUT | `/admin/permissions` | Permission matrix |
| GET | `/admin/audit` | Audit trail |
| GET | `/admin/pledges` | All pledges |
| GET | `/admin/partners` | Partners |
| POST | `/admin/announcements` | Post an announcement |

### Reports and dashboard

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/reports` | staff | Catalogue of 8 reports |
| GET | `/reports/{key}` | staff | JSON rows |
| GET | `/reports/{key}/export?format=csv\|pdf` | staff | Download |
| GET | `/dashboard` | any | Role-aware dashboard payload |

Report keys: `participants`, `enrolment`, `progress`, `assessments`, `attendance`, `certificates`,
`sponsors`, `projects`.

## 9. Front end

`src/main/resources/static/`

```
index.html        public shell
css/style.css     navy/royal/yellow design system, responsive, dark-friendly
js/api.js         fetch wrapper, token storage, authenticated downloads
js/i18n.js        language dictionaries (English, Kiswahili, Luganda, Kinyarwanda)
js/app.js         hash router and all screens
```

**Languages.** A language selector sits in the top bar (and on the sign-in, sign-up and landing
screens). It translates navigation, page headings, table headers, form labels and shared buttons
instantly, and the choice is remembered in `localStorage`. Server-provided content (people's names,
lesson bodies, notifications) is not machine-translated — lesson text is authored in English and
can be localised in the database without code changes.

The interface follows the supplied `yep-system.html` reference: navy sidebar, hero banner, stat
cards, donut/bar charts, tables, tabs, chips and modals. Each role has its own navigation:

| Role | Pages |
|---|---|
| Admin | Dashboard, Participants, Programmes, Virtual Exchange, Impact Projects, Assessments, Certificates, Reports, Settings |
| Participant | Dashboard, My Profile, Programmes, Learning Hub (modules, lesson reader, materials, discussions), My Projects (team, milestones, deliverable uploads), Sessions & Events, Assessments (quiz taking), Certificates, Notifications |

The administrator's Users screen lists every account with role tabs (participants, mentors,
facilitators, sponsors, admins), global per-role counts, creation of any role and the
approve / suspend / reject transitions.

Level Two is shown as a blinking locked card on the participant dashboard and in the Learning Hub.
It is computed from real progress: the card polls the progress endpoint while locked and re-renders
itself the moment Level One crosses 80%, with no manual reload. The API independently enforces the
same threshold, so the lock cannot be bypassed from the client.

Virtual classrooms now open in a conference panel with the session metadata, registration state,
invite-link copying, an external fallback tab and a device-check link, plus an embedded Jitsi room
that prefers a real meeting room over placeholder seed links.
| Mentor | Dashboard, My Mentees (progress, schedule meeting), Mentorship Requests, Sessions, Resources, Reports |
| Facilitator | Dashboard, Programmes, Sessions (create, attendance roster), Participants, Assessments (create/publish), Reports |
| Sponsor | Dashboard, My Contributions (pledges), Impact Reports, Partnerships, Messages |

Public screens: landing with live counts and published programmes, certificate verification, sign in
and sign up. Messages, notifications, report exports, certificate PDFs and profile/password updates
are shared across the roles that are allowed to use them. All numbers come from SQL — there is no
mock data in the client.

All user-supplied values are escaped before rendering; the JWT is kept in `sessionStorage`.

## 10. Tests

44 JUnit 5 + Mockito tests (31 service, 13 controller), no database required:

| Test class | Covers |
|---|---|
| `ProgrammeServiceTest` | capacity, deadline, duplicate application, successful apply |
| `LearningServiceTest` | Level One %, 80% unlock, certificate gate, configurable thresholds |
| `CertificateServiceTest` | eligibility, duplicate guard, sequential `YEP-YYYY-NNNN` codes, verification |
| `AssessmentServiceTest` | results hidden until published, scoring, deadline, duplicate submission |
| `MessagingServiceTest` | announcement read-only, visibility, DM/team reply rights |
| `AuthServiceTest` | all status transitions, blocked logins, signup age rule |
| `AuthControllerTest` | login token payload, signup 201 + message, current account |
| `LearningControllerTest` | progress, modules, lesson detail, completion, discussion start |
| `FacilitatorControllerTest` | participant register, sessions, creation, roster, attendance |

```bash
./mvnw -o test
# Tests run: 44, Failures: 0, Errors: 0, Skipped: 0
```

Controller tests use standalone MockMvc with mocked services and the real
`@AuthenticationPrincipal` resolver, so they assert the HTTP status, JSON field names and the
signed-in user handed to each endpoint without needing a database.

## 11. What changed, what was removed, what was assumed

**Kept:** the prototype's visual identity (navy `#0a1f5c`, royal `#1d4ed8`, yellow `#fbbf24`),
sidebar-per-role layout, and every business rule from the brief.

**Removed:** the hard-coded role switcher, duplicate page definitions, fake counters and dates,
the mock data structures (`D`, `S`, `TH`, `MODS`, `QZ`, `RP`, `ACT`, `NAMES`, `PRG`, `STU`) and the
hard-coded "Walter Olum" profile. All numbers now come from SQL.

**Added beyond the prototype:** the course syllabus with lesson notes, durations and module
outcomes; a lesson reader; real free external resources; embedded virtual classrooms for live
sessions; attendance marking; assessment creation; account creation; CSV/PDF exports.

**Assumptions:**

1. Spring Boot 4.1.2 is used because the offline Maven repository has no 3.x web starter; APIs are
   Boot 3-compatible.
2. JWT and PDF generation are dependency-free (HS256 + a small PDF writer) because jjwt and OpenPDF
   are not available offline.
3. `ddl-auto=none` + pinned MariaDB dialect: Flyway owns the schema, and the local MariaDB 12.2 is
   newer than Hibernate's detection table.
4. Video rooms use the public Jitsi Meet service (`meet.jit.si`) with a generated room name; an
   administrator can override the link per session. No YEP account is needed, and nothing is
   recorded by YEP.
5. Login rate limiting is in-memory (5 failures / 15 minutes per email), which is appropriate for a
   single-instance deployment; a cluster would need a shared store.
6. Uploads (deliverables) are stored under `UPLOAD_DIR`, outside the served web root; the upload
   endpoint accepts pdf, png, jpg, docx, pptx, fig and zip up to 10 MB.
