# Roles and permissions matrix (Phase 1)

Roles in `yep-backend`: `ADMIN`, `PARTICIPANT`, `MENTOR`, `FACILITATOR`, `SPONSOR`, `INSTRUCTOR`,
`EMPLOYER`, `REVIEWER` (the last three added in Phase 1). Self-registration creates `PARTICIPANT`
only; every other role is created by an administrator.

Legend: **✔** allowed · **—** not allowed · **own** limited to the caller's own records.

---

## 1. Catalogue and enrolment

| Capability | ADMIN | PARTICIPANT | MENTOR | FACILITATOR | SPONSOR | Public |
|---|---|---|---|---|---|---|
| Browse published academies (`GET /api/academies`) | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Read published academy detail | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Search/filter published courses | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Read a published course | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Enrol in a course | — | ✔ | — | — | — | — |
| List own enrolments | — | own | — | — | — | — |
| View unpublished catalogue | ✔ | — | — | — | — | — |
| Create/edit academy | ✔ | — | — | — | — | — |
| Publish/unpublish academy | ✔ | — | — | — | — | — |
| Create/edit career path | ✔ | — | — | — | — | — |
| Publish/unpublish career path | ✔ | — | — | — | — | — |
| Create/edit course | ✔ | — | — | — | — | — |
| Publish/unpublish course | ✔ | — | — | — | — | — |

Enforcement: `SecurityConfig` permits anonymous `GET` on `/api/academies/**` and `/api/courses/**`
and requires `ADMIN` for `/api/admin/**`; `CatalogService.enroll` re-checks the participant role and
course publication, so a role change cannot bypass a stale token.

---

## 1b. Course content and the player (Phase 2)

| Capability | ADMIN | PARTICIPANT | MENTOR | FACILITATOR | SPONSOR |
|---|---|---|---|---|---|
| Open the course player and read the outline | ✔ | ✔ | ✔ | ✔ | ✔ |
| See own per-course progress and resume point | — | own | — | — | — |
| Mark/reopen a lesson complete | — | own, enrolled | — | — | — |
| View drafts (`GET /api/content/courses/{id}/outline`) | ✔ | — | — | ✔ | — |
| Create/edit/delete modules | ✔ | — | — | ✔ | — |
| Create/edit/delete lessons | ✔ | — | — | ✔ | — |
| Delete a module that still has lessons | — (400) | — | — | — (400) | — |
| Delete a lesson learners completed | — (400) | — | — | — (400) | — |
| See the overall score and path scores | ✔ | own | ✔ | ✔ | — |

Enforcement: `SecurityConfig` limits `/api/content/**` to `ADMIN` and `FACILITATOR`, and
`CourseContentService.requireContentAuthor` re-checks the role in the transaction. Lesson completion
requires an existing enrolment (`403` otherwise) and the lesson must belong to the course (`400`).

---

## 2. Accounts and profile

| Capability | ADMIN | PARTICIPANT | MENTOR | FACILITATOR | SPONSOR |
|---|---|---|---|---|---|
| Self-register (participant only) | — | ✔ (public) | — | — | — |
| Sign in | ✔ | ✔ (approved only) | ✔ | ✔ | ✔ |
| Read own profile | ✔ | ✔ | ✔ | ✔ | ✔ |
| Update own profile | ✔ | ✔ | ✔ | ✔ | ✔ |
| Change own password | ✔ | ✔ | ✔ | ✔ | ✔ |
| List/search all users (role, status, country, education) | ✔ | — | — | — | — |
| Create staff accounts | ✔ | — | — | — | — |
| Approve/reject/suspend accounts | ✔ | — | — | — | — |
| Manage permission matrix | ✔ | — | — | — | — |

Account states: `PENDING` → `APPROVED` → `SUSPENDED`; `REJECTED` can return to `PENDING` but cannot
jump straight to `APPROVED`.

---

## 3. Learning and delivery

