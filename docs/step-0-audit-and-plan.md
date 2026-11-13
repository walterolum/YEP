# Step 0 — Audit, Gap Analysis and Phased Plan

**Status:** audit complete; **decisions taken** (§10). No schema objects or existing data have been
changed. Implementation starts in Phase 1.
**Date:** 13 November 2026
**Scope:** audit the existing YEP codebase against the multi-academy + careers (jobs) mission,
propose the migration path, and obtain a decision on the canonical system before Phase 1.

---

## 1. Executive summary

1. **Two complete applications coexist in this repository.** They share a name and a business
   vocabulary but not a line of code, a schema, a security model or a frontend:

   | | `yep-backend/` | `backend/` + root `src/` |
   |---|---|---|
   | Package | `ug.yep` | `com.youthrise` |
   | Java | 17 (tested on 26) | 21 |
   | Spring Boot | 4.1.2 | 4.1.2 |
   | Auth | Stateless JWT (`Authorization: Bearer`) | HttpOnly session cookie + CSRF |
   | DB | `yep` — 36 tables, Flyway V1–V5 applied | `youthrise` — 45 tables, Flyway V1–V8 + repeatable demo seed applied (V9–V11 present but **not applied**) |
   | Frontend | Static SPA served by Spring (`static/index.html`, `js/app.js`, `css/style.css`), same origin | React 19 + TS + Vite 8 + Tailwind, separate origin (5173), `VITE_DEMO_MODE=true` by default |
   | Roles | ADMIN, PARTICIPANT, MENTOR, FACILITATOR, SPONSOR | + EMPLOYER, UNIVERSITY, PARTNER (7) |
   | Tests | 44 JUnit tests, last run green | Domain + React tests, last run green |
   | Last touched | 13 Nov 2026 (running on :8080) | 29 Oct 2026 |
   | Live data | 11 users, 5 programmes, 15 lessons, submissions, certificate | 11 users, seeded demo content |

2. **Neither system has the academy hierarchy.** There is no `academy`, `career_path`, `course`,
   `job_posting`, `job_application`, `coding_exercise`, `test_case` or `payment` table in either
   database. Both stop at *Programme → Module → Lesson*.
3. **`yep-backend` is the better base** for this mission (see §7): it is the live, API-first system,
   has the real 80 % rule, server-side certificates, audit log, attendance, i18n and no browser
   demo-store debt. The React app has the richer visual design and the employer/partner roles, but
   its list screens still read `localStorage`, which cannot support a real jobs marketplace.
4. **The 80 % rule is currently defined three different ways** (lessons only; three-threshold
   eligibility; "always true"). §6 proposes one definition and asks for approval.
5. **The Step 9 tab bug is not reproducible in the current source.** All React `<Tabs>` call sites
   pass `{ id, label, count }` objects and the component reads `item.label`; the vanilla "My
   Projects" page has no tabs. It was either fixed after the screenshot or the screenshot came from a
   stale build. A regression test will be added when the canonical frontend is chosen (§8).

**Nothing below is applied. Phase 1 starts only after the five decisions in §10 are answered.**

---

## 2. How this audit was produced

- Read both `README.md` files, both `pom.xml` files, both security configurations, both
  `application.*` files, all Flyway migrations and the React router/navigation.
- Queried the live MariaDB 12.2 instance on `127.0.0.1:3306` (`yep` and `youthrise`) for table
  counts, migration history, settings and role-permission rows.
- Read the registration, learning, certificate and team-formation code paths in both systems.
- Searched both source trees for `academy`, `career`, `course`, `job`, `vacanc`, `exercise`,
  `test_case`, `payment`, `scholarship`, `offline`, `rating`, `upvote`.
- Inspected `yep-run.log` (most recent run) for runtime errors.

No server was started, no migration was executed, no file was modified before this report.

---

## 3. What exists today (inventory)

### 3.1 `yep-backend` — `ug.yep`, database `yep`

- **Layers:** `entity → repository → service → controller`, thin controllers, `@RestControllerAdvice`
  error handling, DTO records in `dto/Views.java` and `dto/Requests.java`.
- **Security:** `security/SecurityConfig.java` (URL rules per role), `JwtFilter`, `JwtUtil`
  (dependency-free HS256), `CurrentUser` principal. JWT in `sessionStorage`.
- **Domain:** users with single-table inheritance (`Participant`, `Mentor`, `Facilitator`,
  `Sponsor`, `Admin`), programmes + applications, teams + members + projects + milestones +
  deliverables, 5 modules / 15 lessons + progress, assessments + questions + submissions,
  attendance, certificates (server-side PDF), discussions, messages/threads, mentorships, pledges,
  partners, notifications, audit log, settings, role-permissions.
