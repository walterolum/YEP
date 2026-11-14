# Phase 1 API additions

All routes are JSON over the existing `/api` base. Authentication is the same stateless JWT
(`Authorization: Bearer <token>`). Errors keep the shared `{status, message}` shape.

## Registration and verification

### `POST /api/auth/signup`

New optional fields: `phoneCountryCode` (`+256`), `countryCode` (`UG`). `phone` is now required and is
stored digits-only; a local trunk zero is removed. Unknown `countryCode` values are rejected.

```json
{
  "fullName": "Amara Nakato", "email": "amara@yep.example",
  "phoneCountryCode": "+256", "phone": "700 000 000",
  "password": "StrongPass99!", "confirmPassword": "StrongPass99!",
  "country": "Uganda", "countryCode": "UG", "district": "Kampala",
  "dateOfBirth": "2001-05-04", "gender": "Female",
  "educationLevel": "Diploma", "employmentStatus": "Student",
  "careerGoal": "Become a data analyst", "preferredLanguage": "en",
  "interests": ["Technology"], "termsAccepted": true, "privacyAccepted": true
}
```

`201` returns `{message, user}` with `phoneCountryCode`, `countryCode` and `status: "PENDING"`.
Rejections: weak/common password (400), missing phone (400), unknown country code (400), duplicate
email (400), outside 18–35 (400), too many registrations from the client (429).

A verification token (24 h, single use, SHA-256 stored) is issued and delivered as an in-app
notification. Sign-in is blocked only while `settings.require_email_verification = true`.

### `POST /api/auth/verify-email`

```json
{ "token": "<code from the notification>" }
```

`200` → `{message, user}` with `emailVerifiedAt` set. Expired, used or unknown tokens return 400.

### `POST /api/auth/resend-verification`

Requires a bearer token. Issues a fresh code and returns
`{message: "A new verification code has been sent to your notifications."}`.

### `GET /api/public/countries`

Anonymous. Returns every ISO country, African countries first:

```json
[{ "code": "DZ", "name": "Algeria", "dialCode": "+213", "region": "Africa" }, …]
```

`dialCode` is `""` where the platform does not ship one; the form lets the learner type a prefix.

## Role workspaces

| Route | Roles | Payload |
|---|---|---|
| `GET /api/instructor/courses` | ADMIN, INSTRUCTOR | Every course with module/lesson counts and publication state |
| `GET /api/instructor/stats` | ADMIN, INSTRUCTOR | `courses, participants, projects, certificates, sessions` |
| `GET /api/reviewer/courses` | ADMIN, REVIEWER | Same course list, read-only |
| `GET /api/reviewer/stats` | ADMIN, REVIEWER | Same counters |
| `GET /api/employer/stats` | ADMIN, EMPLOYER | Same counters plus `instructors`, `employers` |

`GET /api/dashboard` now returns role-specific `stats` for INSTRUCTOR, REVIEWER and EMPLOYER instead of
the administrator totals. `GET /api/content/**` is readable by REVIEWER; writes still require
ADMIN, FACILITATOR or INSTRUCTOR, and the service checks the same capability.

## Roles accepted by `POST /api/admin/users`

`PARTICIPANT`, `MENTOR`, `FACILITATOR`, `SPONSOR`, `INSTRUCTOR`, `EMPLOYER`, `REVIEWER`, `ADMIN`.
