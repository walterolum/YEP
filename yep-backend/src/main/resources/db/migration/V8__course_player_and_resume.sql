-- V8 — Course player support.
--
-- Additive only. Stores where a learner stopped in a course so the player can resume,
-- and leaves every existing enrolment and lesson untouched (the new column is nullable).

ALTER TABLE course_enrollments
    ADD COLUMN last_lesson_id BIGINT NULL AFTER completed_at,
    ADD KEY idx_course_enrollments_last_lesson (last_lesson_id),
    ADD CONSTRAINT fk_course_enrollments_last_lesson
        FOREIGN KEY (last_lesson_id) REFERENCES lessons (id) ON DELETE SET NULL;
