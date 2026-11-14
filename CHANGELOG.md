# Changelog

## Phases 3–7 — learning experience, sessions, funding, jobs, hardening (14 November 2026)

### Added

- **Phase 3 / V13**: lesson video, transcript and caption fields; private lesson notes; per-lesson Q&A;
  practice questions with per-course mastery; coding exercises with a `CodeRunner` abstraction; XP and
  badges from real activity; assessment attempts (retakes while results are unpublished). Practice
  quizzes for Python and SQL, three coding exercises. Rollback `R12`.
- **Phase 4 / V14**: session provider/room metadata, recurring `session_series`, recordings publishable
  as lessons, self check-in and attendance, session feedback, booking slots with capacity guards, and
  RFC 5545 `calendar.ics` exports. LiveKit when configured, Jitsi fallback. Rollback `R13`.
- **Phase 5 / V15, V18**: financial aid applications with an admin decision queue, sponsor-funded seats,
  `payment_intents` with admin confirmation (provider abstraction), course-scoped certificates and public
  verification. V18 fixes the legacy one-certificate-per-user key. Rollbacks `R14`, `R17`.
- **Phase 6 / V16**: employer job postings, single application per learner, employer screening
  (shortlist/hire/reject), saved jobs, learner portfolios, and impact reporting by country, gender and
  education level. Rollback `R15`.
- **Phase 7 / V17**: nine additive performance indexes (idempotent migration), installable PWA
  (manifest + shell-caching service worker), `docs/openapi-phase3-7.yaml` and the phase 3–7 coverage
  report. Rollback `R16`.
- **SPA**: jobs and portfolio screens for learners, employer posting and applicant decisions, lesson
  notes, practice and Q&A inside the lesson reader.
- Tests: 131 total, adding learning experience (6), sessions (4), funding (5) and careers (5) suites.

## Tech & Digital course set (14 November 2026)

### Added

- **Migration V12** (`seed tech courses`): nine attributed courses — Python, Java, SQL, mobile app
  development, data analysis, AI basics, cybersecurity, UI/UX and digital marketing — with four new career
  paths (Data & AI, Cybersecurity, Product & Design, Digital Marketing), each course carrying source,
  licence, author and attribution text. Rollback: `R11`.
- 18 modules and 36 original lessons (ids 200–235) giving every new course a real outline with outcomes.
- Tech & Digital now has 11 courses; totals are 24 courses / 43 modules / 91 lessons.

## Phase 2 — catalogue, attributed content, review workflow and ratings (14 November 2026)

### Added

- **Migration V10** (`course licensing ratings and review`): licensing/attribution columns on `courses`
  (`language`, `certificate_available`, `source_name`, `source_url`, `licence`, `licence_url`, `author`,
  `attribution_text`), `instructor_id` FK, review state (`review_status`, `review_note`, `submitted_at`,
  `approved_at`) and rating aggregates (`rating_average`, `rating_count`), plus the `course_reviews` table
  with a unique `user_id + course_id` key. Rollback: `R9`.
- **Migration V11** (`seed attributed courses`): four new academies (Math & Science, Soft Skills &
  Leadership, Career Development, Life Skills), four new courses with four career paths, attribution for
  every existing course, and 20 modules / 40 lessons across the new academies. Rollback: `R10`.
- **Instructor authoring**: `POST /api/instructor/courses` creates an attributed draft owned by the
  instructor; `POST /api/instructor/courses/{id}/submit` enforces attribution and at least one module.
- **Reviewer decisions**: `GET /api/reviewer/submissions` and `POST /api/reviewer/submissions/{id}/decision`
  (`APPROVE` publishes, `CHANGES` returns the course with a note). Self-approval is forbidden.
- **Ratings**: enrolled learners post one review per course; averages are recomputed from stored reviews.
- **Catalogue filters**: `academy`, `level`, `q`, `language`, `minHours`, `maxHours`, `certificate`,
  `minRating` on `GET /api/courses`; new `GET /api/courses/{slug}/syllabus`.
- **SPA**: catalogue filter bar with live results, attribution and review panels on the course page,
  instructor "New course" form with licence fields, submit-for-review action, and reviewer approve /
  request-changes buttons.
- Tests: `CourseWorkflowServiceTest`, `CourseReviewServiceTest` (114 tests total), docs
  `phase-2-coverage.md` and `phase-2-api.md`.

