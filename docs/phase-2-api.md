# Phase 2 API reference — catalogue, workflow, ratings

All routes are under `/api`, require a Bearer JWT except the public catalogue reads, and return JSON.
Errors use `{ "message": "…" }`; 403 = role/ownership violation, 409 = wrong state, 400 = invalid input.

## Public catalogue

`GET /api/courses` — optional query parameters: `academy` (slug), `level` (1|2), `q`, `language`,
`minHours`, `maxHours`, `certificate` (true|false), `minRating` (0–5). Returns `CourseView[]`:

```json
{ "id": 25, "code": "MTH-APPLIED-L1", "title": "Applied Mathematics for Everyday Life",
  "slug": "applied-mathematics-everyday-life", "academyName": "Math & Science",
  "careerPathTitle": "Quantitative Reasoning", "level": 1, "durationHours": 20,
  "language": "en", "certificateAvailable": true, "sourceName": "OpenStax — Elementary Algebra 2e",
  "sourceUrl": "https://openstax.org/details/books/elementary-algebra-2e",
  "licence": "CC BY 4.0", "licenceUrl": "https://creativecommons.org/licenses/by/4.0/",
  "author": "OpenStax, Rice University; adapted by YEP",
  "attributionText": "Adapted from OpenStax Elementary Algebra 2e (CC BY 4.0); …",
  "instructorName": "Instructor One", "reviewStatus": "PUBLISHED",
  "ratingAverage": 4.5, "ratingCount": 2, "moduleCount": 2, "lessonCount": 4, "enrolled": false }
```

`GET /api/courses/{slug}/syllabus` — `{ course, modules: [{ id, name, icon, outcome, level, lessons: [{ id, title, type, durationMinutes }] }] }`.

`GET /api/courses/{slug}/reviews` — `[{ id, learnerName, rating, body, createdAt }]`, newest first.

`POST /api/courses/{slug}/reviews` — body `{ "rating": 1–5, "body": "…" }`. Enrolled learners only (403
otherwise); re-posting updates the learner's own review and recomputes the average. Returns the review.

## Instructor

`GET /api/instructor/my-courses` — the caller's own courses with `reviewStatus` and `reviewNote`.

`POST /api/instructor/courses` — create a draft; requires `careerPathId`, `code`, `title`, `level`; accepts
`summary`, `description`, `durationHours`, `language`, `certificateAvailable`, `sourceName`, `sourceUrl`,
`licence`, `licenceUrl`, `author`, `attributionText`. Returns the `CourseView`.

`POST /api/instructor/courses/{id}/submit` — submits a draft or a course with requested changes. 403 if the
caller does not own it, 409 if `sourceName`/`licence`/`author`/`attributionText` are missing or the course has
no modules. Returns the updated `CourseView` with `reviewStatus: "SUBMITTED"`.

## Reviewer (also available to ADMIN)

`GET /api/reviewer/submissions` — courses in `SUBMITTED` state with instructor name and module count.

`POST /api/reviewer/submissions/{id}/decision` — `{ "decision": "APPROVE" | "CHANGES", "note": "…" }`.
`APPROVE` sets `APPROVED` and publishes the course; `CHANGES` sets `CHANGES_REQUESTED` and returns the note to
the instructor. 403 when the reviewer is the course's own instructor, 409 when the course is not `SUBMITTED`.

## Roles summary
| Route | ADMIN | INSTRUCTOR | REVIEWER | others |
|---|---|---|---|---|
| `GET /api/courses`, `/syllabus`, `/reviews` | ✓ | ✓ | ✓ | ✓ public |
| `POST /api/courses/{slug}/reviews` | ✗ | ✗ | ✗ | enrolled PARTICIPANT |
| `/api/instructor/**` | ✓ | ✓ | ✗ | 403 |
| `/api/reviewer/**` | ✓ | ✗ | ✓ | 403 |
