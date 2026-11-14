-- V17 — Phase 7: performance indexes for the hot learner, employer and reporting paths.
-- Idempotent: an index that already exists (from an earlier migration) is skipped, so the
-- script is safe on databases where some of these indexes were added before.
DROP PROCEDURE IF EXISTS yep_add_index;

DELIMITER //
CREATE PROCEDURE yep_add_index(IN tbl VARCHAR(64), IN idx VARCHAR(64), IN ddl TEXT)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.STATISTICS
                   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = tbl AND INDEX_NAME = idx) THEN
        SET @yep_ddl = ddl;
        PREPARE yep_stmt FROM @yep_ddl;
        EXECUTE yep_stmt;
        DEALLOCATE PREPARE yep_stmt;
    END IF;
END //
DELIMITER ;

CALL yep_add_index('lessons', 'idx_lessons_module_order',
    'CREATE INDEX idx_lessons_module_order ON lessons (module_id, sort_order)');
CALL yep_add_index('course_enrollments', 'idx_enrollments_course_status',
    'CREATE INDEX idx_enrollments_course_status ON course_enrollments (course_id, status)');
CALL yep_add_index('lesson_progress', 'idx_lesson_progress_user',
    'CREATE INDEX idx_lesson_progress_user ON lesson_progress (user_id, lesson_id)');
CALL yep_add_index('questions', 'idx_questions_assessment_order',
    'CREATE INDEX idx_questions_assessment_order ON questions (assessment_id, sort_order)');
CALL yep_add_index('submissions', 'idx_submissions_assessment_user',
    'CREATE INDEX idx_submissions_assessment_user ON submissions (assessment_id, user_id)');
CALL yep_add_index('job_postings', 'idx_jobs_open',
    'CREATE INDEX idx_jobs_open ON job_postings (published, closes_at)');
CALL yep_add_index('certificates', 'idx_certificates_scope',
    'CREATE INDEX idx_certificates_scope ON certificates (scope, scope_id)');
CALL yep_add_index('audit_log', 'idx_audit_created',
    'CREATE INDEX idx_audit_created ON audit_log (created_at)');
CALL yep_add_index('notifications', 'idx_notifications_user',
    'CREATE INDEX idx_notifications_user ON notifications (user_id, created_at)');

DROP PROCEDURE yep_add_index;
