# Frontend → API contract

This document defines the HTTP contract expected by the YouthRise frontend. It is derived directly from
the typed service layer in `src/services/`, so paths, methods and payloads match what the client
sends today. A Spring Boot implementation that follows this contract can be enabled by setting
`VITE_DEMO_MODE=false`.

> The frontend currently reads list data from the in-browser demo store, while **all mutations and
> several reads** go through the service layer. See [Integration status](#integration-status) before
> planning backend work.

---

## Conventions

| Topic | Contract |
| --- | --- |
| Base URL | `VITE_API_BASE_URL`, default `/api`. All paths below are relative to it. |
| Transport | HTTPS only outside local development. |
| Content type | `application/json; charset=utf-8` for JSON; `multipart/form-data` for evidence upload. |
| Authentication | HttpOnly, `Secure`, `SameSite=Lax` (or `Strict`) session cookie. The client sends `credentials: 'include'` on every request. **No bearer token is stored in JavaScript.** |
| CSRF | State-changing requests must be protected. If a double-submit cookie is used, the frontend will need a small addition to `apiRequest` to echo the token header. |
| Dates | ISO 8601 strings (`2026-10-28T09:00:00.000Z`). Date-only values use `YYYY-MM-DD`. |
| IDs | Opaque strings. The frontend treats them as case-sensitive. |
| Authorisation | Every endpoint must verify the session **and** the caller's role/resource ownership server-side. |
| Pagination | Not yet used by the client. List endpoints may return full arrays; if server pagination is added, return a page envelope and update the service methods and `usePagination` consumers together. |
| Idempotency | Enrolment, lesson completion and session registration are treated as idempotent by the UI. |

### Error envelope

Non-2xx responses must return JSON in this shape:

```json
{
  "code": "ENROLMENT_CLOSED",
  "message": "Enrolment for this programme is closed.",
  "fieldErrors": {
    "email": "This email is already registered."
  }
}
```

- `code` — stable machine-readable string (falls back to `HTTP_<status>` if absent).
- `message` — safe, user-facing text. Do not include stack traces, SQL or personal data.
- `fieldErrors` — optional map of field name to message, rendered beside the input by
  React Hook Form screens.

Expected status codes used by the client:

| Status | Meaning in this app |
| --- | --- |
| `200` / `201` / `204` | Success. `204` responses must have no body. |
| `400` | Malformed request or invalid verification code (`INVALID_CODE`). |
| `401` | No or expired session (`UNAUTHENTICATED`). The client routes to sign-in or `/session-expired`. |
| `403` | Authenticated but not permitted (`FORBIDDEN`, `ACCOUNT_SUSPENDED`). |
| `404` | Resource not found (`*_NOT_FOUND`). |
| `409` | State conflict (`EMAIL_IN_USE`, `ENROLMENT_CLOSED`, `SESSION_CLOSED`, `ASSESSMENT_LOCKED`). |
| `410` | Expired reset link (`RESET_LINK_EXPIRED`). |
| `422` | Validation failure (`VALIDATION`, `CODE_REQUIRED`, `FILE_REQUIRED`). |
| `429` | Rate limited. Include `Retry-After`. |
| `500` | Unexpected failure (`*_FAILED`). Never leak internals. |

### Shared object shapes

The canonical TypeScript definitions live in `src/types/index.ts`. Key shapes:

```ts
interface AuthSession {
  user: User;
  issuedAt: number;   // epoch ms
  expiresAt: number;  // epoch ms
  demo: boolean;      // false in production
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'participant' | 'facilitator' | 'mentor' | 'university' | 'employer' | 'partner' | 'admin';
  country: string;
  phone?: string;
  organization?: string;
  jobTitle?: string;
  bio?: string;
  initials: string;
  joinedAt: string;
  status: 'active' | 'suspended' | 'invited';
  profileComplete: number;   // 0–100
  timezone: string;          // IANA name, e.g. Africa/Kampala
  interests: string[];
  skills: string[];
  visibility: 'public' | 'limited' | 'hidden';
  contactPermission: boolean;
}
```

`User` must never include a password hash, reset token, internal notes or full identity documents.

---

## Authentication

Service: `src/services/authService.ts`

| Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| `GET` | `/auth/session` | Cookie (optional) | — | `AuthSession` or `204 No Content` when anonymous |
| `POST` | `/auth/login` | Public | `{ "email": string, "password": string }` | `AuthSession`; sets session cookie |
| `POST` | `/auth/register` | Public | `RegisterPayload` (below) | `AuthSession`; sets session cookie |
| `POST` | `/auth/logout` | Session | — | `204`; clears cookie |
| `POST` | `/auth/password-reset` | Public | `{ "email": string }` | `{ "message": string }` — always the same generic message |
| `POST` | `/auth/password-reset/confirm` | Public | `{ "token": string, "password": string }` | `{ "message": string }` |
| `POST` | `/auth/verify` | Session or public | `{ "code": string }` | `{ "verified": boolean }` |

`RegisterPayload`:

```json
{
  "fullName": "string",
  "email": "string",
  "phone": "string (optional)",
  "country": "string",
  "password": "string",
  "interests": ["string"],
  "privacyAccepted": true,
  "communicationsConsent": false
}
```

Backend requirements:

- Hash passwords with a memory-hard algorithm (for example Argon2id or bcrypt with a modern cost).
- Rotate the session identifier on login and privilege change; expire idle and absolute sessions.
- Rate-limit login, registration, reset and verification by account **and** IP.
- Return the same response for known and unknown emails on password reset.
- Store consent (privacy acceptance, communications) with a timestamp and policy version.
- Do not return `demo: true` in production.

The client currently expires its stored demonstration session after 8 hours. A production session
lifetime should come from the server; `expiresAt` is read from the session payload.

---

## Programmes, learning and profile

Service: `src/services/programmeService.ts`

| Method | Path | Role | Request | Response |
| --- | --- | --- | --- | --- |
| `GET` | `/programmes` | Public | — | `Programme[]` |
| `GET` | `/programmes/{id}` | Public | — | `Programme` |
| `POST` | `/programmes/{id}/enrolments` | Participant | — (user from session) | `Enrolment` |
| `GET` | `/me/enrolments` | Authenticated | — | `Enrolment[]` |
| `GET` | `/programmes/{id}/modules` | Enrolled participant, facilitator, admin | — | `LearningModule[]` |
| `GET` | `/me/progress?programmeId={id}` | Participant | — | `string[]` (completed lesson IDs) |
| `POST` | `/programmes/{id}/lessons/{lessonId}/complete` | Enrolled participant | — | `{ "completedLessonIds": string[] }` |
| `GET` | `/me` | Authenticated | — | `User` |
| `PATCH` | `/me` | Authenticated | Partial profile fields | `User` |

Rules:

- Enrolment must reject closed programmes (`409 ENROLMENT_CLOSED`) and enforce capacity/waitlist
  policy. Repeating the request for an existing enrolment returns the existing record.
- Lesson completion must verify enrolment and that the lesson belongs to the programme.
- Progress is calculated server-side; the client never submits a percentage.
- `PATCH /me` must whitelist fields. Role, status and verification flags are not self-editable.
- Public programme data must not expose participant lists, facilitator emails or draft content.

---

## Virtual exchange sessions

Service: `src/services/sessionService.ts`

| Method | Path | Role | Request | Response |
| --- | --- | --- | --- | --- |
| `GET` | `/sessions` | Authenticated | — | `ExchangeSession[]`, ascending by `startsAt` |
| `GET` | `/me/session-registrations` | Authenticated | — | `string[]` (session IDs) |
| `POST` | `/sessions/{id}/registrations` | Participant | — | `204` |
| `DELETE` | `/sessions/{id}/registrations` | Participant | — | `204` |
| `POST` | `/sessions` | Facilitator, admin | Session fields without `id`, `registeredCount`, `status` | `ExchangeSession` |

Rules:

- Registration must enforce capacity, session status (`upcoming` only) and duplicate suppression.
- Cancelling after a cut-off may be refused (`409`) with a clear message.
- `meetingUrl` is only returned to registered participants and staff.
- `POST /sessions` must validate start time, duration, timezone and programme ownership.
- In production, joining a session should use a short-lived signed link, not a static URL.

---

## Teams, projects and mentorship

Service: `src/services/teamService.ts`

| Method | Path | Role | Request | Response |
| --- | --- | --- | --- | --- |
| `GET` | `/me/teams` | Participant | — | `Team[]` |
| `GET` | `/mentor/teams` | Mentor | — | `Team[]` |
| `GET` | `/teams/{id}` | Team member, mentor, facilitator, admin | — | `Team` |
| `POST` | `/teams/{id}/messages` | Team member | `{ "body": string }` | `201` with the created message |
| `GET` | `/teams/{id}/project` | Team member, mentor, staff | — | `Project` |
| `PATCH` | `/teams/{id}/milestones/{milestoneId}` | Team member | `{ "status": MilestoneStatus }` | `Milestone` |
| `POST` | `/teams/{id}/milestones/{milestoneId}/evidence` | Team member | `multipart/form-data`: `file` (binary), `note` (text) | `Submission` |
| `POST` | `/submissions/{id}/review` | Mentor, facilitator | `{ "status": "approved" \| "revision", "score"?: number, "feedback": string }` | `204` |
| `GET` | `/mentor/feedback` | Mentor | — | `MentorFeedback[]` |
| `POST` | `/mentor/feedback` | Mentor | `{ "teamId": string, "body": string, "milestoneId"?: string }` | `MentorFeedback` |

Evidence upload rules:

- Accept only documented types (for example PDF, DOCX, PPTX, PNG, JPEG) and enforce a size limit
  (the demo validates 10 MB).
- Scan files for malware, store outside the web root or in object storage, and serve through
  short-lived signed URLs.
- Never trust the client-supplied filename; generate a storage key and keep the display name as
  metadata.
- Record uploader, timestamp, size, content type and checksum.
- Reject submissions when the milestone is already approved or the team does not own it.

Team and project authorisation must be membership-based. A mentor may read their assigned teams but
must not post as a participant or alter milestones.

---

## Assessments and certificates

Service: `src/services/assessmentService.ts`

| Method | Path | Role | Request | Response |
| --- | --- | --- | --- | --- |
| `GET` | `/me/assessments` | Participant | — | `Assessment[]` |
| `POST` | `/assessments/{id}/submissions` | Participant | `{ "text": string }` | `204` |
| `GET` | `/me/certificates` | Participant | — | `Certificate[]` |
| `GET` | `/certificates/verify/{code}` | Public | — | `Certificate` |

Rules:

- Submissions must reject locked assessments (`409 ASSESSMENT_LOCKED`) and enforce deadlines,
  attempt limits and enrolment.
- Keep previous attempts and grader identity for audit; never overwrite a graded attempt silently.
- Grading is performed by staff through the facilitator endpoint below; the participant response
  must not include internal rubric notes or other learners' data.
- Certificate verification returns only what the public needs: programme title, level, participant
  name, issue date, status, code and verification note. Do not expose email, phone or address.
- Certificate codes must be unguessable and checked case-insensitively. Issuance and revocation must
  be audited.
- The public verification endpoint must be rate-limited to prevent enumeration.

---

## Notifications

Service: `src/services/notificationService.ts`

| Method | Path | Role | Request | Response |
| --- | --- | --- | --- | --- |
| `GET` | `/me/notifications` | Authenticated | — | `AppNotification[]` |
| `POST` | `/notifications/{id}/read` | Owner | — | `204` |
| `POST` | `/me/notifications/read-all` | Authenticated | — | `204` |

Notifications must be scoped to the session user. `href` values must be relative, validated paths
(no open redirects). Email/SMS delivery, preferences and digest scheduling are backend concerns and
are not implemented in this frontend.

---

## Reporting

Service: `src/services/reportingService.ts`

| Method | Path | Role | Response |
| --- | --- | --- | --- |
| `GET` | `/reports/cohort-members` | Facilitator, university, admin | `CohortMember[]` |
| `GET` | `/reports/programme-participation` | Facilitator, partner, admin | `{ id, name, shortName, enrolled, capacity, level }[]` |
| `GET` | `/reports/attendance` | Facilitator, admin | `{ id, name, registered, capacity, status }[]` |
| `GET` | `/reports/completion-buckets` | Facilitator, admin | `{ label, min, max, learners }[]` |
| `GET` | `/reports/facilitator-summary` | Facilitator | `{ activeProgrammes, pendingReviews, activeTeams, averageCompletion }` |
| `GET` | `/admin/summary` | Admin | `{ users, activeProgrammes, activeCohorts, pendingApprovals, openIncidents, certificatesIssued }` |

Reporting must apply the caller's scope (own programmes, own institution, own teams). Aggregate
exports must suppress small cells (for example fewer than five learners) to reduce re-identification
risk, and every export must be audited.

---

## Administration and governance

Service: `src/services/administrationService.ts`

| Method | Path | Role | Request | Response |
| --- | --- | --- | --- | --- |
| `PATCH` | `/admin/users/{id}/status` | Admin | `{ "status": "active" \| "suspended" \| "invited" }` | `204` |
| `POST` | `/admin/users/{id}/roles` | Admin | `{ "role": Role }` | `204` |
| `PATCH` | `/admin/incidents/{id}` | Admin | `{ "status"?, "severity"?, "assignedTo"?, "note"? }` | `204` |
| `PATCH` | `/admin/privacy-requests/{id}` | Admin | `{ "status": PrivacyStatus, "note"?: string }` | `204` |
| `PATCH` | `/admin/modules/{id}/status` | Admin | `{ "status": "draft" \| "published" \| "archived" }` | `204` |
| `POST` | `/admin/users/invitations` | Admin | `{ name, email, role, organization?, country }` | `User` (status `invited`) |
| `GET` | `/admin/audit-log` | Admin | — | `AuditEntry[]` |

Facilitator endpoints (service: `src/services/facilitatorService.ts`):

| Method | Path | Role | Request | Response |
| --- | --- | --- | --- | --- |
| `GET` | `/facilitator/programmes` | Facilitator | — | `Programme[]` |
| `POST` | `/facilitator/programmes` | Facilitator | Programme fields without `id`, counts or `facilitatorId` | `Programme` |
| `PATCH` | `/facilitator/modules/{id}/status` | Facilitator | `{ "status": ContentStatus }` | `204` |
| `GET` | `/facilitator/modules` | Facilitator | — | `LearningModule[]` |
| `PATCH` | `/facilitator/teams/{id}/mentor` | Facilitator | `{ "mentorId": string }` | `204` |
| `POST` | `/facilitator/assessments/{id}/grade` | Facilitator | `{ "score": number, "feedback": string }` | `204` |

Governance rules:

- Incident and privacy endpoints are sensitive. Restrict to named roles, log every read and write,
  and never include case data in list responses beyond what the table needs.
- Role changes and suspensions must invalidate existing sessions or force re-authentication.
- An administrator must not be able to remove their own last administrative role.
- The audit log is append-only. Server timestamps are authoritative; the client never supplies them.
- `note` on incidents and privacy requests is appended, not replaced. Reject a resolution or closure
  without a substantive note (the UI enforces a minimum length; the API must too).
- Retention, legal hold and redaction rules must be defined before storing real case data.

---

## Partner, institution and employer

Service: `src/services/partnerService.ts`

| Method | Path | Role | Request | Response |
| --- | --- | --- | --- | --- |
| `GET` | `/partner/nominations` | University, partner, admin | — | `Nomination[]` |
| `POST` | `/partner/nominations` | University, partner | Nomination fields without `id`, `status`, `nominatedAt` | `Nomination` |
| `GET` | `/employer/talent?q=&skill=&certificate=` | Employer | Query filters | `TalentProfile[]` |
| `PUT` | `/employer/saved-talent/{userId}` | Employer | — | `204` (idempotent save) |
| `DELETE` | `/employer/saved-talent/{userId}` | Employer | — | `204` (idempotent remove) |
| `POST` | `/employer/talent/{userId}/introductions` | Employer | `{ "note": string }` | `204` |
| `POST` | `/partner/programmes/{id}/briefing-requests` | Partner | `{ "note": string }` | `204` |

Rules:

- Talent search must filter server-side by the participant's `visibility` and
  `contactPermission`. Hidden profiles must never appear, even in error messages.
- Introduction requests must notify the participant and require their consent before any contact
  details are shared. Employers must not receive email or phone through the search response.
- Nominations must verify that the nominating institution is authorised for the programme, and must
  not reveal whether an email already has an account.
- Briefing requests are visible to the programme owner and the requesting partner only.

---

## Integration status

The service layer is the intended integration boundary, but the migration is not complete:

| Area | Status |
| --- | --- |
| Authentication | Wired end-to-end through `authService`. Setting `VITE_DEMO_MODE=false` switches login, registration, logout, reset and verification to HTTP. |
| Mutations (enrol, complete lesson, register for session, post message, submit evidence, review, grade, invite, update incident/privacy, save talent, request introduction/briefing, mark notifications) | Wired through services with documented endpoints. |
| Read models (programmes, modules, teams, projects, assessments, certificates, notifications, reports, users, incidents, privacy requests, audit log, talent profiles, nominations, saved talent) | **Currently read directly from the demo store** in feature components via `useDemoData()`. The service read methods exist and match the contract, but pages must be migrated to call them (with loading/error states) before the app can run without demo data. |
| Role switching, demo reset, data export | Demonstration-only; must be removed or hard-disabled in a production build. |

Recommended next step for a backend integration:

1. Add a small query layer (for example TanStack Query, or a typed `useServiceQuery` hook) that calls
   the read methods and exposes loading, error and refetch states.
2. Replace `useDemoData()` reads page by page, starting with the participant overview and programme
   catalogue.
3. Remove `src/lib/demoData.ts` and `src/lib/demoDb.ts` from the production bundle once no page
   imports them, and gate `DemoBanner`/role switching behind `DEMO_MODE`.
4. Add contract tests (for example Spring Boot `@WebMvcTest` or generated OpenAPI checks) so these
   paths and payloads cannot drift.

Until step 2 is complete, `VITE_DEMO_MODE=false` will authenticate against the API but most list
screens will still render demonstration data. This is called out in the README limitations.

---

## Security checklist for the API

- Enforce authentication and role checks on every route, including read endpoints.
- Use parameterised queries and validate/serialise all input with a schema.
- Set `HttpOnly`, `Secure`, `SameSite` cookies; rotate session IDs; implement logout everywhere.
- Add CSRF protection for cookie-authenticated writes.
- Rate-limit authentication, verification, search and public certificate lookup.
- Return generic errors; log details server-side with a correlation ID.
- Encrypt data in transit and at rest; restrict database access; back up and test restoration.
- Apply data minimisation: collect only what the programme needs, define retention, support export
  and deletion, and record consent.
- Audit privileged actions (role changes, case access, exports, publication, certificate changes).
- Scan uploads and serve them from a separate origin or signed URLs.
- Run dependency and container scanning in CI; keep secrets in a managed secret store.
- Complete a DPIA, safeguarding review and legal review before processing real participant data.

---

## Endpoints added in the refinement pass

These close the gaps found in the audit: Level One discussions, announcements, quiz auto-scoring,
user administration, password change and facilitator participant selection.

| Method | Path | Role | Request | Response |
| --- | --- | --- | --- | --- |
| `GET` | `/announcements` | Authenticated | — | announcements visible to the caller (role or programme scoped) |
| `POST` | `/admin/announcements` | Admin, programme facilitator | `{ title, body, audienceRole?, programmeId? }` | `201` announcement |
| `GET` | `/programmes/{id}/discussions` | Programme members | — | `Discussion[]` with messages |
| `POST` | `/programmes/{id}/discussions` | Programme members | `{ title, topic, moduleId? }` | `201` discussion |
| `POST` | `/discussions/{id}/messages` | Programme members | `{ body }` | `201` message; `409 DISCUSSION_LOCKED` when locked |
| `PATCH` | `/discussions/{id}?pinned=&locked=` | Programme facilitator, admin | — | `204` |
| `GET` | `/assessments/{id}/questions` | Enrolled participant, programme facilitator, admin | — | `QuestionResponse[]` (never includes the correct option) |
| `POST` | `/assessments/{id}/quiz-attempts` | Participant | `{ answers: [{ questionId, optionIndex }] }` | graded `AttemptResponse`; every question required exactly once |
| `POST` | `/assessments` | Programme facilitator, admin | `{ programmeId, title, type, description, dueAt, maxScore, maxAttempts, questions[] }` | `201`; a quiz's question points must total `maxScore` |
| `GET` | `/admin/users?q=` | Admin | — | up to 200 `UserResponse` |
| `POST` | `/auth/password-change` | Authenticated | `{ currentPassword, newPassword }` | message; other sessions invalidated |
| `GET` | `/facilitator/programmes/{id}/unassigned-participants` | Programme facilitator, admin | — | enrolled participants not on a team |
| `POST` | `/teams/{id}/members/bulk` | Team lead, mentor, facilitator, admin | `{ userIds[], role }` | `TeamResponse`; atomic |

Rules that apply to all of the above: server-side role checks are repeated in the service layer,
writes are CSRF protected, personal data is never returned beyond the caller's scope, and quiz points
are derived from the stored question bank rather than the request body.
