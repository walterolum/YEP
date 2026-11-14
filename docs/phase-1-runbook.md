# Phase 1 runbook — setup, run and verification

Phase 1 extends the canonical `yep-backend` application (`ug.yep`, database `yep`) with the
academy → career path → course catalogue. This guide starts from a clean checkout and ends with the
seeded catalogue visible in the browser.

---

## 1. Prerequisites

| Tool | Version | Check |
|---|---|---|
| Java | 21 or newer (JDK 26 is what this machine runs) | `java -version` |
| MariaDB / MySQL | MariaDB 10.11+ or MySQL 8.0+ | `mysql --version` |
| Git (optional) | any | `git --version` |

The build is offline-friendly: `mvnw.cmd -o test` works with the bundled Maven wrapper and the local
Maven cache. The static frontend is served by Spring Boot, so Node.js is **not** needed to run Phase 1.

---

## 2. Database

The canonical database is `yep` on `127.0.0.1:3306`.

```sql
CREATE DATABASE IF NOT EXISTS yep
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

The default configuration connects as `root` with no password (development only). Override it with
environment variables — never commit credentials:

| Variable | Default | Purpose |
|---|---|---|
| `DB_URL` | `jdbc:mysql://localhost:3306/yep?...` | JDBC URL |
| `DB_USERNAME` | `root` | Database user |
| `DB_PASSWORD` | *(empty)* | Database password |
| `PORT` | `8080` | HTTP port |
| `APP_JWT_SECRET` | dev secret | JWT signing key (32+ characters in deployment) |
| `UPLOAD_DIR` | `uploads` | Evidence upload directory |

**Back up before migrating an existing database.** Phase 1 migrations are additive, but a backup makes
the rollback path trivial:

```powershell
mysqldump -u root yep > backups\yep_before_v7.sql
```

The repository already contains pre-migration dumps in `backups/` (ignored by Git).

---

## 3. Run

```powershell
cd yep-backend
.\mvnw.cmd -o spring-boot:run
```

On macOS/Linux use `./mvnw -o spring-boot:run`.

Flyway applies migrations `V1` → `V8` automatically and Hibernate uses `ddl-auto=none` (Flyway owns
the schema). A healthy start ends with:

```
Successfully applied 1 migration to schema `yep`, now at version v8
Started YepApplication in ... seconds
Tomcat started on port 8080
```

Open <http://localhost:8080>.

### Seeded accounts (from V2/V3)

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@yep.example` | `Password123!` |
| Participant | `amara@yep.example` | `Password123!` |
| Participant (pending) | `pending@yep.example` | `Password123!` |
| Mentor | `grace@yep.example` | `Password123!` |
| Facilitator | `daniel@yep.example` | `Password123!` |
| Sponsor | `sponsor@yep.example` | `Password123!` |

New self-registrations are participants in `PENDING` state until an administrator approves them.

---

## 4. What V6, V7 and V8 change

| Migration | Effect |
|---|---|
| `V6__academies_career_paths_and_courses.sql` | New tables `academies`, `career_paths`, `courses`, `course_enrollments`, `user_interests`; `modules.course_id` (existing 5 modules attached to `YEP-CORE-L1`); nullable `programmes.course_id`; registration/profile columns on `users`; weighted-score settings |
| `V7__seed_academy_catalogue.sql` | Six academy groups, seven career paths and eleven starter courses |
| `V8__course_player_and_resume.sql` | Nullable `course_enrollments.last_lesson_id` so the course player can resume; no existing row changes |

Nothing is dropped and no existing row is deleted. Verify after starting:

```sql
SELECT COUNT(*) FROM users;             -- unchanged (11 in the development database)
SELECT COUNT(*) FROM modules;           -- unchanged (5)
SELECT COUNT(*) FROM lessons;           -- unchanged (15)
SELECT COUNT(*) FROM academies;         -- 6
SELECT COUNT(*) FROM courses;           -- 11
SELECT course_id, COUNT(*) FROM modules GROUP BY course_id;  -- all modules on the core course
SELECT version FROM flyway_schema_history ORDER BY installed_rank DESC LIMIT 1;  -- 8
```

### Rollback

Only needed if a migration must be undone. Restore the backup first, then run the manual script:

```powershell
mysql -u root yep < backups\yep_before_v7.sql
mysql -u root yep < yep-backend\src\main\resources\db\rollback\R6__rollback_academies_courses.sql
```

The rollback script drops the Phase 1 tables/columns and deletes the corresponding Flyway history
rows. Re-running the application re-applies V6/V7 from the restored schema if the history rows are
removed.

---

## 5. Verify the API

```powershell
# public catalogue (no token)
Invoke-RestMethod http://localhost:8080/api/academies
Invoke-RestMethod http://localhost:8080/api/academies/tech-digital
Invoke-RestMethod "http://localhost:8080/api/courses?level=1&q=solar"

# sign in and read enrolments
$login = Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/auth/login `
  -ContentType 'application/json' `
  -Body '{"email":"amara@yep.example","password":"Password123!"}'
$headers = @{ Authorization = 'Bearer ' + $login.token }
Invoke-RestMethod http://localhost:8080/api/me/enrollments -Headers $headers

# course player outline and per-course progress (Phase 2)
Invoke-RestMethod http://localhost:8080/api/courses/yep-core-level-one/outline -Headers $headers
Invoke-RestMethod http://localhost:8080/api/me/course-progress -Headers $headers

# enrol (idempotent: calling twice returns the same enrolment id)
Invoke-RestMethod -Method Post http://localhost:8080/api/courses/2/enrol -Headers $headers

# admin catalogue manager
$admin = Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/auth/login `
  -ContentType 'application/json' `
  -Body '{"email":"admin@yep.example","password":"Password123!"}'
Invoke-RestMethod http://localhost:8080/api/admin/catalogue -Headers @{ Authorization = 'Bearer ' + $admin.token }
```

The full endpoint list is in [`phase-1-api.md`](phase-1-api.md).

---

## 6. Tests

```powershell
cd yep-backend
.\mvnw.cmd -o test
```

Expected: **106 tests, 0 failures** (registration and verification, roles, catalogue, course player,
scoring, auth and the existing suites).
The overall-score rule has its own suites: `ProgressScoringTest`, `ProgressCalculatorTest` and
`CourseContentServiceTest`. If Maven reports “Nothing to compile”, run `.\mvnw.cmd -o clean test` — the incremental
compiler does not notice changes inside records used by stale test classes.

---

## 7. Screenshots (development only)

Screenshots are produced when a review is requested, for the pages that exist at that point in the
plan. Phase 1 ships no screenshot tooling: no browser automation is part of the build or runtime, and
`yep-backend/tools/` does not exist yet. The final handover phase adds the capture script for the
full set of named pages.

---

## 8. Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `Record has changed since last read in table 'users'` | MariaDB error 1020 under heavy concurrent writes; retry the request. Investigate connection pool/transaction isolation if it recurs (tracked for Phase 2 hardening). |
| Flyway checksum error | A previously applied migration file was edited. Restore the original file or restore the backup; never edit an applied migration in production. |
| Port 8080 already in use | Stop the old Java process (`Get-NetTCPConnection -LocalPort 8080`) or set `PORT=8081`. |
| Catalogue empty | Check that V7 ran (`SELECT version FROM flyway_schema_history`) and that the rows are published (`SELECT * FROM academies WHERE published = 1`). |
| Admin page shows “Consent required” on signup | Both terms and privacy checkboxes are mandatory; this is enforced server-side. |