| Capability | ADMIN | PARTICIPANT | MENTOR | FACILITATOR | SPONSOR |
|---|---|---|---|---|---|
| Read modules and lessons | ✔ | ✔ | ✔ | ✔ | — |
| Complete/reopen a lesson | — | own | — | — | — |
| Read learning progress | ✔ | own | ✔ | ✔ | — |
| Level Two unlock at 80 % overall | — | ✔ | — | — | — |
| Publish programme content | ✔ | — | — | ✔ | — |
| Run sessions and attendance | ✔ | attend | ✔ | ✔ | — |
| Create and grade assessments | ✔ | take | — | ✔ | — |
| Projects, teams and milestones | ✔ | own team | review | ✔ | — |
| Certificates and verification | ✔ | own | — | — | ✔ (read) |
| Reports and CSV/PDF export | ✔ | — | ✔ | ✔ | ✔ (impact) |
| Announcements and messaging | ✔ | read/reply | ✔ | ✔ | ✔ |

The Phase 1 change does not alter these rules: the `80 %` Level One gate, six seeded modules and the
certificate flow continue to work exactly as before.

---

## 4. Settings and audit

| Capability | ADMIN | Others |
|---|---|---|
| Read/update platform settings (age range, unlock %, score weights) | ✔ | — |
| Read audit trail | ✔ | — |
| Read own audit entries | ✔ | own actions only through service rules |

Weighted overall score (Phase 2 consumer): 40 % lessons + 40 % assessments + 20 % attendance, stored
in `settings` as `overall_weight_lessons`, `overall_weight_assessments`, `overall_weight_attendance`.

---

## 4b. Instructor, reviewer and employer workspaces (Phase 1)

| Capability | ADMIN | INSTRUCTOR | REVIEWER | EMPLOYER |
|---|---|---|---|---|
| Own role dashboard (`GET /api/dashboard`) | ✔ | ✔ | ✔ | ✔ |
| List courses for authoring (`GET /api/instructor/courses`) | ✔ | ✔ | — | — |
| Open a course outline (`GET /api/content/courses/{id}/outline`) | ✔ | ✔ | ✔ (read-only) | — |
| Create/edit/delete modules and lessons (`/api/content/**`) | ✔ | ✔ | — | — |
| Review queue (`GET /api/reviewer/courses`) | ✔ | — | ✔ | — |
| Workplace statistics | ✔ | own | own | own |
| Administrator console (`/api/admin/**`) | ✔ | — | — | — |

Capabilities are polymorphic on the account class (`canAuthorContent`, `canReviewContent`, `canHire`)
and re-checked in `CourseContentService`, so URL rules and service rules agree even after a role change.

---

## 5. Route map

| Route prefix | Required authority |
|---|---|
| `/api/auth/signup`, `/api/auth/login` | anonymous |
| `/api/public/**` | anonymous |
| `GET /api/academies/**`, `GET /api/courses/**` | anonymous |
| `POST /api/courses/{id}/enrol`, `GET /api/me/enrollments` | authenticated participant |
| `/api/admin/**` | `ROLE_ADMIN` |
| `/api/facilitator/**` | `ROLE_ADMIN`, `ROLE_FACILITATOR` |
| `/api/mentor/**` | `ROLE_ADMIN`, `ROLE_MENTOR` |
| `/api/sponsor/**` | `ROLE_ADMIN`, `ROLE_SPONSOR` |
| `/api/instructor/**` | `ROLE_ADMIN`, `ROLE_INSTRUCTOR` |
| `/api/reviewer/**` | `ROLE_ADMIN`, `ROLE_REVIEWER` |
| `/api/employer/**` | `ROLE_ADMIN`, `ROLE_EMPLOYER` |
| `GET /api/content/**` | `ROLE_ADMIN`, `ROLE_FACILITATOR`, `ROLE_INSTRUCTOR`, `ROLE_REVIEWER` |
| Other `/api/content/**` | `ROLE_ADMIN`, `ROLE_FACILITATOR`, `ROLE_INSTRUCTOR` |
| `POST /api/auth/resend-verification` | any signed-in account |
| `POST /api/courses/{slug}/reviews` | enrolled participant (403 otherwise) |
| `GET /api/courses/{slug}/reviews` | anonymous |

## 6. Content authorship and publication

* **INSTRUCTOR** creates attributed course drafts and owns them; only the owning instructor (or an admin) may
  edit or submit them.
* **REVIEWER** approves or requests changes on submitted courses. A reviewer may never decide a course they
  authored. Approval publishes the course; nothing else can.
* Every course must carry source, licence, author and attribution text before it can be submitted, and that
  text is displayed publicly with the course.
| Everything else | authenticated |
