# Phase 1 coverage report — registration, roles and academies

**Date:** 14 November 2026 · **Migration:** V9 (applied) · **Tests:** 106 backend, 47 frontend, all green

Legend: ✔ delivered · ◐ delivered with a documented limit · ✘ not in this phase (see the note).

---

## 1. Registration

| Requirement | Status | Evidence |
|---|---|---|
| Full name, email, password, confirm password | ✔ | `SignupRequest`, `signupScreen()` |
| Phone with dial code | ✔ | `users.phone_country_code`; dial select from `/api/public/countries`; local trunk zero stripped server-side (`0712…` → `712…`) |
| Searchable country list, all countries, Africa first | ✔ | `/api/public/countries` → 249 ISO countries, Africa first, 132 with dial codes; `<datalist>` search box |
| Password strength meter | ✔ | Four-bar meter in the form; `PasswordPolicy` (8+, 3 character classes, common-password block) enforced server-side in registration and password change |
| Date of birth | ✔ | Age gate 18–35 from `settings` |
| Gender | ✔ | Stored and shown on profile |
| District/city | ✔ | Stored and shown |
| Highest level of education (9 options) | ◐ | Stored and filterable; the select still offers six labels (Primary, Secondary, Certificate, Diploma, University, Postgraduate) — the O-Level/A-Level/Master's/PhD/Other labels land with the academy content pass in Phase 2 |
| Field of study, institution | ✔ | Stored |
| Employment status | ✔ | Stored |
| Interests, career goals, preferred language | ✔ | `user_interests`, `career_goal`, `preferred_language` |
| Role | ◐ | Self-registration is learner-only by decision (13 Nov); staff roles are created by an admin, with all eight roles now supported |
| Terms and privacy consent | ✔ | `terms_accepted_at`, `privacy_accepted_at`; both boxes required and timestamps stored |
| Email verification | ◐ | Token table, `POST /api/auth/verify-email`, resend endpoint, hashed single-use 24 h tokens, in-app delivery of the code. Blocking sign-in is a setting (`require_email_verification`, default `false`) until SMTP exists (Phase 5) |
| Rate limiting | ✔ | Registration: 5/hour per client address (`RegistrationRateLimiter`); login limiter unchanged |
| Guardian consent for minors | ✘ | Not applicable under the 18–35 policy; the columns stay unused, as decided in Phase 0 |
| Show fields on profile and admin user list, filter by country and education | ✔ | Profile form; admin Users table with country and education filters |

Live proof: a Kenyan registration stored `+254 / 712345678 / KE / Kenya`, produced a verification code,
and `POST /api/auth/verify-email` set `email_verified_at` (200). The test row was then removed.

---

## 2. Roles with real duties

| Role | Dashboard and navigation | Server enforcement |
|---|---|---|
| Learner (`PARTICIPANT`) | Existing participant workspace | Unchanged |
| Instructor (`INSTRUCTOR`) | **New**: dashboard with live counts, *My Courses* authoring list that opens the content manager, Sessions | `/api/instructor/**`, authoring on `/api/content/**` |
| Mentor | Existing mentor workspace | Unchanged |
| Facilitator | Existing facilitator workspace | Authoring retained via `canAuthorContent()` |
| Employer (`EMPLOYER`) | **New**: dashboard with verified learners, certificates, projects and courses; the opportunity board is Phase 6 | `/api/employer/**` |
| Reviewer (`REVIEWER`) | **New**: dashboard and read-only *Review Queue* with course outlines | `GET /api/content/**`, `/api/reviewer/**`; writes return 403 |
| Administrator | Existing console; Users tabs now include the three new roles | `/api/admin/**` |
| Sponsor | Existing sponsor workspace | Unchanged |

**Permission probe (live, HTTP status):**

| Call | Instructor | Reviewer | Employer |
|---|---|---|---|
| `/api/instructor/courses` | 200 | 403 | 403 |
| `/api/reviewer/courses` | 403 | 200 | 403 |
| `/api/employer/stats` | 403 | 403 | 200 |
| `GET /api/content/courses/1/outline` | 200 | 200 | 403 |
| `POST /api/content/courses/1/modules` | 201 | 403 | 403 |
| `/api/admin/users` | 403 | 403 | 403 |
| `GET /api/dashboard` | 200 | 200 | 200 |

Capabilities are now polymorphic (`canAuthorContent`, `canReviewContent`, `canHire`) and re-checked in
`CourseContentService`, so a stale token cannot grant authoring after a role change.

---

## 3. Academy structure

Admin UI already creates Academy → Career path → Course in the browser and manages
Module → Lesson under *Content*; no code change was needed in this phase beyond Instructor access to
the same authoring screens.

---

## 4. Checkpoint

- Each of the eight roles has its own dashboard and navigation (verified in the browser for
  Instructor, Reviewer and Employer; participant, mentor, facilitator, sponsor and admin unchanged).
- Permission tests pass: service unit tests plus the live matrix above.
- 106 backend tests (was 88) — 18 new tests across `AuthServiceTest`, `CountryDirectoryTest`,
  `PasswordPolicyTest`, `VerificationServiceTest`; `CourseContentServiceTest` updated to capability checks.
- No existing row was changed by V9; all original accounts, programmes, courses, lessons and progress remain.

---

## 5. Known limits carried into Phase 2

1. Verification codes are delivered in-app until an email provider is configured.
2. Education-level labels need the full nine-option list and the O-Level/A-Level wording.
3. Instructor courses are the shared catalogue; per-instructor ownership arrives with the course
   review/approval workflow (V10).
4. Job board, aid and certificates remain in their own phases.
