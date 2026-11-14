-- R9 — manual rollback of V10. Run only with a backup of the yep database.
DROP TABLE IF EXISTS course_reviews;

ALTER TABLE courses
    DROP FOREIGN KEY fk_courses_reviewer,
    DROP FOREIGN KEY fk_courses_instructor,
    DROP KEY idx_courses_instructor,
    DROP KEY idx_courses_review_status,
    DROP KEY idx_courses_language,
    DROP COLUMN rating_count,
    DROP COLUMN rating_average,
    DROP COLUMN reviewed_by,
    DROP COLUMN reviewed_at,
    DROP COLUMN review_note,
    DROP COLUMN review_status,
    DROP COLUMN instructor_id,
    DROP COLUMN attribution_text,
    DROP COLUMN author,
    DROP COLUMN licence_url,
    DROP COLUMN licence,
    DROP COLUMN source_url,
    DROP COLUMN source_name,
    DROP COLUMN certificate_available,
    DROP COLUMN language;
