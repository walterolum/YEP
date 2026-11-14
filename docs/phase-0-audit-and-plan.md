# Phase 0 — Audit, gap analysis, plan, provider and runner design

**Status:** Phase 0 complete. No schema was changed for this phase; the only code change is the tab
rendering fix in §9. Phase 1 of this brief starts only after approval.
**Date:** 14 November 2026
**Canonical system:** `yep-backend` (`ug.yep`, database `yep`). The React app in `src/` stays as the
design reference, as decided on 13 November (see `docs/step-0-audit-and-plan.md` §10).

---

## 1. What this brief changes about the previous plan

The 13 November audit (`docs/step-0-audit-and-plan.md`) designed a 9-phase build around the same
product. This brief restates it as 8 phases (0–7) and adds three concrete deliverables: a
virtual-session provider recommendation, a code-runner design, and a per-platform emulation matrix.
Nothing already built is thrown away — §3 shows which rows of the new plan are already satisfied.

Two phases have already shipped under the old numbering:

| Old | Scope | New numbering |
|---|---|---|
| Phase 1 | Registration fields, academies, career paths, courses, enrolment | part of new **Phase 1/2** |
| Phase 2 | Course content authoring, player, resume, progress, 80 % gate | part of new **Phase 2/3** |

---

## 2. System inventory (measured 14 November 2026)

| Area | State |
|---|---|
| Stack | Java 17, Spring Boot 4.1.2, Maven wrapper, MySQL/MariaDB 12.2, `utf8mb4` |
| Migrations | Flyway **V1–V8 applied**, rollbacks in `db/rollback/` (R6, R7) |
| Tables | 40 (`academies` 6, `career_paths` 7, `courses` 11, `course_enrollments` 2, `users` 11, `lessons` 15, `lesson_progress` 31 …) |
| Controllers | 21 (`Academy`, `AdminCatalog`, `Admin`, `Assessment`, `Auth`, `Certificate`, `Content`, `CourseContent`, `Dashboard`, `Deliverable`, `Facilitator`, `Learning`, `Mentor`, `Mentorship`, `Message`, `Programme`, `Project`, `Public`, `Report`, `Session`, `Sponsor`) |
| Services | 22 including `CatalogService`, `CourseContentService`, `ProgressCalculator`, `ProgressScoring`, `LoginRateLimiter` |
| Roles | `ADMIN, PARTICIPANT, MENTOR, FACILITATOR, SPONSOR` (+ 5×5 `role_permissions` matrix) |
| Auth | Stateless JWT (HS256), BCrypt, URL rules per role in `SecurityConfig`, 403 on out-of-role |
| Frontend | Hash-router SPA served by Spring: `static/index.html`, `js/app.js`, `js/i18n.js` (EN/SW/LG/RW), `css/style.css` |
| Tests | **88 JUnit/MockMvc tests, 0 failures**; 47 React/Vitest tests |
| Live data | Amara: 15/15 lessons, overall 71, Level Two unlocked, certificate `YEP-2026-0001` |

---

## 3. Coverage of this brief's phases

Legend: **✔** done · **◐** partial · **✘** missing.

### Phase 1 — Registration, roles and academies

| Requirement | State | Notes |
|---|---|---|
| Full name, email, phone, DOB, country, district, education, institution, field of study, employment, interests, career goal, language, consent | ◐ | V6 added gender, education, employment, career goal, language, consent timestamps, `user_interests`; the registration form and profile screens show them |
| Phone with dial code | ◐ | Phone stored as free text; no dial-code picker/validation |
| Password strength meter | ✘ | Server enforces length/complexity only |
| Searchable country list, Africa first | ✘ | Free text + a "Uganda" default |
| Email verification | ✘ | `users.email_verified_at` exists, no token flow |
| Rate limiting | ◐ | `LoginRateLimiter` on login only; registration is unmetered |
| Guardian consent for minors | ✘ (by decision) | Age policy is 18–35, so minors cannot register; columns exist but unused |
| Role dashboards & navigation | ◐ | 5 roles have dashboards; INSTRUCTOR, EMPLOYER, REVIEWER do not exist yet |
| Academy → Specialization → Course → Week → Lesson admin UI | ✔ | `AcademyController` + `AdminCatalogController` + `/admin/content` screens |