- **Business rules enforced server-side:** pending/rejected/suspended login blocking, age 18–35 from
  `settings`, programme capacity/deadline/duplicate application, Level Two unlock at
  `level2_min_completion` (80), Level Two eligibility = completion ≥ 80 **and** assessment average
  ≥ 65 **and** attendance ≥ 75, certificate at 100 %/100 % (one per user), assessment results hidden
  until published.
- **Frontend:** hash-router SPA with per-role navigation, 4 languages (English, Kiswahili, Luganda,
  Kinyarwanda), dark-friendly design, escape-on-render, real SQL numbers.
- **Gaps relevant to the mission:** no academy/career/course model; no jobs; no coding exercises;
  no payments/scholarships; no per-lesson discussion or Q&A voting; no course/path certificates;
  no offline/PWA; no video URL/transcript/low-data mode; no ratings; registration misses gender,
  education level, employment status, career goal, language, interests and explicit terms/privacy
  consent.

### 3.2 `backend` + root `src/` — `com.youthrise`, database `youthrise`

- **Layers:** package-by-feature (`user`, `programme`, `project`, `assessment`, `badge`,
  `notification`, `auth`, `admin`, `partner`, `employer`, `report`, `exchange`, `discussion`,
  `announcement`), `common` base entity/exceptions/audit/rate limiter.
- **Security:** session cookie + CSRF double-submit, method-level role rules, rate limiting on
  auth/reset/verify/certificate, PII-minimising DTOs, audit log, consent records.
- **Domain:** programmes/modules/lessons/enrolments, exchange sessions, teams/projects/milestones/
  submissions/feedback, assessments/attempts/certificates, badges, talent profiles, saved talent,
  introductions, nominations, incidents, privacy requests.
- **Frontend:** polished React design system, public site, seven role workspaces, typed service
  layer with CSRF handling. **But** `VITE_DEMO_MODE` defaults to `true` and list reads come from
  `src/lib/demoDb.ts` (`localStorage`); only mutations go to the API. README §8 calls this the
  "remaining integration task".
- **Gaps:** same academy/jobs/coding/payments gaps as above. Also **V9–V11 are not applied** to the
  live `youthrise` database, so the running schema is behind the source. `TeamService.createTeam`
  only checks role for Level Two; `Participant.isEligibleForLevelTwo()` returns `true`.

### 3.3 Live database state (queried, not modified)

| Database | Tables | Flyway state | Users |
|---|---|---|---|
| `yep` | 36 | V1–V5, all successful | 11 (ADMIN, FACILITATOR, MENTOR, PARTICIPANT ×7, SPONSOR) |
| `youthrise` | 45 | V1–V8 + repeatable `demo seed`; **V9–V11 absent** | 11 |

`yep.settings` currently holds: `min_age=18`, `max_age=35`, `level2_min_completion=80`,
`level2_min_score=65`, `level2_min_attendance=75`, `require_approval=true`,
`email_notifications=true`, `low_bandwidth=false`.

`yep.role_permissions` is a 5-role × 5-permission matrix (Manage users, Programmes, Assessments,
Certificates, Reports) — a useful starting point for the final roles-and-permissions deliverable.

### 3.4 Runtime warning observed

`yep-run.log` shows repeated MariaDB `ErrorCode 1020 / SQLState HY000: Record has changed since last
read in table 'users'` while the app was serving requests. It is a warning, requests continued, but
it points at concurrent writes to the same `users` row (likely `recordLogin()` racing with profile
or status updates). It should be reproduced and fixed during Phase 1 hardening, not ignored.

---

## 4. Requirement coverage matrix

Legend: **✔** exists and is usable · **◐** partial / needs extension · **✘** missing.

| Mission requirement | `yep-backend` | `backend`/React | Notes |
|---|---|---|---|
| Extend, do not rebuild | ✔ | ✔ | Both are real Spring Boot apps |
| Academy → Career Path → Course → Module → Lesson | ✘ | ✘ | Both have Programme → Module → Lesson only |
| Admins add academies without code changes | ✘ | ✘ | No academy CRUD anywhere |
| Six academy groups seeded | ✘ | ✘ | Not present in source or DB |
| Level One → Level Two at overall 80 % | ◐ | ✘ | `yep` uses lessons ≥ 80 + 65 assessment + 75 attendance; `youthrise` gate is a no-op |
| Completing a path leads to real work | ✘ | ✘ | No jobs, placements or employer pipeline |
| Registration (rich learner profile) | ◐ | ◐ | Both miss gender, education level, employment status, career goal, language; `yep` has no interests/consent; React has interests/consent but no DB write path in demo mode |
| Country list (not hardcoded) | ◐ | ◐ | `yep` free-text + "Uganda" default; React hardcodes 8 countries |
| Email verification + rate limiting | ✘ | ✔ | `youthrise` has tokens + rate limiter; `yep` has login limiter only |
| Jobs: postings, search, apply, save, alerts | ✘ | ✘ | Employer package only has talent showcase/introductions |
| Coding exercises + runner + test cases | ✘ | ✘ | No code execution, sandbox or test-case model |
| Payments / scholarships | ✘ | ✘ | `yep` has sponsor pledges only |
| PWA / offline / low-data | ✘ | ✘ | No service worker, manifest, video URL or transcript model |
| Ratings, per-lesson discussion, Q&A, upvotes, moderation | ✘ | ◐ | Module-level discussion in `yep`; no per-lesson threads, votes or ratings |
| Course / career-path certificates | ✘ | ◐ | One certificate per user in both (`yep` has `uk_certificates_user`) |
| Admin dashboards + reports | ✔ | ✔ | `yep` has 8 report keys + CSV/PDF |
| Audit log | ✔ | ✔ | Both |
| 4-language i18n | ✔ | ✘ | `yep` only (React is English-only) |
| Responsive/mobile UI | ◐ | ✔ | React design system is stronger |
| Automated tests | ✔ | ✔ | 44 JUnit vs Vitest + domain tests |
| OpenAPI description | ◐ | ✔ | `backend` has springdoc; `yep` documents routes in README only |