## Phase 1 — registration, roles and workspaces (14 November 2026)

### Added

- **Migration V9** (`registration roles and verification`): `users.phone_country_code`,
  `users.country_code`, `email_verification_tokens` (hashed, single-use, 24 h), and the settings
  `require_email_verification` (off) / `registration_max_per_hour` (5). Rollback: `R8`.
- **Roles** `INSTRUCTOR`, `EMPLOYER`, `REVIEWER` with account classes and polymorphic capabilities
  (`canAuthorContent`, `canReviewContent`, `canHire`), admin-created accounts, own dashboards and
  navigation in the SPA.
- **Role workspaces**: `/api/instructor/**`, `/api/reviewer/**`, `/api/employer/**`; role-specific
  dashboard statistics; read-only review queue for reviewers.
- **Registration**: dial-code select, searchable 249-country list (Africa first) with codes, phone
  normalisation, password strength meter and shared `PasswordPolicy`, registration rate limiting,
  automatic email-verification token issued on sign-up with `POST /api/auth/verify-email` and
  `POST /api/auth/resend-verification`.
- `GET /api/public/countries`, `docs/phase-1-coverage.md`, `docs/phase-1-api.md`.
- Tests: `CountryDirectoryTest`, `PasswordPolicyTest`, `VerificationServiceTest`, plus six new
  `AuthServiceTest` cases (mobile required, weak password, unknown country code, stored dial/country,
  verification gate).

### Changed

- `AuthService.signup` now takes the client address for throttling and stores the contact block.
- Content authoring checks capabilities instead of role strings; reviewers gain read-only access to
  course outlines, instructors gain authoring access.

### Verification

- 106 backend tests and 47 frontend tests pass; `node --check` clean.
- V9 applied to the dev database with every pre-existing row intact.
- Live permission matrix: instructor 200/201 on authoring, reviewer 200 read-only and 403 on writes,
  employer 200 on its own workspace, all three 403 on `/api/admin/users`.
- Live registration with `+254 / Kenya` stored the dial code and country, and the emailed code was
  redeemed successfully (200); the probe account was removed afterwards.

## Phase 0 — audit, plan and tab fix (14 November 2026)

### Added

- `docs/phase-0-audit-and-plan.md` — audit of the current system against the eight-phase brief,
  9-platform emulation matrix, phase/migration plan V9–V16, virtual-session provider recommendation
  (LiveKit primary, Jitsi fallback behind a `SessionProvider` interface) and the code-runner design
  (separate service, one container per run, no network, CPU/memory/time limits).
- `Navigation.test.tsx` case for plain-string tab labels.

### Fixed

- Tab labels can no longer be rendered one character at a time. The SPA has a single `tabStrip`
  helper that normalises every entry to a `[value, label]` pair (Users screen uses it), and the React
  `Tabs` component accepts plain strings by converting them to `{ id, label }` instead of spreading
  them. This is the class of bug behind the reported `v e / i l / o r` labels.

### Notes

- No schema change and no data change in this phase; Flyway remains at V8.


## Phase 2 — Course content, player and the one overall score (2026-11-13)

Extends `yep-backend` (`ug.yep`, database `yep`) in place. Flyway moves to **V8**; the only schema
change is one nullable column, so every existing user, module, lesson, programme and certificate is
untouched. Full endpoint list: [`docs/phase-2-api.md`](docs/phase-2-api.md).

### Database

| Migration | Purpose |
|---|---|
| `V8__course_player_and_resume.sql` | `course_enrollments.last_lesson_id` (nullable, FK to `lessons`, `ON DELETE SET NULL`) so the player can resume |
| `db/rollback/R7__rollback_course_player.sql` | Manual rollback for V8 |

### Scoring — one definition of “80 %”

| Addition | Purpose |
|---|---|
| `ProgressScoring` | Pure rule: `overall = lessons% × wL + assessments% × wA + attendance% × wT`, weights normalised from `settings`, clamped 0–100 |
| `ProgressCalculator` | Derives global, per-course and per-career-path scores, assessment average and attendance from stored rows |
| `SettingsService.weights()` | Reads `overall_weight_lessons/assessments/attendance` (40/40/20) |
| `LearningService.progress` | Now returns `overallScore` and `careerPathScores`; the Level Two gate uses the overall score instead of lessons alone |
| Monotonic gate | A learner who already has a Level Two project stays unlocked regardless of later weights, so no existing learner is retroactively locked out |

