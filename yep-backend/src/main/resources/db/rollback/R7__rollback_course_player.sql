-- Manual rollback for V8. Restore a backup first; this only removes the resume pointer.
ALTER TABLE course_enrollments DROP FOREIGN KEY fk_course_enrollments_last_lesson;
ALTER TABLE course_enrollments DROP KEY idx_course_enrollments_last_lesson;
ALTER TABLE course_enrollments DROP COLUMN last_lesson_id;