### Phase 2 — Catalogue and real content

| Requirement | State | Notes |
|---|---|---|
| Catalogue with search/filter (academy, level, duration, language, topic, rating) | ◐ | Academy, level and search exist; language, duration, topic, rating filters do not |
| Course page with syllabus, outcomes, instructor, attribution, licence, rating, enrol | ◐ | Syllabus/outcomes/enrol present; **attribution/licence columns do not exist yet** (V9) |
| Real licensed content across 9 academy groups | ◐ | 6 academies / 7 paths / 11 courses seeded; only the core 15 lessons have real text. Licensing fields are absent |
| Instructor course-creation and review/approval workflow | ◐ | Admin/facilitator authoring works; instructors cannot submit, and there is no review queue |
| ≥1 real attributed course per academy | ✘ | Blocked on V9 licensing schema |

### Phase 3 — Interactive learning experience

| Requirement | State |
|---|---|
| Video/reading/coding/exercise/quiz/peer-assignment/discussion/session/project lesson types | ◐ reading + one video-embed style exist; the rest are not modelled |
| Player: speed, captions, transcript, notes, bookmarks, resume, in-video checks, low-data | ◐ resume + reader + notes-less; no video engine |
| In-browser coding with sandboxed runner | ✘ |
| Practice/mastery/hints/daily goals/streaks | ✘ |
| Assessment types, timers, retakes, answer review, pass marks | ◐ MCQ/true-false/short answer, publishing, retakes; no timers or answer review |
| Peer review with rubrics | ✘ |
| Lesson discussions, upvotes, accepted answers, badges, moderation | ◐ module-level threads only |
| Progress map, XP, badges, leaderboards, recommendations | ◐ overall score + path scores; no XP/badges |

### Phase 4 — Virtual sessions

Scheduling, registration, room embed (`meeting_link`, `room_name`, `sessions`, `session_registrations`),
attendance rows and Jitsi-style embedding exist. Missing: recurrence, time-zone model, reminders,
calendar files, host controls, polls, breakouts, recordings, transcripts, mentor booking slots.

### Phase 5 — Free-first, aid, payments, certificates

Free access ✔ (no paywall anywhere). Aid, sponsorship, payments, receipts, verified certificates and
public verification **✘** — the current certificate is a single free completion certificate per user.

### Phase 6 — Jobs and livelihoods

**✘** entirely (as in the previous audit). Requires `EMPLOYER`, postings, applications, matching,
portfolio/CV, tracking, impact reporting.

### Phase 7 — Africa-ready, hardening, handover

i18n scaffolding ✔ (4 languages), mobile layout ◐, dark mode ✔. Missing: PWA/offline, data-saver,
Swahili/French completion of every new string, accessibility audit, performance work, OpenAPI.

---

## 4. Platform emulation matrix

| Inspired by | What YEP will implement | Where it lands |
|---|---|---|
| **Coursera** | Weekly module structure, graded quizzes, peer-reviewed assignments, specialisations with capstone, aid workflow, verified certificates | Phases 2, 3, 5 |
| **edX** | Every lesson auditable free; optional paid/sponsored verified certificate; micro-credential tracks per career path | Phase 5 |
| **Khan Academy** | Practice questions with hints, mastery levels (attempted → mastered), daily goals, streaks | Phase 3 |
| **Udemy** | Instructor-created courses with review/approval, ratings, reviews, per-lesson Q&A | Phases 2, 3 |
| **FutureLearn** | 2–6 week short courses, a discussion step on every lesson, scheduled cohort runs | Phases 2, 3, 4 |
| **Google Digital Garage** | Practical activities, final exam, shareable badge on the public profile | Phases 3, 6 |
| **LinkedIn Learning** | Learning paths, short expert videos, skill self-assessments, recommendations | Phases 2, 3, 6 |
| **Alison** | Free vocational/business diploma courses with a pass mark | Phases 2, 5 |
| **YALI Network** | Leadership and entrepreneurship content for young Africans, community/network features | Phases 2, 3 |
| **freeCodeCamp** | In-browser editor, auto-graded tests, projects, certifications | Phase 3 (design in §8) |

