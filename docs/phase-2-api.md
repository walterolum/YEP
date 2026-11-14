# Phase 2 API — course player, progress and content authoring

Adds the course player and content authoring on top of the Phase 1 catalogue. Base URL
`http://localhost:8080/api`. Authentication is the same JWT bearer token.

Errors keep the existing shape `{ "status": 400, "message": "…" }`. Validation and business-rule
failures return `400`, a missing row returns `404`, a role violation returns `403`.

---

## 1. The one overall score

Every screen reads the same derived number:

```
overall = lessons% × 40 + assessments% × 40 + attendance% × 20   (weights from settings, normalised)
lessons% = completed lessons in scope ÷ lessons in scope
assessments% = mean percentage of every scored submission (0 if none)
attendance% = present sessions ÷ marked sessions (0 if none)
```

- Scope is the whole curriculum, one course, or one career path.
- Level Two unlocks when `overall >= level2_min_completion` (default **80**).
- The gate is **monotonic**: a learner who already has a Level Two project stays unlocked even if a
  later rule or weight change would score them below 80.
- The extra thresholds (`level2_min_assessment`, `level2_min_attendance`) remain as quality checks for
  Level Two eligibility, not for the unlock.
- Scores are never stored; they are recomputed from `lesson_progress`, `submissions`, `attendance`.

`GET /learning/progress` now returns `overallScore` and `careerPathScores` alongside the Phase 1
fields:

```json
{
  "levelOnePercent": 100, "completedLessons": 15, "totalLessons": 15,
  "levelTwoPercent": 100, "levelTwoUnlocked": true, "levelTwoEligible": false,
  "milestonesCompleted": 4, "milestonesTotal": 4,
  "assessmentAverage": 78, "attendancePercent": 0,
  "certificateEligible": true,
  "policy": { "minAge": 18, "maxAge": 35, "level2MinCompletion": 80,
              "level2MinAssessment": 65, "level2MinAttendance": 75 },
  "modulePercents": { "Digital Literacy": 100 },
  "overallScore": 71,
  "careerPathScores": { "Digital Foundations": 71 }
}
```

---

## 2. Course player

| Method | Path | Auth | Response |
|---|---|---|---|
| `GET` | `/courses/{slug}/outline` | Public (personalised when a token is sent) | `CourseOutlineView` |
| `GET` | `/me/course-progress` | Authenticated | `CourseProgressView[]` |
| `POST` | `/courses/{courseId}/lessons/{lessonId}/complete` | Participant (enrolled) | `ModuleView` |
| `DELETE` | `/courses/{courseId}/lessons/{lessonId}/complete` | Participant (enrolled) | `ModuleView` |

`CourseOutlineView`

```json
{
  "course": { "…": "CourseView" },
  "enrolled": true,
  "percent": 20, "completedLessons": 3, "totalLessons": 15,
  "overallScore": 44,
  "resumeLessonId": 4,
  "impactProjectId": null, "impactProjectTitle": null,
  "modules": [
    { "id": 1, "name": "Digital Literacy", "icon": "💻", "outcome": "…",
      "totalLessons": 3, "completedLessons": 3, "percent": 100,
      "lessons": [ { "id": 1, "title": "Introduction to digital tools",
                     "type": "VIDEO", "durationMinutes": 20, "completed": true } ] }
  ]
}
```

Behaviour:

- A lesson must belong to the course in the path; otherwise `400` (“That lesson is not part of this
  course.”).
- Completing or reopening requires an enrolment; otherwise `403`.
- Both calls record `course_enrollments.last_lesson_id`, so the player can offer **Resume**.
- When the last lesson is completed the enrolment becomes `COMPLETED` (`completed_at` set);
  reopening any lesson returns it to `ENROLLED` so the status never contradicts the percentage.
- A Level Two course returns the learner’s team impact project so the player can link to it.

`CourseProgressView`

```json
{ "courseId": 1, "title": "YEP Core — Level One", "slug": "yep-core-level-one",
  "level": 1, "status": "ENROLLED", "percent": 20,
  "completedLessons": 3, "totalLessons": 15, "overallScore": 44 }
```

---

## 3. Content authoring

Roles: `ADMIN` and `FACILITATOR` only (`/api/content/**` in `SecurityConfig`, re-checked in
`CourseContentService`). Content is data — a new module or lesson never needs a deployment.

| Method | Path | Request | Response |
|---|---|---|---|
| `GET` | `/content/courses/{courseId}/outline` | — | `CourseOutlineView` including drafts |
| `POST` | `/content/courses/{courseId}/modules` | `ModuleRequest` | `201 ModuleView` |
| `PUT` | `/content/modules/{moduleId}` | `ModuleRequest` | `ModuleView` |
| `DELETE` | `/content/modules/{moduleId}` | — | `{ "deleted": true }` |
| `POST` | `/content/modules/{moduleId}/lessons` | `LessonRequest` | `201 LessonView` |
| `PUT` | `/content/lessons/{lessonId}` | `LessonRequest` | `LessonView` |
| `DELETE` | `/content/lessons/{lessonId}` | — | `{ "deleted": true }` |

`ModuleRequest`

```json
{ "name": "Foundations of web", "icon": "🌐", "outcome": "Publish a first page.",
  "sortOrder": 10, "level": 1 }
```

`LessonRequest`

```json
{ "title": "HTML structure", "type": "NOTES", "sortOrder": 10,
  "durationMinutes": 20, "content": "Lesson notes, transcript or activity brief…" }
```

Rules:

- `type` is `VIDEO`, `NOTES` or `ACTIVITY`; anything else returns `400`.
- `level` is `1` or `2`; omitted means the course level.
- **Deleting a module that still has lessons returns `400`** — remove the lessons first.
- **Deleting a lesson that learners have completed returns `400`** — edit it instead, so learner
  evidence is never rewritten.
- Every create, update and delete writes an audit entry (`MODULE_CREATE`, `LESSON_UPDATE`, …).

---

## 4. Deployment and schema

| Item | Value |
|---|---|
| Migration | `V8__course_player_and_resume.sql` (adds `course_enrollments.last_lesson_id`, nullable) |
| Rollback | `db/rollback/R7__rollback_course_player.sql` |
| Existing data | No row is modified; the new column is `NULL` for every existing enrolment |
| Frontend | Course player at `#/app/course`, admin content manager from **Academies → All courses → Content** |

Phase 2 does not add PWA, video streaming, transcripts, low-data mode, discussions or certificates —
those are later phases in `docs/step-0-audit-and-plan.md` §8.
