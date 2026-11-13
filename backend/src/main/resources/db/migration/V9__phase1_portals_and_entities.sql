-- ==============================================================================
-- Migration V9: Phase 1 Portals (Administrator & Participant) Normalized Schema
-- Covers all 30 core entities for Phase 1 Youth Empowerment Platform (YEP)
-- Compatible with MySQL 8.0+ / MariaDB 10.11+
-- ==============================================================================

-- 1. Roles & Permissions (RBAC)
CREATE TABLE IF NOT EXISTS roles (
    id          CHAR(36)     NOT NULL,
    name        VARCHAR(40)  NOT NULL,
    description VARCHAR(255) NOT NULL,
    is_system   BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_roles_name (name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS permissions (
    id          CHAR(36)     NOT NULL,
    code        VARCHAR(80)  NOT NULL,
    description VARCHAR(255) NOT NULL,
    category    VARCHAR(60)  NOT NULL,
    created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_permissions_code (code)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id       CHAR(36) NOT NULL,
    permission_id CHAR(36) NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 2. Participant Profiles (Extended Ugandan & East African Demographics)
CREATE TABLE IF NOT EXISTS participant_profiles (
    id                 CHAR(36)     NOT NULL,
    user_id            CHAR(36)     NOT NULL,
    education_level    VARCHAR(80)  NULL,
    field_of_study     VARCHAR(120) NULL,
    institution        VARCHAR(160) NULL,
    date_of_birth      DATE         NULL,
    gender             VARCHAR(32)  NULL,
    district           VARCHAR(80)  NULL,
    disability_status  VARCHAR(40)  NULL,
    employment_status  VARCHAR(60)  NULL,
    national_id        VARCHAR(64)  NULL,
    linkedin_url       VARCHAR(255) NULL,
    github_url         VARCHAR(255) NULL,
    portfolio_url      VARCHAR(255) NULL,
    emergency_contact  VARCHAR(160) NULL,
    created_at         DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at         DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_participant_profiles_user (user_id),
    CONSTRAINT fk_participant_profiles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 3. Programme Categories
CREATE TABLE IF NOT EXISTS programme_categories (
    id            CHAR(36)     NOT NULL,
    name          VARCHAR(80)  NOT NULL,
    slug          VARCHAR(80)  NOT NULL,
    description   VARCHAR(500) NOT NULL,
    icon          VARCHAR(40)  NOT NULL DEFAULT 'BookOpen',
    display_order INT          NOT NULL DEFAULT 0,
    created_at    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_programme_categories_slug (slug)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 4. Virtual Exchange Levels
CREATE TABLE IF NOT EXISTS virtual_exchange_levels (
    id                    CHAR(36)     NOT NULL,
    level_number          INT          NOT NULL,
    name                  VARCHAR(80)  NOT NULL,
    description           VARCHAR(500) NOT NULL,
    min_points_required   INT          NOT NULL DEFAULT 0,
    is_unlocked_by_default BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at            DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at            DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_ve_levels_number (level_number)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 5. Learning Materials
CREATE TABLE IF NOT EXISTS learning_materials (
    id            CHAR(36)      NOT NULL,
    module_id     CHAR(36)      NOT NULL,
    title         VARCHAR(160)  NOT NULL,
    material_type VARCHAR(32)   NOT NULL, -- PDF, VIDEO, SLIDE, CODE, AUDIO
    file_url      VARCHAR(500)  NULL,
    external_url  VARCHAR(500)  NULL,
    file_size     VARCHAR(32)   NULL,
    summary       VARCHAR(500)  NULL,
    position      INT           NOT NULL DEFAULT 0,
    created_at    DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at    DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_materials_module (module_id, position),
    CONSTRAINT fk_materials_module FOREIGN KEY (module_id) REFERENCES learning_modules (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 6. Attendance Records
CREATE TABLE IF NOT EXISTS attendance_records (
    id            CHAR(36)     NOT NULL,
    session_id    CHAR(36)     NOT NULL,
    user_id       CHAR(36)     NOT NULL,
    status        VARCHAR(24)  NOT NULL DEFAULT 'present', -- present, absent, excused, late
    joined_at     DATETIME(6)  NULL,
    left_at       DATETIME(6)  NULL,
    duration_mins INT          NOT NULL DEFAULT 0,
    notes         VARCHAR(500) NULL,
    created_at    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_attendance_session_user (session_id, user_id),
    KEY idx_attendance_user (user_id),
    CONSTRAINT fk_attendance_session FOREIGN KEY (session_id) REFERENCES exchange_sessions (id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 7. Discussions & Messages
CREATE TABLE IF NOT EXISTS discussions (
    id           CHAR(36)      NOT NULL,
    programme_id CHAR(36)      NOT NULL,
    module_id    CHAR(36)      NULL,
    title        VARCHAR(160)  NOT NULL,
    topic        TEXT          NOT NULL,
    author_id    CHAR(36)      NOT NULL,
    is_pinned    BOOLEAN       NOT NULL DEFAULT FALSE,
    is_locked    BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at   DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at   DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_discussions_programme (programme_id, created_at),
    CONSTRAINT fk_discussions_programme FOREIGN KEY (programme_id) REFERENCES programmes (id) ON DELETE CASCADE,
    CONSTRAINT fk_discussions_author FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS discussion_messages (
    id            CHAR(36)      NOT NULL,
    discussion_id CHAR(36)      NOT NULL,
    author_id     CHAR(36)      NOT NULL,
    parent_id     CHAR(36)      NULL,
    message       TEXT          NOT NULL,
    created_at    DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at    DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_discussion_messages (discussion_id, created_at),
    CONSTRAINT fk_messages_discussion FOREIGN KEY (discussion_id) REFERENCES discussions (id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_author FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_parent FOREIGN KEY (parent_id) REFERENCES discussion_messages (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 8. Assignments & Submissions
CREATE TABLE IF NOT EXISTS assignments (
    id           CHAR(36)      NOT NULL,
    programme_id CHAR(36)      NOT NULL,
    module_id    CHAR(36)      NULL,
    title        VARCHAR(160)  NOT NULL,
    description  TEXT          NOT NULL,
    instructions TEXT          NULL,
    max_points   INT           NOT NULL DEFAULT 100,
    due_at       DATETIME(6)   NOT NULL,
    status       VARCHAR(20)   NOT NULL DEFAULT 'published',
    created_at   DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at   DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_assignments_programme (programme_id, due_at),
    CONSTRAINT fk_assignments_programme FOREIGN KEY (programme_id) REFERENCES programmes (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS assignment_submissions (
    id              CHAR(36)      NOT NULL,
    assignment_id   CHAR(36)      NOT NULL,
    user_id         CHAR(36)      NOT NULL,
    submission_text TEXT          NOT NULL,
    attachment_url  VARCHAR(500)  NULL,
    status          VARCHAR(20)   NOT NULL DEFAULT 'submitted', -- submitted, under_review, graded, resubmit_requested
    points_awarded  INT           NULL,
    feedback        VARCHAR(2000) NULL,
    graded_by       CHAR(36)      NULL,
    graded_at       DATETIME(6)   NULL,
    created_at      DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_assignment_user (assignment_id, user_id),
    KEY idx_submissions_user (user_id),
    CONSTRAINT fk_asub_assignment FOREIGN KEY (assignment_id) REFERENCES assignments (id) ON DELETE CASCADE,
    CONSTRAINT fk_asub_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_asub_grader FOREIGN KEY (graded_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 9. Assessment Questions & Results
CREATE TABLE IF NOT EXISTS assessment_questions (
    id             CHAR(36)      NOT NULL,
    assessment_id  CHAR(36)      NOT NULL,
    question_text  TEXT          NOT NULL,
    question_type  VARCHAR(24)   NOT NULL DEFAULT 'multiple_choice', -- multiple_choice, open_text, boolean
    options_json   TEXT          NULL,
    correct_answer VARCHAR(500)  NULL,
    points         INT           NOT NULL DEFAULT 10,
    position       INT           NOT NULL DEFAULT 0,
    created_at     DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at     DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_assessment_questions (assessment_id, position),
    CONSTRAINT fk_questions_assessment FOREIGN KEY (assessment_id) REFERENCES assessments (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS assessment_results (
    id                   CHAR(36)    NOT NULL,
    attempt_id           CHAR(36)    NOT NULL,
    assessment_id        CHAR(36)    NOT NULL,
    user_id              CHAR(36)    NOT NULL,
    total_points         INT         NOT NULL DEFAULT 0,
    score_percentage     INT         NOT NULL DEFAULT 0,
    passed               BOOLEAN     NOT NULL DEFAULT FALSE,
    certificate_eligible BOOLEAN     NOT NULL DEFAULT FALSE,
    published_at         DATETIME(6) NULL,
    created_at           DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at           DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_results_attempt (attempt_id),
    KEY idx_results_user (user_id),
    KEY idx_results_assessment (assessment_id),
    CONSTRAINT fk_results_attempt FOREIGN KEY (attempt_id) REFERENCES assessment_attempts (id) ON DELETE CASCADE,
    CONSTRAINT fk_results_assessment FOREIGN KEY (assessment_id) REFERENCES assessments (id) ON DELETE CASCADE,
    CONSTRAINT fk_results_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 10. System Announcements
CREATE TABLE IF NOT EXISTS announcements (
    id           CHAR(36)      NOT NULL,
    title        VARCHAR(160)  NOT NULL,
    content      TEXT          NOT NULL,
    target_role  VARCHAR(32)   NOT NULL DEFAULT 'all', -- all, participant, admin
    programme_id CHAR(36)      NULL,
    priority     VARCHAR(20)   NOT NULL DEFAULT 'normal', -- normal, important, critical
    published_at DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    expires_at   DATETIME(6)   NULL,
    created_by   CHAR(36)      NOT NULL,
    created_at   DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at   DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_announcements_published (published_at),
    CONSTRAINT fk_announcements_author FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 11. Compatibility Views for Alternate Spec Identifiers
CREATE OR REPLACE VIEW programme_enrolments AS SELECT * FROM enrolments;
CREATE OR REPLACE VIEW impact_projects AS SELECT * FROM projects;
CREATE OR REPLACE VIEW project_milestones AS SELECT * FROM milestones;
CREATE OR REPLACE VIEW project_deliverables AS SELECT * FROM submissions;