---

## 5. Conflicts that must be resolved before coding

1. **Two systems, one product name.** Extending both doubles every migration, test and screen. One
   must be canonical; the other becomes reference material (or is archived).
2. **Two databases with different live data.** `yep` has a real participant at 100 %/100 % with
   certificate `YEP-2026-0001`; `youthrise` has seeded demo content and an unapplied V9–V11. A
   consolidation needs an explicit data-migration script, not a drop.
3. **Two auth models.** JWT vs session+CSRF. Whichever is chosen, the React client and the vanilla
   client cannot both be served unchanged.
4. **Three definitions of "80 %".** See §6.
5. **Age policy.** Both enforce 18–35, but the mission talks about youth generally. Whether 16–17
   with guardian consent is allowed changes the schema (`guardian_*` columns) and the consent flow.
6. **Certificate cardinality.** `yep` enforces one certificate per user. Per-course and per-path
   certificates require dropping `uk_certificates_user` and adding a scope column — a schema change
   that must be approved, not slipped in.
7. **Role model.** `youthrise` has EMPLOYER/UNIVERSITY/PARTNER; `yep` has SPONSOR. Jobs need an
   employer role. Decide whether to add EMPLOYER (and keep SPONSOR) or rename SPONSOR.
8. **The React demo store.** If React is chosen, list screens must move off `localStorage` before
   any jobs data can be trusted.

---

## 6. The 80 % rule — proposed single definition

Current behaviour:

| System | "Unlock Level Two" | "Level Two eligible" |
|---|---|---|
| `yep` | Level One lessons ≥ 80 % | lessons ≥ 80 % **and** assessment avg ≥ 65 **and** attendance ≥ 75 |
| `youthrise` | `isEligibleForLevelTwo()` → `true` | team creation checks role only |
| Mission | "overall score of 80 %+" | not defined |

**Proposal — one score, one threshold:**

```
overallScore =
    0.40 × lessonCompletionPercent      // completed lessons ÷ published lessons in the path
  + 0.40 × assessmentAveragePercent     // mean of published assessment percentages, 0 if none
  + 0.20 × attendancePercent            // present ÷ marked sessions, 0 if none

Level Two unlocks when overallScore >= 80.
```

Rationale: it preserves the existing intent (lessons + assessments + attendance), gives one number
for learners to understand, and keeps every input derived from SQL. The weights live in `settings`
(`overall_weight_lessons`, `overall_weight_assessments`, `overall_weight_attendance`) so they can be
tuned without a deployment. When a career path is introduced, the same formula is scoped to that
path's courses instead of the global 15 lessons.

**Decision required (§10, Q3).**

---

## 7. Recommendation: `yep-backend` as the canonical system

**Recommended: extend `yep-backend` (`ug.yep`, database `yep`), and port the React design language
into its static SPA incrementally.**

Why:

1. **It is the live system.** Most recent edits, running on :8080, real certificate and progress
   data, green tests.
2. **It is API-first and stateless.** A jobs marketplace, a code runner and a mobile/PWA client all
   need a clean JSON API; JWT is straightforward for that. The React app's session+CSRF model is
   fine for a browser SPA but harder for a runner service and offline clients.
3. **No demo-store debt.** Every number in `yep` comes from SQL. The React app would need its list
   reads rewritten before Phase 1 could even show a course catalogue from the database.
4. **It already enforces the real business rules** (80 %, capacity, deadlines, account states,
   certificate gates, hidden scores, role permissions). Those are the rules the mission builds on.
5. **It has server-side PDF certificates, audit, attendance and 4-language i18n** — four final
   deliverables that would otherwise be rebuilt.
6. **Its schema is smaller and cleaner** (36 vs 45 tables) and its Flyway history is fully applied.

What to port from `backend`/React, in order:

- The design tokens and component patterns (cards, tabs, tables, empty states, form fields) into
  `static/css/style.css` and `app.js`.
- `EMPLOYER`, `UNIVERSITY`/`PARTNER` roles if the mission needs them (add to `Enums.Role` and the
  discriminator subclasses).
- Springdoc/OpenAPI (add `springdoc-openapi-starter-webmvc-ui` if available offline; otherwise
  generate the endpoint list from controllers into `docs/openapi.md`).
- The richer registration fields and consent records (schema in §9).
- The rate limiter and email-token pattern.

**Alternative if the React UI is non-negotiable:** keep `backend` + React, apply V9–V11, then
retire `demoDb` reads and rebuild the 80 % gate. This is a larger Phase 1 because it starts with
schema debt and a frontend refactor. It is viable, but slower and riskier.

**Do not** attempt to merge both codebases feature-by-feature. Pick one, migrate data explicitly.

---

## 8. Phased plan

Each phase ends with a summary, green tests, and no destructive schema operation. Data is backed up
before any migration.

| Phase | Scope | Key deliverables | Exit criteria |
|---|---|---|---|
| **1** | Registration + academies + courses | `V6` schema, entities/repos/services/controllers/DTOs, admin CRUD, public catalogue, learner browse/enrol, registration fields, seed of the six academy groups, frontend screens, tests | Admin can create an academy, career path and course with no code change; a new learner registers with the full profile and enrols in a course; all existing data and tests intact |
| **2** | Course content + progress | Course → module → lesson authoring, lesson player, per-course progress, path-scoped overall score, Level One→Two gate, level-2 project linkage | A learner sees one overall score, unlocks Level Two at 80 %, and existing learners keep their progress |
| **3** | Careers + jobs | Employer role, job postings, search/filter, apply, save, alerts, application status, placement recording | An employer posts a job; a path graduate applies; admin sees the pipeline |
| **4** | Payments + scholarships | Fee model, scholarship applications, sponsor funding, receipts | A learner can be sponsored into a course without double-charging |
| **5** | Community | Per-lesson discussion, Q&A, upvotes, accepted answers, ratings, moderation queue | Moderator can hide/report content; ratings aggregate per course |
| **6** | Credentials | Per-course and per-path certificates, public verification, PDF, share links | Two certificates for one learner are allowed and verifiable |
| **7** | Code runner | Exercise model, test cases, sandbox service, submissions, limits, feedback | A learner submits code; the runner returns pass/fail per test case; abuse limits enforced |
| **8** | Access + delivery | PWA/offline lesson cache, low-data video/transcript, country list, accessibility pass | App installs, a lesson is readable offline, Lighthouse/axe pass recorded |
| **9** | Polish + handover | Seed script, OpenAPI list, RBAC matrix, setup/run guide, changelog, 12 screenshots | All final deliverables present and reproducible from a clean database |

**Phase 1 is the only phase authorised by this document.** Phases 2–9 are indicative and will be
re-planned after Phase 1 review.

### 8.1 Phase 1 work breakdown

**Backend (`ug.yep`)**

1. Migration `V6__academies_career_paths_and_courses.sql` (draft in §9).
2. Migration `V7__seed_academy_catalogue.sql` — six academies, sample career paths and courses.
3. Entities: `Academy`, `CareerPath`, `Course`, `CourseEnrollment`; extend `User`, `Module`,
   `Programme`.
4. Repositories: slug lookups, published listings ordered by `sort_order`, enrolment by user/course.
5. Services: `AcademyService` (CRUD + publish), `CourseCatalogService` (public tree, search,
   enrolment rules), extend `AuthService` for the new registration fields and consent timestamps.
6. Controllers: `/api/academies` (public read, admin write), `/api/career-paths`, `/api/courses`,
   `/api/courses/{slug}`, `/api/courses/{id}/enrol`, `/api/admin/academies|career-paths|courses`.
7. DTOs in `dto/Views.java` / `dto/Requests.java` (records + Bean Validation).
8. Security rules: public read for published catalogue; `ADMIN` for writes; authenticated
   `PARTICIPANT` for enrolment.
9. Static SPA screens: Academy catalogue, Academy detail, Course detail, Enrol, Admin academy/course
   manager, extended registration form.
10. Tests: service unit tests, controller MockMvc tests, Flyway migration test (H2 or Testcontainers
    if available; otherwise a MariaDB test profile).

**Frontend only if React is chosen:** add typed `academyService`/`courseService`, pages, routes,
nav entries, and replace demo-store reads on those pages.

**Explicitly out of Phase 1:** jobs, payments, code runner, certificates scope, community features,
PWA, video.

### 8.2 Step 9 tab bug

