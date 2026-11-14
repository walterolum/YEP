-- V6 — Academy → Career Path → Course hierarchy, richer registration fields
--      and course enrolment.
--
-- Additive only: no existing column is dropped and no existing row is deleted.
-- The five existing Level One modules are attached to a system course so every
-- lesson keeps its place, and the existing cohorts (programmes) stay valid.

-- ---------------------------------------------------------------------------
-- 1. Academies — the six mission groups; administrators add more at runtime.
-- ---------------------------------------------------------------------------
CREATE TABLE academies (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(160) NOT NULL,
    slug        VARCHAR(160) NOT NULL,
    tagline     VARCHAR(240) NULL,
    description TEXT         NULL,
    icon        VARCHAR(16)  NULL,
    colour      VARCHAR(16)  NULL,
    sort_order  INT          NOT NULL DEFAULT 0,
    published   TINYINT(1)   NOT NULL DEFAULT 1,
    created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_academies_slug (slug),
    KEY idx_academies_published (published)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 2. Career paths inside an academy.
-- ---------------------------------------------------------------------------
CREATE TABLE career_paths (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    academy_id  BIGINT       NOT NULL,
    title       VARCHAR(160) NOT NULL,
    slug        VARCHAR(160) NOT NULL,
    summary     VARCHAR(500) NULL,
    description TEXT         NULL,
    icon        VARCHAR(16)  NULL,
    sort_order  INT          NOT NULL DEFAULT 0,
    published   TINYINT(1)   NOT NULL DEFAULT 1,
    created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_career_paths_slug (slug),
    KEY idx_career_paths_academy (academy_id),
    KEY idx_career_paths_published (published),
    CONSTRAINT fk_career_paths_academy
        FOREIGN KEY (academy_id) REFERENCES academies (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 3. Courses inside a career path. level 1 = Level One, 2 = Level Two.
-- ---------------------------------------------------------------------------
CREATE TABLE courses (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    career_path_id BIGINT       NOT NULL,
    code           VARCHAR(40)  NOT NULL,
    title          VARCHAR(160) NOT NULL,
    slug           VARCHAR(160) NOT NULL,
    summary        VARCHAR(500) NULL,
    description    TEXT         NULL,
    level          TINYINT      NOT NULL DEFAULT 1,
    duration_hours INT          NOT NULL DEFAULT 0,
    icon           VARCHAR(16)  NULL,
    sort_order     INT          NOT NULL DEFAULT 0,
    published      TINYINT(1)   NOT NULL DEFAULT 0,
    created_at     DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at     DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_courses_code (code),
    UNIQUE KEY uk_courses_slug (slug),
    KEY idx_courses_path (career_path_id),
    KEY idx_courses_published (published),
    CONSTRAINT fk_courses_career_path
        FOREIGN KEY (career_path_id) REFERENCES career_paths (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 4. Attach existing modules to a course: nullable, backfill, then NOT NULL.
-- ---------------------------------------------------------------------------
ALTER TABLE modules
    ADD COLUMN course_id BIGINT NULL AFTER id,
    ADD KEY idx_modules_course (course_id),
    ADD CONSTRAINT fk_modules_course
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE;

-- System rows so the existing 5 modules and 15 lessons keep their content.
INSERT INTO academies (name, slug, tagline, icon, sort_order, published)
VALUES ('Tech & Digital', 'tech-digital',
        'Digital literacy, software, data, AI and cybersecurity', '💻', 10, 1);

INSERT INTO career_paths (academy_id, title, slug, summary, icon, sort_order, published)
SELECT id, 'Digital Foundations', 'digital-foundations',
       'The YEP Level One foundation path in digital skills.', '🧭', 10, 1
FROM academies WHERE slug = 'tech-digital';

INSERT INTO courses (career_path_id, code, title, slug, summary, level, duration_hours, icon, sort_order, published)
SELECT id, 'YEP-CORE-L1', 'YEP Core — Level One', 'yep-core-level-one',
       'The existing five-module Level One curriculum.', 1, 15, '🎓', 10, 1
FROM career_paths WHERE slug = 'digital-foundations';

UPDATE modules
SET course_id = (SELECT id FROM (SELECT id FROM courses WHERE code = 'YEP-CORE-L1') AS core)
WHERE course_id IS NULL;

ALTER TABLE modules MODIFY COLUMN course_id BIGINT NOT NULL;

-- Existing cohorts may deliver a course; nullable so no cohort breaks.
ALTER TABLE programmes
    ADD COLUMN course_id BIGINT NULL AFTER id,
    ADD KEY idx_programmes_course (course_id),
    ADD CONSTRAINT fk_programmes_course
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- 5. Registration and profile fields.
-- ---------------------------------------------------------------------------
ALTER TABLE users
    ADD COLUMN gender              VARCHAR(20)  NULL AFTER phone,
    ADD COLUMN education_level     VARCHAR(40)  NULL AFTER institution,
    ADD COLUMN employment_status   VARCHAR(40)  NULL AFTER education_level,
    ADD COLUMN career_goal         VARCHAR(240) NULL AFTER employment_status,
    ADD COLUMN preferred_language  VARCHAR(8)   NOT NULL DEFAULT 'en' AFTER career_goal,
    ADD COLUMN terms_accepted_at   DATETIME(6)  NULL,
    ADD COLUMN privacy_accepted_at DATETIME(6)  NULL,
    ADD COLUMN email_verified_at   DATETIME(6)  NULL,
    ADD COLUMN guardian_name       VARCHAR(120) NULL,
    ADD COLUMN guardian_phone      VARCHAR(40)  NULL,
    ADD COLUMN guardian_consent_at DATETIME(6)  NULL;

CREATE TABLE user_interests (
    id       BIGINT      NOT NULL AUTO_INCREMENT,
    user_id  BIGINT      NOT NULL,
    interest VARCHAR(80) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_user_interests_user (user_id),
    CONSTRAINT fk_user_interests_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 6. Course enrolment (distinct from a programme/cohort application).
-- ---------------------------------------------------------------------------
CREATE TABLE course_enrollments (
    id           BIGINT      NOT NULL AUTO_INCREMENT,
    user_id      BIGINT      NOT NULL,
    course_id    BIGINT      NOT NULL,
    status       VARCHAR(20) NOT NULL DEFAULT 'ENROLLED',
    enrolled_at  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    completed_at DATETIME(6) NULL,
    created_at   DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at   DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_course_enrollments_user_course (user_id, course_id),
    KEY idx_course_enrollments_course (course_id),
    CONSTRAINT fk_course_enrollments_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_course_enrollments_course
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 7. Weighted overall-score settings (consumed in Phase 2).
-- ---------------------------------------------------------------------------
INSERT INTO settings (setting_key, setting_value) VALUES
    ('overall_weight_lessons', '40'),
    ('overall_weight_assessments', '40'),
    ('overall_weight_attendance', '20')
ON DUPLICATE KEY UPDATE setting_value = setting_value;