### Course content and player

| Addition | Purpose |
|---|---|
| `CourseContentService` | Module/lesson authoring (ADMIN, FACILITATOR), course outline, resume pointer, per-course progress, automatic enrolment completion |
| `CourseContentController` (`/api/courses/{slug}/outline`, `/api/me/course-progress`, `/api/courses/{id}/lessons/{id}/complete`) | Learner player API |
| `ContentController` (`/api/content/**`) | Authoring API; `SecurityConfig` restricts it to ADMIN and FACILITATOR and the service re-checks the role |
| `Module.update`, `Module(Course,…)`, `Lesson.update`, `Lesson(…, content, minutes)` | Authoring without new entities |
| `Views.CourseOutlineView`, `CourseProgressView`, `PathScoreView` | Player and progress payloads |

Rules enforced server-side: a lesson must belong to the course in the request; completing requires
an enrolment; deleting a module with lessons is refused; deleting a lesson learners completed is
refused (their evidence is never rewritten); every authoring action is audited.

### Frontend (static SPA)

- **Course player** (`#/app/course`): progress ring, total score, resume button, module/lesson list,
  lesson reader and mark-complete; Level Two courses link to the team impact project.
- **Academy catalogue**: enrolled courses now open the player instead of only showing a badge;
  enrolling goes straight into the course.
- **Dashboard / Learning Hub**: the donut and the Level Two card show the weighted overall score with
  its three inputs.
- **Admin content manager** (`Academies → All courses → Content`): add/edit/delete modules and
  lessons, with the protected-delete messages surfaced as toasts.

### Tests

`ProgressScoringTest` (7), `ProgressCalculatorTest` (7), `CourseContentServiceTest` (4) and an
updated `LearningServiceTest` (6, including the monotonic gate). `mvnw -o test` → **79 tests, 0
failures**.

### Verification performed

- Flyway applied V8 to the development database; `users` 11, `modules` 5, `lessons` 15, certificates 1
  unchanged after the migration.
- Live API: outline for the core course, participant progress, 403 for a participant on `/api/content`,
  create module → create lesson → delete module refused (400) → delete lesson (200) → delete module (200).
- `node --check` on the SPA script.
- **Browser pass (Chromium)**: signed in as the participant, enrolled from the academy catalogue,
  opened the course player and a lesson reader, then signed in as admin and opened the content
  manager and the new-lesson form. No console errors; every XHR returned 200. Screenshots in
  `docs/screenshots/phase-2-course-player.png`, `phase-2-lesson-reader.png`,
  `phase-2-admin-content.png`.

### Review fixes and additional tests

| Item | Change |
|---|---|
| Reopened lesson left the course marked complete | `CourseEnrollment.reopen()` restores `ENROLLED` and clears `completed_at`; called when a lesson is reopened in the player |
| Draft courses diluted the global percentage | The global denominator now counts lessons in **published** courses only (`LessonRepository.countInPublishedCourses`, `LessonProgressRepository.countCompletedInPublishedCourses`) |
| Player controller coverage | `CourseContentControllerTest` (5 MockMvc cases: anonymous outline, signed-in outline + resume, per-course progress, complete, reopen) |
| Enrolment badge | `CourseEnrollmentTest` (3 cases: complete → reopen, reopen when active, resume pointer) |

---

## Phase 1 — Multi-academy catalogue (2026-11-13)

This phase extends the existing `yep-backend` (`ug.yep`) system in place. The database is migrated
additively from Flyway V5 to V7; every existing user, module, lesson, application and certificate is
preserved. The React application in the repository root stays as the design reference; the shipped
UI is the vanilla SPA under `yep-backend/src/main/resources/static`.

### Database

| Migration | Purpose |
|---|---|
| `V6__academies_career_paths_and_courses.sql` | Creates `academies`, `career_paths`, `courses`, `course_enrollments` and `user_interests`; adds `modules.course_id` (backfilled for all five existing modules), nullable `programmes.course_id`, registration/profile columns and the weighted-score settings |
| `V7__seed_academy_catalogue.sql` | Seeds the six academy groups, starter career paths and starter Level One/Level Two courses |
| `db/rollback/R6__rollback_academies_courses.sql` | Manual rollback script for V6/V7 (restore from `backups/` first) |

