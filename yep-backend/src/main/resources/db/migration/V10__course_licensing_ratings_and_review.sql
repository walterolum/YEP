-- V10 — Phase 2: attribution/licensing, ratings, instructors and the review workflow.
-- Additive only; existing courses keep their published state.

ALTER TABLE courses
    ADD COLUMN language             VARCHAR(8)   NOT NULL DEFAULT 'en' AFTER duration_hours,
    ADD COLUMN certificate_available TINYINT(1)  NOT NULL DEFAULT 1 AFTER language,
    ADD COLUMN source_name          VARCHAR(160) NULL AFTER certificate_available,
    ADD COLUMN source_url           VARCHAR(400) NULL,
    ADD COLUMN licence              VARCHAR(80)  NULL,
    ADD COLUMN licence_url          VARCHAR(400) NULL,
    ADD COLUMN author               VARCHAR(160) NULL,
    ADD COLUMN attribution_text     VARCHAR(1000) NULL,
    ADD COLUMN instructor_id        BIGINT       NULL,
    ADD COLUMN review_status        VARCHAR(24)  NOT NULL DEFAULT 'PUBLISHED',
    ADD COLUMN review_note          VARCHAR(1000) NULL,
    ADD COLUMN reviewed_at          DATETIME(6)  NULL,
    ADD COLUMN reviewed_by          BIGINT       NULL,
    ADD COLUMN rating_average       DECIMAL(3,2) NOT NULL DEFAULT 0,
    ADD COLUMN rating_count         INT          NOT NULL DEFAULT 0,
    ADD KEY idx_courses_language (language),
    ADD KEY idx_courses_review_status (review_status),
    ADD KEY idx_courses_instructor (instructor_id),
    ADD CONSTRAINT fk_courses_instructor
        FOREIGN KEY (instructor_id) REFERENCES users (id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_courses_reviewer
        FOREIGN KEY (reviewed_by) REFERENCES users (id) ON DELETE SET NULL;

-- One review per learner per course. Ratings are 1–5.
CREATE TABLE course_reviews (
    id         BIGINT      NOT NULL AUTO_INCREMENT,
    course_id  BIGINT      NOT NULL,
    user_id    BIGINT      NOT NULL,
    rating     TINYINT     NOT NULL,
    body       VARCHAR(2000) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_course_reviews_user_course (user_id, course_id),
    KEY idx_course_reviews_course (course_id),
    CONSTRAINT fk_course_reviews_course
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    CONSTRAINT fk_course_reviews_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
