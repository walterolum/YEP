-- =============================================================================
-- YEP – Youth Empowerment Management System
-- V1: complete schema (MySQL 8, InnoDB, utf8mb4)
-- =============================================================================

CREATE TABLE users (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    full_name       VARCHAR(120) NOT NULL,
    email           VARCHAR(190) NOT NULL,
    phone           VARCHAR(40)  NULL,
    password_hash   VARCHAR(100) NOT NULL,
    role            VARCHAR(20)  NOT NULL,
    status          VARCHAR(20)  NOT NULL,
    country         VARCHAR(80)  NULL,
    district        VARCHAR(80)  NULL,
    date_of_birth   DATE         NULL,
    institution     VARCHAR(160) NULL,
    field_of_study  VARCHAR(120) NULL,
    requested_level VARCHAR(20)  NULL,
    avatar          VARCHAR(8)   NULL,
    last_login_at   DATETIME(6)  NULL,
    created_at      DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email (email),
    KEY idx_users_role (role),
    KEY idx_users_status (status)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE user_skills (
    id      BIGINT      NOT NULL AUTO_INCREMENT,
    user_id BIGINT      NOT NULL,
    name    VARCHAR(80) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_user_skills_user (user_id),
    CONSTRAINT fk_user_skills_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE programmes (
    id                    BIGINT       NOT NULL AUTO_INCREMENT,
    title                 VARCHAR(160) NOT NULL,
    category              VARCHAR(80)  NOT NULL,
    icon                  VARCHAR(16)  NULL,
    capacity              INT          NOT NULL,
    registration_deadline DATETIME(6)  NOT NULL,
    eligibility_text      VARCHAR(1000) NULL,
    published             BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at            DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at            DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_programmes_published (published)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE applications (
    id           BIGINT      NOT NULL AUTO_INCREMENT,
    programme_id BIGINT      NOT NULL,
    user_id      BIGINT      NOT NULL,
    status       VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at   DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at   DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_applications_programme_user (programme_id, user_id),
    KEY idx_applications_user (user_id),
    CONSTRAINT fk_applications_programme FOREIGN KEY (programme_id) REFERENCES programmes (id) ON DELETE CASCADE,
    CONSTRAINT fk_applications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE modules (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    name       VARCHAR(120) NOT NULL,
    icon       VARCHAR(16)  NULL,
    sort_order INT          NOT NULL,
    level      INT          NOT NULL DEFAULT 1,
    created_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE lessons (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    module_id  BIGINT       NOT NULL,
    title      VARCHAR(160) NOT NULL,
    type       VARCHAR(20)  NOT NULL,
    sort_order INT          NOT NULL,
    created_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_lessons_module (module_id),
    CONSTRAINT fk_lessons_module FOREIGN KEY (module_id) REFERENCES modules (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE lesson_progress (
    id           BIGINT      NOT NULL AUTO_INCREMENT,
    user_id      BIGINT      NOT NULL,
    lesson_id    BIGINT      NOT NULL,
    completed_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    created_at   DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at   DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_lesson_progress_user_lesson (user_id, lesson_id),
    KEY idx_lesson_progress_lesson (lesson_id),
    CONSTRAINT fk_lesson_progress_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_lesson_progress_lesson FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE materials (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    module_id  BIGINT       NULL,
    title      VARCHAR(160) NOT NULL,
    type       VARCHAR(20)  NOT NULL,
    url        VARCHAR(500) NOT NULL,
    created_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_materials_module (module_id),
    CONSTRAINT fk_materials_module FOREIGN KEY (module_id) REFERENCES modules (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE discussion_threads (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    title      VARCHAR(160) NOT NULL,
    created_by BIGINT       NOT NULL,
    created_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_discussion_threads_user FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE discussion_posts (
    id         BIGINT      NOT NULL AUTO_INCREMENT,
    thread_id  BIGINT      NOT NULL,
    user_id    BIGINT      NOT NULL,
    body       TEXT        NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_discussion_posts_thread (thread_id),
    CONSTRAINT fk_discussion_posts_thread FOREIGN KEY (thread_id) REFERENCES discussion_threads (id) ON DELETE CASCADE,
    CONSTRAINT fk_discussion_posts_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE projects (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    title       VARCHAR(160) NOT NULL,
    category    VARCHAR(40)  NOT NULL,
    description VARCHAR(2000) NULL,
    status      VARCHAR(20)  NOT NULL DEFAULT 'PROPOSED',
    created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_projects_status (status)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE teams (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    name           VARCHAR(120) NOT NULL,
    project_id     BIGINT       NULL,
    lead_user_id   BIGINT       NOT NULL,
    mentor_id      BIGINT       NULL,
    facilitator_id BIGINT       NULL,
    cohort         VARCHAR(80)  NULL,
    created_at     DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at     DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_teams_project (project_id),
    CONSTRAINT fk_teams_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE SET NULL,
    CONSTRAINT fk_teams_lead FOREIGN KEY (lead_user_id) REFERENCES users (id),
    CONSTRAINT fk_teams_mentor FOREIGN KEY (mentor_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_teams_facilitator FOREIGN KEY (facilitator_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE team_members (
    team_id    BIGINT      NOT NULL,
    user_id    BIGINT      NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (team_id, user_id),
    KEY idx_team_members_user (user_id),
    CONSTRAINT fk_team_members_team FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
    CONSTRAINT fk_team_members_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE milestones (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    project_id   BIGINT       NOT NULL,
    title        VARCHAR(160) NOT NULL,
    sort_order   INT          NOT NULL,
    completed    BOOLEAN      NOT NULL DEFAULT FALSE,
    completed_at DATETIME(6)  NULL,
    created_at   DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at   DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_milestones_project (project_id),
    CONSTRAINT fk_milestones_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE deliverables (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    project_id  BIGINT       NOT NULL,
    uploaded_by BIGINT       NOT NULL,
    file_name   VARCHAR(200) NOT NULL,
    file_path   VARCHAR(400) NOT NULL,
    status      VARCHAR(20)  NOT NULL DEFAULT 'REVIEW',
    created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_deliverables_project (project_id),
    CONSTRAINT fk_deliverables_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
    CONSTRAINT fk_deliverables_user FOREIGN KEY (uploaded_by) REFERENCES users (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE assessments (
    id                BIGINT       NOT NULL AUTO_INCREMENT,
    module_id         BIGINT       NOT NULL,
    title             VARCHAR(160) NOT NULL,
    due_date          DATETIME(6)  NOT NULL,
    total_marks       INT          NOT NULL,
    published         BOOLEAN      NOT NULL DEFAULT FALSE,
    results_published BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at        DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at        DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_assessments_module (module_id),
    CONSTRAINT fk_assessments_module FOREIGN KEY (module_id) REFERENCES modules (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE questions (
    id             BIGINT        NOT NULL AUTO_INCREMENT,
    assessment_id  BIGINT        NOT NULL,
    prompt         VARCHAR(500)  NOT NULL,
    option_a       VARCHAR(300)  NOT NULL,
    option_b       VARCHAR(300)  NOT NULL,
    option_c       VARCHAR(300)  NULL,
    option_d       VARCHAR(300)  NULL,
    correct_option CHAR(1)       NOT NULL,
    sort_order     INT           NOT NULL DEFAULT 0,
    created_at     DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at     DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_questions_assessment (assessment_id),
    CONSTRAINT fk_questions_assessment FOREIGN KEY (assessment_id) REFERENCES assessments (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE submissions (
    id            BIGINT      NOT NULL AUTO_INCREMENT,
    assessment_id BIGINT      NOT NULL,
    user_id       BIGINT      NOT NULL,
    score         INT         NULL,
    graded_by     BIGINT      NULL,
    submitted_at  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    created_at    DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at    DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_submissions_assessment_user (assessment_id, user_id),
    KEY idx_submissions_user (user_id),
    CONSTRAINT fk_submissions_assessment FOREIGN KEY (assessment_id) REFERENCES assessments (id) ON DELETE CASCADE,
    CONSTRAINT fk_submissions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_submissions_grader FOREIGN KEY (graded_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE submission_answers (
    id            BIGINT      NOT NULL AUTO_INCREMENT,
    submission_id BIGINT      NOT NULL,
    question_id   BIGINT      NOT NULL,
    chosen_option CHAR(1)     NOT NULL,
    created_at    DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at    DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_submission_answers (submission_id, question_id),
    CONSTRAINT fk_submission_answers_submission FOREIGN KEY (submission_id) REFERENCES submissions (id) ON DELETE CASCADE,
    CONSTRAINT fk_submission_answers_question FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE sessions (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    title        VARCHAR(160) NOT NULL,
    type         VARCHAR(20)  NOT NULL,
    starts_at    DATETIME(6)  NOT NULL,
    cohort       VARCHAR(80)  NULL,
    programme_id BIGINT       NULL,
    created_by   BIGINT       NOT NULL,
    meeting_link VARCHAR(400) NULL,
    created_at   DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at   DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_sessions_starts (starts_at),
    CONSTRAINT fk_sessions_programme FOREIGN KEY (programme_id) REFERENCES programmes (id) ON DELETE SET NULL,
    CONSTRAINT fk_sessions_creator FOREIGN KEY (created_by) REFERENCES users (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE session_registrations (
    session_id BIGINT      NOT NULL,
    user_id    BIGINT      NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (session_id, user_id),
    KEY idx_session_registrations_user (user_id),
    CONSTRAINT fk_session_registrations_session FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE,
    CONSTRAINT fk_session_registrations_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE attendance (
    id         BIGINT      NOT NULL AUTO_INCREMENT,
    session_id BIGINT      NOT NULL,
    user_id    BIGINT      NOT NULL,
    present    BOOLEAN     NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_attendance_session_user (session_id, user_id),
    KEY idx_attendance_user (user_id),
    CONSTRAINT fk_attendance_session FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE mentorships (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    mentor_id        BIGINT       NOT NULL,
    mentee_id        BIGINT       NOT NULL,
    goal             VARCHAR(500) NULL,
    progress_percent INT          NOT NULL DEFAULT 0,
    status           VARCHAR(20)  NOT NULL DEFAULT 'REQUESTED',
    request_note     VARCHAR(1000) NULL,
    created_at       DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at       DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_mentorships_pair (mentor_id, mentee_id),
    KEY idx_mentorships_mentee (mentee_id),
    CONSTRAINT fk_mentorships_mentor FOREIGN KEY (mentor_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_mentorships_mentee FOREIGN KEY (mentee_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE mentor_sessions (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    mentorship_id BIGINT       NOT NULL,
    title         VARCHAR(160) NOT NULL,
    starts_at     DATETIME(6)  NOT NULL,
    status        VARCHAR(20)  NOT NULL DEFAULT 'SCHEDULED',
    created_at    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_mentor_sessions_mentorship (mentorship_id),
    CONSTRAINT fk_mentor_sessions_mentorship FOREIGN KEY (mentorship_id) REFERENCES mentorships (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE resources (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    owner_id   BIGINT       NOT NULL,
    title      VARCHAR(160) NOT NULL,
    type       VARCHAR(20)  NOT NULL,
    url        VARCHAR(500) NOT NULL,
    created_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_resources_owner (owner_id),
    CONSTRAINT fk_resources_owner FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE pledges (
    id                 BIGINT        NOT NULL AUTO_INCREMENT,
    sponsor_id         BIGINT        NOT NULL,
    project_id         BIGINT        NULL,
    project_title      VARCHAR(160)  NULL,
    amount_ugx         DECIMAL(15,2) NOT NULL,
    status             VARCHAR(20)   NOT NULL DEFAULT 'PLEDGED',
    pledged_at         DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    created_at         DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at         DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_pledges_sponsor (sponsor_id),
    CONSTRAINT fk_pledges_sponsor FOREIGN KEY (sponsor_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_pledges_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE partners (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    name       VARCHAR(160) NOT NULL,
    type       VARCHAR(20)  NOT NULL,
    icon       VARCHAR(16)  NULL,
    active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE certificates (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    code             VARCHAR(40)  NOT NULL,
    user_id          BIGINT       NOT NULL,
    programme_label  VARCHAR(160) NOT NULL,
    issued_by        BIGINT       NOT NULL,
    issued_at        DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    created_at       DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at       DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_certificates_code (code),
    UNIQUE KEY uk_certificates_user (user_id),
    CONSTRAINT fk_certificates_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_certificates_issuer FOREIGN KEY (issued_by) REFERENCES users (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE message_threads (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    kind           VARCHAR(24)  NOT NULL,
    title          VARCHAR(160) NOT NULL,
    team_id        BIGINT       NULL,
    from_user_id   BIGINT       NULL,
    target_user_id BIGINT       NULL,
    created_at     DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at     DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_message_threads_kind (kind),
    CONSTRAINT fk_threads_team FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
    CONSTRAINT fk_threads_from FOREIGN KEY (from_user_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_threads_target FOREIGN KEY (target_user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE thread_members (
    thread_id  BIGINT      NOT NULL,
    user_id    BIGINT      NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (thread_id, user_id),
    CONSTRAINT fk_thread_members_thread FOREIGN KEY (thread_id) REFERENCES message_threads (id) ON DELETE CASCADE,
    CONSTRAINT fk_thread_members_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE messages (
    id         BIGINT      NOT NULL AUTO_INCREMENT,
    thread_id  BIGINT      NOT NULL,
    sender_id  BIGINT      NOT NULL,
    body       TEXT        NOT NULL,
    sent_at    DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_messages_thread (thread_id, sent_at),
    CONSTRAINT fk_messages_thread FOREIGN KEY (thread_id) REFERENCES message_threads (id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE notifications (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    user_id    BIGINT       NOT NULL,
    category   VARCHAR(40)  NOT NULL,
    message    VARCHAR(500) NOT NULL,
    read_at    DATETIME(6)  NULL,
    created_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_notifications_user (user_id, read_at),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE audit_log (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    actor_id    BIGINT       NULL,
    action      VARCHAR(80)  NOT NULL,
    target_type VARCHAR(40)  NULL,
    target_id   VARCHAR(64)  NULL,
    details     VARCHAR(1000) NULL,
    created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_audit_created (created_at),
    CONSTRAINT fk_audit_actor FOREIGN KEY (actor_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE settings (
    setting_key   VARCHAR(80)  NOT NULL,
    setting_value VARCHAR(255) NULL,
    updated_at    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (setting_key)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE role_permissions (
    role       VARCHAR(20) NOT NULL,
    permission VARCHAR(40) NOT NULL,
    allowed    BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (role, permission)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
