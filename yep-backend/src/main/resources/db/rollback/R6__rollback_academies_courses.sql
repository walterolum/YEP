-- Manual rollback for V6 + V7. NOT a Flyway migration: this file lives outside
-- db/migration so Flyway will never apply it automatically.
--
-- Run only against a copy or after taking a fresh backup:
--   mysql -u root yep < src/main/resources/db/rollback/R6__rollback_academies_courses.sql
--
-- Dropping `academies` cascades through career_paths → courses → course_enrollments,
-- so all V7 seed content is removed as well. Existing users, programmes, modules,
-- lessons and progress rows are preserved.

DROP TABLE IF EXISTS course_enrollments;
DROP TABLE IF EXISTS user_interests;

ALTER TABLE users
    DROP COLUMN guardian_consent_at,
    DROP COLUMN guardian_phone,
    DROP COLUMN guardian_name,
    DROP COLUMN email_verified_at,
    DROP COLUMN privacy_accepted_at,
    DROP COLUMN terms_accepted_at,
    DROP COLUMN preferred_language,
    DROP COLUMN career_goal,
    DROP COLUMN employment_status,
    DROP COLUMN education_level,
    DROP COLUMN gender;

ALTER TABLE programmes DROP FOREIGN KEY fk_programmes_course;
ALTER TABLE programmes DROP KEY idx_programmes_course;
ALTER TABLE programmes DROP COLUMN course_id;

ALTER TABLE modules DROP FOREIGN KEY fk_modules_course;
ALTER TABLE modules DROP KEY idx_modules_course;
ALTER TABLE modules DROP COLUMN course_id;

DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS career_paths;
DROP TABLE IF EXISTS academies;

DELETE FROM settings WHERE setting_key IN
    ('overall_weight_lessons', 'overall_weight_assessments', 'overall_weight_attendance');
