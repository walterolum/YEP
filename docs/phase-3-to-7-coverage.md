# Phases 3–7 — coverage report

Delivered on top of Phases 1–2, without dropping or rewriting existing data. Every migration is
versioned with a matching rollback script.

| Phase | Scope | Migrations | Rollbacks |
|---|---|---|---|
| 3 | Interactive learning | V13 | R12 |
| 4 | Virtual sessions | V14 | R13 |
| 5 | Funding, payments, certificates | V15, V18 | R14, R17 |
| 6 | Jobs, portfolio, impact | V16 | R15 |
| 7 | Hardening, offline, indexes | V17 | R16 |

## Phase 3 — interactive learning (V13)

* Lesson media: `lessons.video_url`, `transcript`, `captions_url`, so a licensed recording can be
  published with captions and a transcript instead of a link in prose.
* **Private notes** per lesson (`lesson_notes`, one row per learner and lesson).
* **Per-lesson Q&A** (`lesson_posts`) with author names and roles.
* **Practice questions** drawn from published assessments in the same module; every answer is stored as a
  `practice_attempts` row and feeds a per-course mastery percentage (latest answer per question).
* **Coding exercises** (`coding_exercises`, `code_submissions`) with starter code and expected output.
  Submissions run through a `CodeRunner` abstraction. The shipped runner never executes untrusted code
  on the application host: it stores the submission and returns `REVIEW` until the sandboxed runner
  service from the Phase 0 audit is deployed (`yep.code-runner.enabled`).
* **XP and badges** computed from real activity (completed lessons, correct practice, Q&A) — no editable XP.
* **Retakes**: `assessment_attempts` records timed starts and closing, and a learner may retake an
  assessment while results are unpublished.
* Seeded practice quizzes for Python and SQL plus three coding exercises (original content).

## Phase 4 — virtual sessions (V14)

* `sessions` gained `provider`, `room_url`, `duration_minutes`, `series_id`.
* Recurring `session_series` creates up to 26 weekly sessions in one call.
* `SessionProvider` builds join links: LiveKit when `yep.sessions.livekit-url` is set, Jitsi otherwise
  (the documented fallback), so the feature works without provider credentials.
* `GET /api/sessions/calendar.ics` and `…/{id}/calendar.ics` export RFC 5545 calendars.
* Self check-in (`attend`) registers the learner and marks attendance; facilitators keep the manual roster.
* Recordings (`session_recordings`) attach to a session and can be published as a VIDEO lesson into any
  module, which is how a recording reaches the course.
* Session feedback (1–5 plus comment, one per learner) and bookable `booking_slots` with capacity and
  duplicate-booking guards.

## Phase 5 — funding and certificates (V15, V18)

* **Financial aid**: one application per learner and course, admin decision queue, approval enrols the
  learner and notifies them; rejection records the reason. Duplicate pending/approved applications are
  refused.
* **Sponsorship**: a sponsor funds a named learner's seat; the learner is enrolled and notified.
* **Payments**: `payment_intents` with reference, amount, currency and status. A payment abstraction is
  deliberate — seats open only when an admin (or a future provider webhook) confirms the intent as PAID.
* **Certificates** are now scoped (`COURSE`, `scope_id`). Issuing requires a completed enrolment, codes
  are globally unique and public verification is available at `/api/public/certificates/{code}`.
  V18 removes the legacy one-certificate-per-user unique key that made course certificates impossible.

## Phase 6 — jobs and livelihoods (V16)

* Employer job postings (title, organisation, location, work mode, skills, closing date), close/reopen
  by the owner.
* Learners browse open postings, apply once with a cover note, save jobs, and track application status.
* Employers see applicants for their own postings only and decide SHORTLISTED, HIRED or REJECTED; a
  hired application counts as a placement in impact reporting.
* Learner **portfolio** items (project, certificate, writing, code) with links.
* **Impact summary**: participants, women, certificates, placements and learners by country computed
  from live data, plus manually recorded impact rows by country, gender and education level.

## Phase 7 — hardening and handover (V17)

* Nine additive indexes on the busiest paths (lessons by module, enrolments by course, progress by
  learner, questions by assessment, submissions, open jobs, certificate scope, audit and notifications).
* Installable PWA: `manifest.webmanifest`, a service worker that caches the app shell and never caches
  `/api/` responses, theme colour and registration in `index.html`.
* `docs/openapi-phase3-7.yaml`, this report, the API notes and the updated route-permission map.

## Verification

* `./mvnw.cmd -o test` — **131 tests pass**, including new suites for learning experience (6),
  sessions (4), funding (5) and careers (5).
* Migrations V13–V18 applied to the live `yep` database with `success = 1`.
* Live checks with real tokens: lesson extras (notes, practice, Q&A), practice mastery, employer job
  posting → learner application, aid application → admin approval → enrolment, sponsor seat, payment
  intent → confirmation, recurring series → ICS export, certificate issue and public verification,
  impact summary.
* Not verified: real LiveKit rooms (no credentials), automatic code execution (no sandbox deployed),
  and a full browser click-through of every new screen.

## Known limitations

* The code runner is review-only until a sandbox service is deployed; the interface is ready for it.
* Payments are recorded manually (reference + admin confirmation) — no gateway integration yet.
* Videos for the new courses are not produced; lessons are text, practice and coding exercises.
