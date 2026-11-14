# Changelog

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
