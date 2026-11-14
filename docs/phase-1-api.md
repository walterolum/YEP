# Phase 1 API — academies, career paths, courses and enrolment

Base URL: `http://localhost:8080/api`. All request and response bodies are JSON unless stated.
Authentication is a JWT bearer token: `Authorization: Bearer <token>`, obtained from
`POST /auth/login`.

- **Public** — no token required.
- **Authenticated** — any signed-in account.
- **Participant** — `PARTICIPANT` role only.
- **Admin** — `ADMIN` role only (enforced by `SecurityConfig` and again in services).

Errors use the existing shape:

```json
{ "status": 400, "message": "Human-readable reason." }
```

Validation failures return `400`; a missing resource returns `404`; a role violation returns `403`;
a missing or expired token returns `401`.

---

## 1. Authentication

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| `POST` | `/auth/signup` | Public | `SignupRequest` | `AuthView` (token is `null`; account is `PENDING`) |
| `POST` | `/auth/login` | Public | `{ "email", "password" }` | `AuthView` — `{ token, expiresInSeconds, user }` |
| `GET` | `/auth/me` | Authenticated | — | `UserView` |
| `PUT` | `/auth/profile` | Authenticated | `ProfileUpdateRequest` | `UserView` |
| `POST` | `/auth/password` | Authenticated | `{ "currentPassword", "newPassword" }` | `204` |

`SignupRequest` (Phase 1 contract):

```json
{
  "fullName": "Amara Nakato",
  "email": "amara@example.com",
  "phone": "+256700000000",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "country": "Uganda",
  "district": "Kampala",
  "dateOfBirth": "2002-04-12",
  "institution": "Makerere University",
  "fieldOfStudy": "Computer Science",
  "gender": "Female",
  "educationLevel": "University",
  "employmentStatus": "Student",
  "careerGoal": "Become a front-end developer",
  "preferredLanguage": "en",
  "interests": ["Technology", "Design"],
  "termsAccepted": true,
  "privacyAccepted": true
}
```

Rules: participants only; age 18–35; unique email; password 8–72 characters; both consents required;
language one of `en`, `sw`, `lg`, `rw`; at most 12 non-blank interests.

---

## 2. Public catalogue

| Method | Path | Auth | Query | Response |
|---|---|---|---|---|
| `GET` | `/academies` | Public | — | `AcademyView[]` (published only) |
| `GET` | `/academies/{slug}` | Public | — | `AcademyDetailView` |
| `GET` | `/courses` | Public | `academy`, `level` (1/2), `q` | `CourseView[]` (published only) |
| `GET` | `/courses/{slug}` | Public | — | `CourseView` |

If a bearer token is supplied, `CourseView.enrolled` reflects that learner's enrolments; anonymous
requests receive `false`.

`AcademyView`

```json
{
  "id": 1, "name": "Tech & Digital", "slug": "tech-digital",
  "tagline": "Digital literacy, software, data, AI and cybersecurity",
  "description": null, "icon": "💻", "colour": null,
  "sortOrder": 10, "published": true, "careerPathCount": 2, "courseCount": 2
}
```

`AcademyDetailView`

```json
{
  "academy": { "...": "AcademyView" },
  "careerPaths": [
    {
      "id": 1, "academyId": 1, "academyName": "Tech & Digital",
      "title": "Digital Foundations", "slug": "digital-foundations",
      "summary": "The YEP Level One foundation path in digital skills.",
      "description": null, "icon": "🧭", "sortOrder": 10, "published": true,
      "courses": [ { "...": "CourseView" } ]
    }
  ]
}
```

`CourseView`

```json
{
  "id": 2, "careerPathId": 2, "careerPathTitle": "Software Development",
  "academyId": 1, "academyName": "Tech & Digital",
  "code": "TECH-WEB-L1", "title": "Web Development Fundamentals",
  "slug": "web-development-fundamentals",
  "summary": "HTML, CSS, JavaScript and the web platform.",
  "description": "Build and publish your first responsive website...",
  "level": 1, "durationHours": 40, "icon": "🌐",
  "moduleCount": 0, "lessonCount": 0, "published": true, "enrolled": false
}
```

---

## 3. Enrolment

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| `GET` | `/me/enrollments` | Authenticated | — | `EnrollmentView[]` |
| `POST` | `/courses/{courseId}/enrol` | Participant | — | `EnrollmentView` |