**Licensing rule** (all phases): no copied material. `courses` gains `source_name`, `source_url`,
`licence`, `licence_url`, `author`, `attribution_text`; a course cannot be published without them
(served by a NOT NULL check in the service layer, nullable in the database for backfill). Seeds cite
MIT OCW, OpenStax, OpenLearn, freeCodeCamp and original YEP content only.

---

## 5. The eight phases

| Phase | Scope | Migrations | Exit criteria |
|---|---|---|---|
| **0** | This audit, plan, provider + runner design, tab fix | none | This document approved |
| **1** | Registration completeness (dial code, country list, strength meter, email verification, registration rate limit), INSTRUCTOR + REVIEWER + EMPLOYER roles and dashboards, academy/spec/course/week UI polish | V9 | Each role has its own dashboard and nav; permission tests pass |
| **2** | Licensing fields + attribution UI, 9 academy groups seeded with one attributed real course each, instructor submission/review queue, catalogue filters (language, duration, topic, rating) | V9, V10 | One real attributed course per academy visible publicly |
| **3** | Lesson types (video/coding/practice/discussion/project), video engine with captions/transcript/notes, code runner, mastery + streaks, timers/retakes/answer review, rubrics, per-lesson Q&A, XP/badges | V11, V12 | A learner completes a course end to end including coding, practice and assessment |
| **4** | Provider integration (§7), scheduling + recurrence + ICS, attendance automation, recordings/transcripts attached as lessons, booking slots | V13 | Two participants complete a session; attendance recorded; recording appears in the course |
| **5** | Aid applications + committee, sponsorship seats, payment abstraction, verified certificates with public verification | V14 | Certificate obtained via payment, aid and sponsorship paths |
| **6** | Jobs board, matching, portfolio/CV, application tracking, career services, entrepreneurship track, impact reporting | V15 | Learner applies, employer reviews and hires; impact report by country/gender/education |
| **7** | PWA/offline, data-saver, full translations, security + runner review, integration tests, OpenAPI, RBAC matrix, 13 screenshots, handover | V16 (indexes only) | Every phase row ticked in the final coverage report |

Each phase ends with: green tests, a changelog entry, a coverage table and a summary for approval.

---

## 6. Migration plan

Rules: additive first, backfill, then tighten; one migration per phase; every migration has a
matching `db/rollback/Rn__*.sql`; `utf8mb4_unicode_ci`; FKs with explicit `ON DELETE`; `mysqldump`
into `backups/` before each phase.

| Version | Contents |
|---|---|
| **V9** | `courses` licensing columns + `course_ratings`/`course_reviews`; `users.phone_country_code`, `country_code`; `email_verification_tokens`; `catalogue` indexes |
| **V10** | `academies`/`career_paths` extra metadata (language, weeks, certificate flag); `course_submissions` review queue |
| **V11** | `lesson_types` enum extension on `lessons` (`type`, `video_url`, `transcript`, `captions_url`, `estimated_minutes`); `lesson_notes`, `lesson_bookmarks`, `practice_attempts`, `skill_mastery`, `daily_goals` |
| **V12** | `coding_exercises`, `test_cases`, `code_submissions`; `assessment_attempts` (timer fields), `peer_assignments`, `peer_reviews`, `review_rubrics`; `lesson_threads`/`lesson_posts`/`post_votes`/`reports`; `badges`, `user_badges`, `xp_events` |
| **V13** | `session_series` (recurrence), `session_attendance` upgrade, `session_recordings`, `session_chapters`, `session_feedback`, `booking_slots`, `provider_room` columns |
| **V14** | `financial_aid_applications`, `aid_review_notes`, `sponsorships`, `payment_intents`, `receipts`, `refunds`; `certificates.scope` + drop `uk_certificates_user`, `certificate_verifications` |
| **V15** | `employers`, `job_postings`, `job_applications`, `saved_jobs`, `portfolio_items`, `cv_documents`, `placements`, `impact_records` |
| **V16** | PWA/offline flags, translation tables, performance indexes, audit retention |

