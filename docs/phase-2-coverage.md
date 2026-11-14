# Phase 2 — Catalogue, attributed content, review workflow and ratings

Status: **delivered**. Schema versions V10 (licensing, ratings, review loop) and V11 (attributed seed catalogue)
applied on top of V9; rollbacks R9 and R10 accompany them.

## What shipped

### 1. Licensing and attribution enforced by the schema
`courses` now carries `language`, `certificate_available`, `source_name`, `source_url`, `licence`,
`licence_url`, `author`, `attribution_text`, `instructor_id`, `review_status`, `review_note`,
`submitted_at`, `approved_at`, `rating_average`, `rating_count`.

Every catalogue entry must state where it came from, who wrote it and under which licence. The course page
renders that block ("Source, licence and attribution") with links to the source and the licence deed, so a
learner can always see why YEP is allowed to teach the material. `Course.applyLicensing` is the single
write path used by seeds, instructor drafts and admin edits.

`Course.submitForReview` refuses to submit unless `source_name`, `licence`, `author` and
`attribution_text` are all non-blank and the licence is not the placeholder "unlicensed".

### 2. Seed catalogue (V11)
| Academy | Course | Source | Licence |
|---|---|---|---|
| Tech & Digital | Digital Foundations (existing) | YEP original | YEP original |
| Tech & Digital | Web Development Fundamentals (existing) | freeCodeCamp Responsive Web Design | CC BY 4.0 |
| Business & Entrepreneurship | Entrepreneurship Essentials (existing) | OpenStax Entrepreneurship | CC BY 4.0 |
| Agriculture & Agribusiness | Climate-Smart Agriculture (existing) | FAO climate-smart agriculture | CC BY-NC-SA 3.0 IGO |
| Creative & Media | Digital Storytelling (existing) | MIT OCW CMS.611J (adapted) | CC BY-NC-SA 4.0 |
| Professional & Life Skills | Employability Skills (existing) | OpenLearn *Skills for work* | CC BY-NC-SA 4.0 |
| Vocational & Green Skills | Solar Installation Basics (existing) | YEP original | YEP original |
| Math & Science | Applied Mathematics for Everyday Life *(new)* | OpenStax Elementary Algebra 2e | CC BY 4.0 |
| Soft Skills & Leadership | Leading Small Teams *(new)* | OpenLearn *Leadership and management* | CC BY-NC-SA 4.0 |
| Career Development | Career Planning and Job Search *(new)* | Khan Academy career resources | CC BY-NC-SA 4.0 |
| Life Skills | Everyday Life Skills *(new)* | YEP original | YEP original |

Each new academy also received one new career path. Four courses carry a full outline (2 modules × 2 lessons
each, module and lesson ids 100–139); the rest keep the outlines they already had or await content in Phase 3.
Totals after V11: **10 academies, 15 courses, 25 modules, 55 lessons**, all 15 courses attributed.

### 2b. Tech & Digital course set (V12, rollback R11)
Nine further courses make Tech & Digital the complete pathway the brief asked for:

| Course | Career path | Source | Licence |
|---|---|---|---|
| Python Programming Fundamentals | Software Development | freeCodeCamp Scientific Computing with Python | CC BY-SA 4.0 |
| Java Programming Foundations | Software Development | MIT OCW 6.092 | CC BY-NC-SA 4.0 |
| SQL and Databases | Software Development | Khan Academy Intro to SQL | CC BY-NC-SA 3.0 US |
| Mobile App Development Basics | Software Development | YEP original | YEP original |
| Data Analysis for Decisions | Data & AI | OpenLearn *Using data* | CC BY-NC-SA 4.0 |
| AI Basics for Work | Data & AI | OpenLearn *Artificial intelligence* | CC BY-NC-SA 4.0 |
| Cybersecurity Essentials | Cybersecurity | OpenLearn *Introduction to cyber security* | CC BY-NC-SA 4.0 |
| UI/UX Design Foundations | Product & Design | OpenLearn *Design thinking* | CC BY-NC-SA 4.0 |
| Digital Marketing Fundamentals | Digital Marketing | OpenStax Principles of Marketing | CC BY 4.0 |

Four new career paths (Data & AI, Cybersecurity, Product & Design, Digital Marketing). Every course has two
modules and four original lessons (module ids 200–217, lesson ids 200–235) with learning outcomes, so the whole
Tech pathway is now learnable instead of being an empty shell. Totals after V12: **10 academies, 24 courses,
43 modules, 91 lessons**, all 24 courses attributed.

### 3. Instructor → reviewer workflow
Statuses: `DRAFT → SUBMITTED → APPROVED → PUBLISHED`, plus `CHANGES_REQUESTED` looping back to the instructor.

* Instructor (`POST /api/instructor/courses`) creates a draft with attribution fields; the course is owned by
  that instructor and is invisible in the catalogue.
* Instructor submits with `POST /api/instructor/courses/{id}/submit`. Blocked without attribution and without
  at least one module; the submitter must own the course.
* Reviewers (and admins) see the queue at `GET /api/reviewer/submissions` and decide with
  `POST /api/reviewer/submissions/{id}/decision` (`APPROVE` publishes, `CHANGES` returns it with a note).
* Self-approval is rejected with 403 — the deciding user must differ from `instructor_id`, and only
  `SUBMITTED` courses can be decided (409 otherwise). Published courses are read-only in the catalogue.

### 4. Ratings and reviews
`course_reviews` (unique per `user_id + course_id`) stores one review per learner. `CourseReviewService.rate`
requires enrolment, upserts the learner's review, then recomputes `rating_average`/`rating_count` from the
stored rows so the catalogue always reads a consistent aggregate. `GET /api/courses/{slug}/reviews` returns
the public list with learner display names; the course page shows the average plus each review.

### 5. Catalogue search filters
`GET /api/courses` accepts `academy`, `level`, `q`, `language`, `minHours`, `maxHours`, `certificate`
and `minRating`, all optional. Filtering runs as JPA criteria with bound parameters (no string
concatenation); `q` matches title, code and summary. `GET /api/courses/{slug}/syllabus` returns modules and
lesson titles without requiring enrolment.

## Verification performed
* `./mvnw.cmd -o test` — **114 tests pass** (8 new: workflow and review service tests, updated controller
  test for the filter signature).
* `node --check static/js/app.js` — clean.
* Flyway applied V10 and V11 on the existing `yep` database with no data loss (users, enrolments,
  progress and certificates untouched).
* Live API checks: filters (`academy`, `language+maxHours`, `certificate+minRating`, `q`), syllabus,
  attribution payload, review post (`rating 5.0, count 1`), and a full instructor draft → module → submit →
  reviewer approve → appears in public catalogue cycle. The probe course was deleted afterwards.

## Deliberately not in Phase 2
* Rich lesson bodies / interactive exercises (videos, code runner, quizzes wired to marks) — Phase 3.
* Moderating or deleting reviews; ratings are append-only for now.
