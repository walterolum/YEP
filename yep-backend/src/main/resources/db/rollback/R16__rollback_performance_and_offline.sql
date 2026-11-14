-- R16 — rollback for V17 (performance indexes only).
DROP INDEX idx_notifications_user ON notifications;
DROP INDEX idx_audit_created ON audit_log;
DROP INDEX idx_certificates_scope ON certificates;
DROP INDEX idx_jobs_open ON job_postings;
DROP INDEX idx_submissions_assessment_user ON submissions;
DROP INDEX idx_questions_assessment_order ON questions;
DROP INDEX idx_lesson_progress_user ON lesson_progress;
DROP INDEX idx_enrollments_course_status ON course_enrollments;
DROP INDEX idx_lessons_module_order ON lessons;