Certificate cardinality (§ Phase 5) is the one destructive change planned: dropping
`uk_certificates_user` and adding `scope` + `scope_id`. It is proposed here, will be executed in V14
with a data backfill that keeps `YEP-2026-0001` valid, and is reversible.

---

## 7. Virtual-session provider

| | **LiveKit** | **Jitsi** | **BigBlueButton** |
|---|---|---|---|
| Model | SFU (WebRTC), Cloud or self-hosted | P2P/JVB, `meet.jit.si` or JaaS or self-hosted | Full web-conferencing server, self-hosted |
| Embedding | JS SDK, custom UI, token-based rooms | `external_api.js` iframe, simple | iframe API, heavy UI |
| Low bandwidth | Simulcast + adaptive stream, dynacast, audio-only mode | `startAudioOnly`, low-res mode | Good but browser-heavy |
| Recording | Egress service → MP4/HLS + audio-only | Jibri (separate Chrome recorder) | Built-in, server-side |
| Captions/transcripts | Live transcription plugin, server-side STT hooks | Limited (Jigasi/transcription add-ons) | Strong built-in captions + transcript |
| Breakouts, polls, whiteboard, shared code | Breakouts ✔, polls via data channels, whiteboard via app; code editor is app-side | Breakouts ✔, polls ✔, whiteboard ✔ | All built in, plus shared notes |
| Ops cost | Low with LiveKit Cloud; moderate self-host | Lowest to start | Highest (Java + Redis + TURN + recording) |
| Fit for YEP | **Best** | Fastest pilot | Best pedagogy, heaviest ops |

**Recommendation: LiveKit.** It gives the adaptive-HD → audio-only ladder and the recording/transcript
pipeline the brief asks for, with a token-based room model that fits our JWT security, and it can run
fully self-hosted (no learner data leaving the region — good for DPPA). BigBlueButton's teaching
features are richer out of the box but the operational weight (multi-container stack, Jibri per
recording, ~4 GB RAM minimum) is disproportionate for a youth platform running on modest hosting.

**Pragmatic sequence:** implement Phase 4 behind a `SessionProvider` interface with two adapters —
`LiveKitProvider` (primary) and `JitsiProvider` (fallback for pilots and networks where WebSocket/TURN
is blocked). The existing `sessions.room_name` / `meeting_link` columns already fit this; V13 adds
`provider`, `provider_room_sid`, `recording_url`. If credentials for LiveKit Cloud are unavailable,
the Jitsi adapter keeps the phase shippable and the interface prevents a rewrite.

---

## 8. Code-runner design (Phase 3)

**Shape:** a separate small service (`yep-runner`), never inside the Spring app, speaking HTTPS+JSON
to the backend. One container image per language.

```
SPA editor → POST /api/code/submissions (JWT, learner)
           → backend validates exercise + quota, stores submission (QUEUED)
           → backend → runner HTTP POST /v1/run  (service token, HMAC, 5 s timeout)
           → runner: pull container image → run untrusted code → return per-test results
           → backend stores result, publishes score, returns feedback to SPA
```

**Isolation per run**

- One ephemeral container per submission (`--rm`), never reused; `--network none`,
  `--read-only` root with a tmpfs `/tmp`, `--memory 256m`, `--cpus 0.5`, `--pids-limit 64`,
  non-root UID, seccomp profile, `ulimit -f 1MB`, wall clock 10 s, output cap 64 KB.