Finding: not reproducible. All `<Tabs>` call sites in `src/features/app/*.tsx` pass
`{ id, label, count }`; `src/components/ui/Navigation.tsx` renders `item.label`; the `yep` "My
Projects" page (`static/js/app.js` ~901) has no tabs. The `v e / i l / o r` output is what you get
when a string is spread (`[...label]`), which no current call site does.

Action: add a Vitest regression test that renders `Tabs` with a multi-word label and asserts the
whole string is present as one node, plus a screenshot of "My Projects" in the Phase 1 review. If the
bug is in a build you have locally, send the screen/route and it will be traced before Phase 1
closes.

---

## 9. Draft migration (not applied)

Target: `yep` (MariaDB 12.2 / MySQL 8 compatible). File name when approved:
`yep-backend/src/main/resources/db/migration/V6__academies_career_paths_and_courses.sql`.

### 9.1 Forward migration

```sql
-- V6 — Academy → Career Path → Course hierarchy, rich registration fields,
--      and course enrolment. Additive only: no existing column is dropped,
--      no existing row is deleted. Existing modules are attached to one
--      system course so no lesson loses its place.

-- ---------------------------------------------------------------------------
-- 1. Academies (the six mission groups; admins add more at runtime)
-- ---------------------------------------------------------------------------
CREATE TABLE academies (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(160) NOT NULL,
    slug        VARCHAR(160) NOT NULL,
    tagline     VARCHAR(240) NULL,
    description TEXT         NULL,
    icon        VARCHAR(16)  NULL,
    colour      VARCHAR(16)  NULL,
    sort_order  INT          NOT NULL DEFAULT 0,
    published   TINYINT(1)   NOT NULL DEFAULT 1,
    created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_academies_slug (slug)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 2. Career paths
-- ---------------------------------------------------------------------------
CREATE TABLE career_paths (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    academy_id  BIGINT       NOT NULL,
    title       VARCHAR(160) NOT NULL,
    slug        VARCHAR(160) NOT NULL,
    summary     VARCHAR(500) NULL,
    description TEXT         NULL,
    icon        VARCHAR(16)  NULL,
    sort_order  INT          NOT NULL DEFAULT 0,
    published   TINYINT(1)   NOT NULL DEFAULT 1,
    created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_career_paths_slug (slug),
    KEY idx_career_paths_academy (academy_id),
    CONSTRAINT fk_career_paths_academy
        FOREIGN KEY (academy_id) REFERENCES academies (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 3. Courses
-- ---------------------------------------------------------------------------
CREATE TABLE courses (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    career_path_id BIGINT       NOT NULL,
    code           VARCHAR(40)  NOT NULL,
    title          VARCHAR(160) NOT NULL,
    slug           VARCHAR(160) NOT NULL,
    summary        VARCHAR(500) NULL,
    description    TEXT         NULL,
    level          TINYINT      NOT NULL DEFAULT 1,   -- 1 = Level One, 2 = Level Two
    duration_hours INT          NOT NULL DEFAULT 0,
    icon           VARCHAR(16)  NULL,
    sort_order     INT          NOT NULL DEFAULT 0,
    published      TINYINT(1)   NOT NULL DEFAULT 0,
    created_at     DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at     DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_courses_code (code),
    UNIQUE KEY uk_courses_slug (slug),
    KEY idx_courses_path (career_path_id),
    KEY idx_courses_published (published),
    CONSTRAINT fk_courses_career_path
        FOREIGN KEY (career_path_id) REFERENCES career_paths (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 4. Attach existing modules to a course (nullable first, backfill, then NOT NULL)
-- ---------------------------------------------------------------------------
ALTER TABLE modules
    ADD COLUMN course_id BIGINT NULL AFTER id,
    ADD KEY idx_modules_course (course_id),
    ADD CONSTRAINT fk_modules_course
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE;

-- System rows so the 5 existing modules and 15 lessons keep their content.
INSERT INTO academies (name, slug, tagline, icon, sort_order, published)
VALUES ('Tech & Digital', 'tech-digital',
        'Digital literacy, software, data, AI and cybersecurity', '💻', 10, 1);

INSERT INTO career_paths (academy_id, title, slug, summary, icon, sort_order, published)
SELECT id, 'Digital Foundations', 'digital-foundations',
       'The YEP Level One foundation path in digital skills.', '🧭', 10, 1
FROM academies WHERE slug = 'tech-digital';

INSERT INTO courses (career_path_id, code, title, slug, summary, level, duration_hours, icon, sort_order, published)
SELECT id, 'YEP-CORE-L1', 'YEP Core — Level One', 'yep-core-level-one',
       'The existing five-module Level One curriculum.', 1, 15, '🎓', 10, 1
FROM career_paths WHERE slug = 'digital-foundations';

UPDATE modules
SET course_id = (SELECT id FROM (SELECT id FROM courses WHERE code = 'YEP-CORE-L1') AS c)
WHERE course_id IS NULL;

ALTER TABLE modules MODIFY COLUMN course_id BIGINT NOT NULL;

-- Existing programmes (cohorts) may deliver a course; nullable so no cohort breaks.
ALTER TABLE programmes
    ADD COLUMN course_id BIGINT NULL AFTER id,
    ADD KEY idx_programmes_course (course_id),
    ADD CONSTRAINT fk_programmes_course
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- 5. Registration and profile fields
-- ---------------------------------------------------------------------------
ALTER TABLE users
    ADD COLUMN gender               VARCHAR(20)  NULL AFTER phone,
    ADD COLUMN education_level      VARCHAR(40)  NULL AFTER institution,
    ADD COLUMN employment_status    VARCHAR(40)  NULL AFTER education_level,
    ADD COLUMN career_goal          VARCHAR(240) NULL AFTER employment_status,
    ADD COLUMN preferred_language   VARCHAR(8)   NOT NULL DEFAULT 'en' AFTER career_goal,
    ADD COLUMN terms_accepted_at    DATETIME(6)  NULL,
    ADD COLUMN privacy_accepted_at  DATETIME(6)  NULL,
    ADD COLUMN email_verified_at    DATETIME(6)  NULL,
    ADD COLUMN guardian_name        VARCHAR(120) NULL,
    ADD COLUMN guardian_phone       VARCHAR(40)  NULL,
    ADD COLUMN guardian_consent_at  DATETIME(6)  NULL;

CREATE TABLE user_interests (
    id       BIGINT      NOT NULL AUTO_INCREMENT,
    user_id  BIGINT      NOT NULL,
    interest VARCHAR(80) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_user_interests_user (user_id),
    CONSTRAINT fk_user_interests_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 6. Course enrolment (distinct from programme/cohort application)
-- ---------------------------------------------------------------------------
CREATE TABLE course_enrollments (
    id           BIGINT      NOT NULL AUTO_INCREMENT,
    user_id      BIGINT      NOT NULL,
    course_id    BIGINT      NOT NULL,
    status       VARCHAR(20) NOT NULL DEFAULT 'ENROLLED',
    enrolled_at  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    completed_at DATETIME(6) NULL,
    created_at   DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at   DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_course_enrollments_user_course (user_id, course_id),
    KEY idx_course_enrollments_course (course_id),
    CONSTRAINT fk_course_enrollments_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_course_enrollments_course
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
```