### Backend

| Addition | Purpose |
|---|---|
| Entities `Academy`, `CareerPath`, `Course`, `CourseEnrollment` | Catalogue storage; `User` gains gender, education, employment, career goal, language, interests and consent timestamps |
| `AcademyRepository`, `CareerPathRepository`, `CourseRepository`, `CourseEnrollmentRepository` | Catalogue queries; `ModuleRepository.findByCourseId...` |
| `CatalogService` | Public catalogue reads, admin CRUD/publish, slug and validation rules, idempotent enrolment, audit trail |
| `AcademyController` (`/api/academies`, `/api/courses`, `/api/me/enrollments`) | Anonymous catalogue browsing; participant enrolment |
| `AdminCatalogController` (`/api/admin/catalogue`, `/api/admin/academies`, `/api/admin/career-paths`, `/api/admin/courses`) | Academy, career path and course management with publish toggles |
| `SecurityConfig` | Public `GET /api/academies/**` and `GET /api/courses/**`; everything else unchanged |

### Registration

- Self-registration remains **participants only** and now requires date of birth (18–35), terms and
  privacy consent, and accepts gender, education level, employment status, career goal, preferred
  language (en/sw/lg/rw) and up to 12 interests.
- Staff accounts are still created by an administrator through `POST /api/admin/users`.

### Frontend (static SPA)

- New participant **Academies** page: academy cards, career-path and course drill-down, enrolment and
  a “My courses” table.
- New admin **Academies** page: create/edit academies, career paths and courses, publish/unpublish.
- Registration form expanded with the new profile, interest and consent fields.

### Tests

`CatalogServiceTest` (10 cases: slugging, visibility, admin creation, level validation, enrolment
rules, search filters), `AcademyControllerTest` (4 HTTP cases), and `AuthServiceTest` updated for the
new signup contract plus a consent test. `mvnw -o test` → **59 tests, 0 failures**.

### Documentation

`docs/phase-1-runbook.md` (setup and run guide), `docs/phase-1-api.md` (OpenAPI-style endpoint list),
`docs/roles-and-permissions.md` (role matrix) and this changelog entry.

### Follow-up within Phase 1

| Area | Change |
|---|---|
| Admin user list | Shows country and education level, and filters the directory by both (`GET /api/admin/users?country=&education=`); `UserRepository.search` gained the two filters with a backward-compatible overload |
| Profile page | Exposes gender, education level, employment status, preferred language, career goal and interests, and saves them through the existing `PUT /api/auth/profile` |
| Step 9 tab labels | Not reproducible in source: every `<Tabs>` call site passes `{ id, label }` and the canonical "My Projects" page has no tabs. Added `Navigation.test.tsx` so a string-spread regression fails the build |
| Runbook | Removed the claim that a screenshot script exists; capture tooling is delivered with the final handover |

---

## Earlier pass — feature cleanup and fixes

All work in that pass was incremental and reversible; no feature outside the required capability list
was added. Database migrations were additive only (V11), so existing data is preserved.

---

## Removed

| Item | Reason |
|---|---|
| `YEP.zip` (65 MB) and `YouthRise_Premium_Login_Updated.zip` | Duplicate project/design archives at the repository root |
| `dist/`, `backend/target/`, empty `backend/uploads/` | Generated build output, not source |
| `launch.bat`, `start-youthrise.bat`, `start-youthrise.ps1` | Four overlapping launchers; `start.bat` is now the single portable one (the old one hard-coded `D:\capstone\YEP`) |
| `backend/HELP.md` | Spring Initializr boilerplate |
| `backend/src/main/resources/application.properties` | Duplicated `spring.application.name` and conflicted with `application.yml` |
| Participant routes `/app/exchange`, `/app/messages`, `/app/community`, `/app/calendar`, `/app/quizzes` (`ParticipantExtraPages.tsx`) | Duplicated sessions, team messaging and assessments; none appeared in navigation |
| Admin routes `/app/admin/level-one`, `/app/admin/level-two`, `/app/admin/settings` | Re-rendered views already available under Programmes/Sessions; settings had no capability or API |
| Duplicate public route `/verify-certificate` | `/verify` is the single verification URL used by every link |
| "Upgrade to Premium" sidebar promotion | Off-scope monetisation with no product feature behind it |
| `ReportingService.PENDING_REVIEW_SENTINEL` | Unused private field (dead code) |
| Profile and notification links from the sidebar | Duplicated in the top bar; navigation is now one entry per capability |