- No secrets, no host mounts, no Docker socket inside the runner; the runner talks to a dedicated
  containerd/runc socket and drops capabilities (`--cap-drop ALL`).
- gVisor (`runsc`) as the runtime if the host supports it; otherwise a dedicated low-privilege VM.

**Languages:** HTML/CSS/JS (headless Chromium + hidden test page — sandboxed, no network),
Python 3.11 + pytest, Java 17 (single-file compile + JUnit console), SQL (per-run throwaway SQLite or
a schema-scoped MySQL user with `READ ONLY` transactions rolled back).

**Protocol**

```json
{"language":"python","files":{"main.py":"..."},"tests":[{"id":1,"stdin":"3 4\n","expect":"7"}]}
→ {"results":[{"id":1,"passed":true,"stdout":"7","ms":41}],"stderr":"","truncated":false}
```

**Abuse control:** per-learner 20 runs/minute and 200/day (settings-driven), queue depth limit,
reject bodies > 64 KB, block obvious fork bombs by `pids-limit`, and log every run for audit.
**Fallback:** if the runner is unavailable, the exercise renders in read-only "expected output" mode
and submissions are queued — the course never blocks.

---

## 9. The My Projects tab bug

**Report:** tab labels render as `v e / i l / o r` instead of whole words.
**Root cause class:** a tab label was iterated as a sequence — spreading a string (`[...label]`,
`Array.from(label)`) or mapping over a string instead of a `[value, label]` pair list. That turns one
label into one element per character, and with separators between tabs the fragments read as
`v e / i l / o r`.

Only two tab renderers exist in this repository, and neither call site currently passes a bare
string, so the original screenshot cannot be reproduced from today's source. The defect is therefore
fixed **at the renderer**, where the whole class of failure lives, and pinned with tests:

1. `yep-backend/src/main/resources/static/js/app.js` — new `tabStrip(pairs, active, opts)` helper.
   It normalises every entry to `[value, label]` (pairs, `{value,label}` objects or plain strings),
   never spreads a label, and renders `aria-pressed` plus the `role-tabs` classes. The Users screen
   now calls `tabStrip(USER_ROLES.map((tab) => [tab.value, tab.label]), ...)`.
2. `src/components/ui/Navigation.tsx` — `Tabs` now accepts `TabInput = TabItem | string` and
   normalises strings to `{ id, label }` before rendering.
3. Tests: `src/components/ui/Navigation.test.tsx` gained "accepts plain string tabs as [value, label]
   pairs instead of spreading them" (3-character check per label would catch the reported output);
   `node --check` passes on the SPA bundle and the Vitest file is green (4 tests).

---

## 10. Risks and decisions needed

| Risk | Mitigation |
|---|---|
| Scope: this brief's 7 phases are ~5× the remaining work | phases approved one at a time; each ends with a coverage table |
| Runner is the highest-risk component (arbitrary code) | separate service, no network, per-run containers, quota, read-only fallback (§8) |
| Payments require provider accounts and legal review | provider abstraction + sandbox first; no live keys in the repo |
| Certificate cardinality change touches existing data | V14 with backfill and rollback; verify `YEP-2026-0001` after |
| LiveKit credentials / hosting | `SessionProvider` interface with a Jitsi fallback (§7) |
| Licensing claims must be true | no course publishes without source, licence, author and attribution |

**Decisions requested before Phase 1 of this brief:**

1. Confirm `yep-backend` continues as canonical (already decided 13 Nov; restated because this brief
   lists a frontend placeholder).
2. Confirm LiveKit as primary provider with the Jitsi fallback.
3. Confirm the runner ships as a separate service with Docker/gVisor, not in-process.
4. Confirm whether Phase 1 should also add INSTRUCTOR/EMPLOYER/REVIEWER (recommended: yes, since
   every later phase depends on them).