### 9.2 Seed migration (draft, `V7__seed_academy_catalogue.sql`)

Six academy groups, one starter path per group, two starter courses per path. The `Tech & Digital`
path already has the core course from V6, so it receives one additional course.

```sql
INSERT INTO academies (name, slug, tagline, icon, sort_order, published) VALUES
 ('Business & Entrepreneurship', 'business-entrepreneurship',
  'Enterprise, finance, marketing and management', '📈', 20, 1),
 ('Agriculture & Agribusiness', 'agriculture-agribusiness',
  'Farming, value chains, agri-tech and food systems', '🌱', 30, 1),
 ('Creative & Media', 'creative-media',
  'Design, content, film, audio and storytelling', '🎨', 40, 1),
 ('Professional & Life Skills', 'professional-life-skills',
  'Communication, employability, wellbeing and citizenship', '🧠', 50, 1),
 ('Vocational & Green Skills', 'vocational-green-skills',
  'Trades, installation, repair and green economy skills', '🔧', 60, 1);

INSERT INTO career_paths (academy_id, title, slug, summary, icon, sort_order, published)
SELECT a.id, v.title, v.slug, v.summary, v.icon, v.sort_order, 1
FROM academies a
JOIN (
    SELECT 'tech-digital' AS academy_slug, 'Software Development' AS title,
           'software-development' AS slug, 'Front-end, back-end and mobile foundations.' AS summary,
           '⌨️' AS icon, 20 AS sort_order
    UNION ALL SELECT 'business-entrepreneurship', 'Small Business Management', 'small-business-management',
           'Start, finance and grow a small enterprise.', '💼', 10
    UNION ALL SELECT 'agriculture-agribusiness', 'Agripreneurship', 'agripreneurship',
           'Turn farming into a profitable, sustainable business.', '🚜', 10
    UNION ALL SELECT 'creative-media', 'Digital Content Creation', 'digital-content-creation',
           'Create, edit and publish professional digital content.', '🎬', 10
    UNION ALL SELECT 'professional-life-skills', 'Employability Essentials', 'employability-essentials',
           'CVs, interviews, communication and workplace behaviour.', '🤝', 10
    UNION ALL SELECT 'vocational-green-skills', 'Solar Installation', 'solar-installation',
           'Design, install and maintain small solar systems.', '☀️', 10
) v ON v.academy_slug = a.slug;

INSERT INTO courses (career_path_id, code, title, slug, summary, level, duration_hours, icon, sort_order, published)
SELECT p.id, v.code, v.title, v.slug, v.summary, v.level, v.hours, v.icon, v.sort_order, 1
FROM career_paths p
JOIN (
    SELECT 'software-development' AS path_slug, 'TECH-WEB-L1' AS code,
           'Web Development Fundamentals' AS title, 'web-development-fundamentals' AS slug,
           'HTML, CSS, JavaScript and the web platform.' AS summary, 1 AS level, 40 AS hours,
           '🌐' AS icon, 20 AS sort_order
    UNION ALL SELECT 'small-business-management', 'BUS-SBM-L1', 'Starting a Small Business',
           'starting-a-small-business', 'Ideation, registration, pricing and cash flow.', 1, 30, '🏪', 10
    UNION ALL SELECT 'small-business-management', 'BUS-SBM-L2', 'Growing a Small Business',
           'growing-a-small-business', 'Customers, marketing, records and financing.', 2, 30, '📊', 20
    UNION ALL SELECT 'agripreneurship', 'AGR-AGRI-L1', 'Farm Business Basics',
           'farm-business-basics', 'Planning, inputs, yields and unit economics.', 1, 30, '🌾', 10
    UNION ALL SELECT 'agripreneurship', 'AGR-AGRI-L2', 'Agri Value Chains',
           'agri-value-chains', 'Storage, processing, aggregation and market access.', 2, 30, '🚚', 20
    UNION ALL SELECT 'digital-content-creation', 'CRE-CONTENT-L1', 'Content Production',
           'content-production', 'Story, shooting, editing and publishing.', 1, 30, '📷', 10
    UNION ALL SELECT 'digital-content-creation', 'CRE-CONTENT-L2', 'Brand and Audience',
           'brand-and-audience', 'Brand systems, analytics and monetisation.', 2, 30, '📣', 20
    UNION ALL SELECT 'employability-essentials', 'PRO-EMP-L1', 'Work Readiness',
           'work-readiness', 'CV, cover letter, interview and workplace norms.', 1, 20, '📄', 10
    UNION ALL SELECT 'solar-installation', 'VOC-SOLAR-L1', 'Solar PV Basics',
           'solar-pv-basics', 'Components, safety, sizing and installation.', 1, 40, '🔆', 10
    UNION ALL SELECT 'solar-installation', 'VOC-SOLAR-L2', 'Solar Maintenance',
           'solar-maintenance', 'Testing, fault-finding and customer handover.', 2, 30, '🛠️', 20
) v ON v.path_slug = p.slug;
```