---

## Added

### Backend

| Addition | Capability |
|---|---|
| `announcement` package: `Announcement`, repository, `AnnouncementService`, `AnnouncementController` | #6 Communication — staff broadcasts scoped to a role or a programme |
| `discussion` package: `Discussion`, `DiscussionMessage`, repositories, service, controller | #6 Communication — Level One discussion threads with membership checks, pin/lock moderation |
| `AssessmentQuestion`, `AssessmentAttemptAnswer` + repositories | #5 Assessment — multiple-choice question bank and per-question answers |
| `POST /api/assessments/{id}/quiz-attempts`, `GET /api/assessments/{id}/questions`, `POST /api/assessments` | Quiz delivery, automatic scoring and assessment creation |
| `GET /api/admin/users?q=` | #8 Administration — searchable user directory |
| `POST /api/auth/password-change` | #1 Profile management — authenticated password change with session invalidation |
| `GET /api/facilitator/programmes/{id}/unassigned-participants`, `POST /api/teams/{id}/members/bulk` | #3 Team formation — participant selection and bulk assignment |
| Migration `V11__communication_and_quizzes.sql` | Tables for the above, with foreign keys, unique keys and indexes |
| `db/schema.sql` (1,087 lines, 11 migrations combined) | Create the whole database from scratch without starting the application |
| `db/seed.sql` | Fictional sample data for demonstrations |
| `start.bat` (rewritten) | One portable launcher for both services |

### Tests

| Suite | Covers |
|---|---|
| `RegistrationRulesTest` | participant-only self-registration, e-mail normalisation, invited accounts, profile completion |
| `TeamFormationRulesTest` | capacity, duplicate membership, lead identification, role change, removal |
| `AssessmentScoringRulesTest` | question scoring, one-correct-option invariant, auto-marking bounds, manual marking |
| `CertificateRulesTest` | issuance, validity, revocation, invalid input |

### Documentation

`docs/architecture-diagrams.md` (use case, class, ER, DFD 0/1, request flow), `docs/pseudocode.md`,
`docs/wireframes.md`, this changelog, and a rewritten `README.md` covering setup, database import and
verification.

---

## Changed

| Area | Change |
|---|---|
| Navigation | Participant 13 → 7 entries; facilitator, mentor, university, employer and partner trimmed to capability-only items; admin regrouped to 6 groups |
| `Certificate` | `issue()` now validates programme, participant and code; added `isValid()` |
| `Assessment` | Owns its question bank (`addQuestion`, `getQuestions`) |
| `AssessmentAttempt` | Added `autoGraded(...)` factory that applies the same score bounds as manual marking |
| `TeamService` | Added `addMembers` (all checks before the first write) and `unassignedParticipants` |
| `UserRepository` | Added `searchDirectory(term)` for the admin console |
| `TeamRepository` | Added `findByProgrammeId` |
| `AdminService` / `AdminController` | User directory endpoint |
| `AuthService` / `AuthController` | Password change with rate limiting, audit and session invalidation |
| `KeyServicesTest` | Fixed a stale `AddTeamMemberRequest` call that stopped the test sources compiling |
| Frontend build | Fixed `TS6133` unused-variable errors that failed `npm run build` |
| Sidebar | Premium promotion replaced with the programme mission card |
| README | Rewritten for the full stack (Java + MySQL + React), including env vars and import steps |

---

## Deliberately not done

- **The frontend still reads its list data from the in-browser demo store.** Removing it would leave
  the UI empty without a running MySQL instance, so it remains as an explicitly labelled offline demo.
  `VITE_DEMO_MODE=false` sends authentication and every mutation to the API; migrating the list reads
  to the service layer is the remaining integration task and is documented in the README and
  `docs/api-contract.md`.
- **No LM/AI feature** was added, so no AI disclosure flow was introduced; the responsible-AI page
  continues to describe policy only.
- **Lighthouse and axe audits were not run** in this environment (no browser audit tooling
  available); the README states that accessibility conformance is designed for but not certified.
- **PDF certificate export** remains the browser print view.