Behaviour:

- Enrolling twice returns the **existing** enrolment (same `id`), never a duplicate row.
- An unpublished course returns `400`.
- Staff and other roles receive `403` (“Only participants can enrol in a course.”).
- Every successful call writes `COURSE_ENROL` to the audit log.

`EnrollmentView`

```json
{
  "id": 1, "courseId": 2, "courseTitle": "Web Development Fundamentals",
  "courseSlug": "web-development-fundamentals", "status": "ENROLLED",
  "enrolledAt": "2026-11-13T17:20:00Z", "completedAt": null
}
```

---

## 4. Admin catalogue manager

All routes require `ADMIN`.

| Method | Path | Request | Response |
|---|---|---|---|
| `GET` | `/admin/catalogue` | — | `AcademyDetailView[]` including unpublished rows |
| `GET` | `/admin/courses` | — | `CourseView[]` including unpublished rows |
| `POST` | `/admin/academies` | `AcademyRequest` | `201 AcademyView` |
| `PUT` | `/admin/academies/{id}` | `AcademyRequest` | `AcademyView` |
| `PUT` | `/admin/academies/{id}/publish?published={bool}` | — | `AcademyView` |
| `POST` | `/admin/career-paths` | `CareerPathRequest` | `201 CareerPathView` |
| `PUT` | `/admin/career-paths/{id}` | `CareerPathRequest` | `CareerPathView` |
| `PUT` | `/admin/career-paths/{id}/publish?published={bool}` | — | `CareerPathView` |
| `POST` | `/admin/courses` | `CourseRequest` | `201 CourseView` |
| `PUT` | `/admin/courses/{id}` | `CourseRequest` | `CourseView` |
| `PUT` | `/admin/courses/{id}/publish?published={bool}` | — | `CourseView` |

Slugs are generated from the name/title when omitted and made unique; a duplicate returns `400`.
`published` defaults to `true` on creation when omitted.

`AcademyRequest`

```json
{
  "name": "Health & Wellbeing", "slug": null,
  "tagline": "Community health and care work",
  "description": "Optional long description.",
  "icon": "🩺", "colour": "#0f766e",
  "sortOrder": 70, "published": true
}
```

`CareerPathRequest`

```json
{
  "academyId": 1, "title": "Cloud Support", "slug": null,
  "summary": "Support users and small cloud deployments.",
  "description": null, "icon": "☁️", "sortOrder": 30, "published": true
}
```

`CourseRequest`

```json
{
  "careerPathId": 2, "code": "TECH-CLOUD-L1", "title": "Cloud Foundations",
  "slug": null, "summary": "Core cloud concepts.",
  "description": null, "level": 1, "durationHours": 30,
  "icon": "☁️", "sortOrder": 30, "published": true
}
```

Course rules: `code` is 2–40 characters of letters, digits or hyphens and unique (case-insensitive);
`level` must be `1` (Level One) or `2` (Level Two); `durationHours >= 0`; colour must be a hex value
such as `#1d4ed8`.

---

## 5. Existing endpoints used by Phase 1 screens

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/public/stats` | Public | Landing-page counters |
| `GET` | `/public/programmes` | Public | Published programme cards |
| `GET` | `/public/certificates/{code}` | Public | Certificate verification |
| `GET` | `/learning/modules` | Authenticated | Learning Hub modules and lessons |
| `GET` | `/learning/progress` | Authenticated | Level One percentage and Level Two unlock |
| `GET` | `/dashboard` | Authenticated | Participant dashboard |
| `GET` | `/admin/dashboard` | Admin | Admin counters |
| `GET` | `/admin/users?role=&status=&q=&country=&education=` | Admin | User directory, filterable by role, status, country and education level |
| `POST` | `/admin/users` | Admin | Create a staff account |
| `PUT` | `/admin/users/{id}/status` | Admin | Approve / reject / suspend |

---

## 6. Status codes

| Code | Meaning |
|---|---|
| `200` | Read or update succeeded |
| `201` | Academy, career path or course created |
| `204` | No content (password change) |
| `400` | Validation or business-rule failure (duplicate slug/code, unpublished course, age, consent) |
| `401` | Missing or invalid token |
| `403` | Wrong role (participant using admin routes, staff trying to enrol) |
| `404` | Unknown academy, career path, course or account |
| `500` | Unexpected server error (message is never leaked to the client) |