### 9.3 Rollback (`R6__rollback_academies_courses.sql`, run manually and only with a backup)

```sql
-- Reverse order of V6. Drops only objects created by V6.
DROP TABLE IF EXISTS course_enrollments;
DROP TABLE IF EXISTS user_interests;

ALTER TABLE users
    DROP COLUMN guardian_consent_at,
    DROP COLUMN guardian_phone,
    DROP COLUMN guardian_name,
    DROP COLUMN email_verified_at,
    DROP COLUMN privacy_accepted_at,
    DROP COLUMN terms_accepted_at,
    DROP COLUMN preferred_language,
    DROP COLUMN career_goal,
    DROP COLUMN employment_status,
    DROP COLUMN education_level,
    DROP COLUMN gender;

ALTER TABLE programmes DROP FOREIGN KEY fk_programmes_course;
ALTER TABLE programmes DROP KEY idx_programmes_course;
ALTER TABLE programmes DROP COLUMN course_id;

ALTER TABLE modules DROP FOREIGN KEY fk_modules_course;
ALTER TABLE modules DROP KEY idx_modules_course;
ALTER TABLE modules DROP COLUMN course_id;

DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS career_paths;
DROP TABLE IF EXISTS academies;
```

Rollback **does not** delete `V7` seed content independently; dropping `academies` cascades through
`career_paths` and `courses`. Take a `mysqldump` of `yep` first (see §11).

### 9.4 Data-preservation guarantees

- No `DROP`, `TRUNCATE` or `DELETE` of existing rows.
- `modules.course_id` is backfilled before it becomes `NOT NULL`, so all 15 lessons keep a course.
- `programmes.course_id` is nullable, so all 5 existing cohorts remain valid.
- New `users` columns are nullable or have defaults.
- Existing entities keep their table names; no JPA rename is required.

---

## 10. Decisions taken (13 November 2026)

| # | Question | Decision |
|---|---|---|
| 1 | Canonical system | **`yep-backend` (`ug.yep`, database `yep`)**. The React app stays as a design reference. |
| 2 | Age policy | **18–35 only.** Guardian columns remain in the schema but unused. |
| 3 | "Overall score 80 %" | **Weighted 40 % lessons + 40 % assessments + 20 % attendance**, weights in `settings`. |
| 4 | Self-registration roles | **Learners only.** Employer/partner/instructor accounts are created by an admin. |
| 5 | Certificate scope | Per course **and** per career path (deferred to Phase 6; the `uk_certificates_user` change will be proposed then). |
| 6 | Jobs role | Add `EMPLOYER`, keep `SPONSOR` (Phase 3). |
| 7 | Pre-work | **All approved:** database backups, git baseline, and dev-only screenshot tooling. The owner asked for the work to be started and completed. |

Pre-work completed:

- `backups/yep_2026-11-13.sql` (196 KB) and `backups/youthrise_2026-11-13.sql` (199 KB), both with
  `Dump completed` markers.
- Git repository initialised on `main` with a baseline commit; `target/`, `node_modules/`,
  `uploads/`, `backups/` and local env files ignored.
- Screenshot tooling will be added when the Phase 9 screenshot task is reached (or earlier if the UI
  needs visual checks).

---

## 11. Phase 1 acceptance tests (to be written before code)

**Schema / migration**

1. Clean database: Flyway applies V1–V7 with no error; `modules.course_id` is `NOT NULL` and every
   pre-existing module points at `YEP-CORE-L1`.
2. Existing database: after V6/V7, row counts for `users`, `programmes`, `modules`, `lessons`,
   `lesson_progress`, `certificates` are unchanged; the certificate `YEP-2026-0001` still verifies.
3. Rollback script restores the pre-V6 schema on a copy and leaves all original rows intact.

**Domain**

4. `AcademyService.create` rejects duplicate slugs, blank names and invalid colours; publishes and
   unpublishes.
5. `CourseCatalogService` returns only published academies → paths → courses in `sort_order`; an
   unpublished parent hides its children.
6. Enrolment is idempotent (second call returns the existing enrolment), rejects unpublished courses,
   and rejects an unknown user/course with 404.
7. A participant cannot create or edit an academy, path or course (403).
8. An admin can create an academy, path and course through the API with no code change, and it
   appears in the public catalogue immediately when published.
9. Registration rejects a missing/invalid date of birth, under-18/over-35, missing terms/privacy
   consent, duplicate email and weak password; stores the new profile fields and consent timestamps.
10. Registration still creates a `PENDING` participant; login is still blocked until approved.

**Regression**

11. All existing `yep-backend` tests pass unchanged (44).
12. Level One progress and the 80 % unlock are unchanged for the seeded learner at 100 %/100 %.
13. Certificate issuance at 100 %/100 % still succeeds and verification still works.
14. Existing admin, facilitator, mentor and sponsor screens still load with their original data.

**Frontend**

15. Academy catalogue, academy detail, course detail and enrol screens render from the API, are
    keyboard navigable, and show empty/error states.
16. Multi-word tab labels render as whole strings (regression test for the Step 9 report).
17. No inline event handlers, no unescaped user content, no `console.log` in production paths.

---

## 12. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Picking the wrong canonical system | months of rework | decision in §10 before code; both DBs backed up |
| Data loss during migration | unacceptable | additive-only V6, row-count assertions, `mysqldump`, rollback script |
| 80 % formula change locks/unlocks learners unexpectedly | learner trust | compute old and new scores side by side in Phase 2; show a transition notice |
| `youthrise` V9–V11 unapplied | inconsistent demos | do not use `youthrise` as canonical; archive or migrate explicitly |
| MariaDB 1020 on `users` | intermittent request failures | reproduce in Phase 1 with concurrent login/profile update; add retry or split the login write |
| Static SPA grows unwieldy | slower delivery | port React component patterns incrementally; keep one router and one design system |
| No browser automation installed | screenshots blocked | add a dev-only Playwright dependency or capture manually; ask in §10 |
| Offline Maven repository lacks new starters | build failure | verify `springdoc`/testcontainers availability before adding; fall back to README/OpenAPI Markdown |

---

## 13. Files read for this audit (reference)

- `README.md`, `yep-backend/README.md`, `package.json`, `vite.config.ts`
- `yep-backend/pom.xml`, `yep-backend/src/main/resources/application.properties`
- `backend/src/main/resources/application.yml`
- `yep-backend/src/main/resources/db/migration/V1..V5`
- `backend/src/main/resources/db/migration/V1..V11` (filenames and V1 read)
- `yep-backend/src/main/java/ug/yep/entity/*`, `service/LearningService.java`,
  `service/AuthService.java`, `dto/Requests.java`, `security/SecurityConfig.java`
- `yep-backend/src/main/resources/static/js/app.js`, `js/i18n.js`
- `src/features/auth/AuthPages.tsx`, `src/features/app/*`, `src/components/ui/Navigation.tsx`,
  `src/services/apiClient.ts`, `src/lib/demoDb.ts`
- Live queries against `yep` and `youthrise` (read-only)
- `yep-run.log`

---

**Next step:** Phase 1 implementation on `yep-backend`: migration V6/V7, entities, repositories,
services, controllers, DTOs, admin and learner screens, and tests. Each phase ends with a summary,
green tests and an updated changelog.
