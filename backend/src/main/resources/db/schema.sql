-- =============================================================================
-- YouthEmpowermentProject (YEP) — complete MySQL schema
-- Generated from the Flyway migrations V1..V11 so a fresh database can be
-- created without running the application. Target: MySQL 8.0+ / MariaDB 10.11+.
-- Import: mysql -u root -p < schema.sql
-- =============================================================================

-- YouthRise core identity and governance schema.
-- MySQL 8.0+ / MariaDB 10.11+ compatible.

CREATE TABLE users (
    id                 CHAR(36)     NOT NULL,
    full_name          VARCHAR(160) NOT NULL,
    email              VARCHAR(320) NOT NULL,
    phone              VARCHAR(32)  NULL,
    country            VARCHAR(80)  NOT NULL,
    organization       VARCHAR(160) NULL,
    job_title          VARCHAR(120) NULL,
    bio                VARCHAR(2000) NULL,
    initials           VARCHAR(4)   NOT NULL,
    role               VARCHAR(24)  NOT NULL,
    status             VARCHAR(24)  NOT NULL,
    profile_complete   INT          NOT NULL DEFAULT 0,
    timezone           VARCHAR(64)  NOT NULL,
    visibility         VARCHAR(16)  NOT NULL,
    contact_permission BOOLEAN      NOT NULL DEFAULT FALSE,
    email_verified_at  DATETIME(6)  NULL,
    password_hash      VARCHAR(100) NULL,
    joined_at          DATETIME(6)  NOT NULL,
    last_login_at      DATETIME(6)  NULL,
    created_at         DATETIME(6)  NOT NULL,
    updated_at         DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email (email),
    KEY idx_users_role (role),
    KEY idx_users_status (status)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE user_interests (
    user_id  CHAR(36)    NOT NULL,
    interest VARCHAR(60) NOT NULL,
    PRIMARY KEY (user_id, interest),
    CONSTRAINT fk_user_interests_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE user_skills (
    user_id CHAR(36)    NOT NULL,
    skill   VARCHAR(60) NOT NULL,
    PRIMARY KEY (user_id, skill),
    CONSTRAINT fk_user_skills_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE consents (
    id             CHAR(36)    NOT NULL,
    user_id        CHAR(36)    NOT NULL,
    type           VARCHAR(32) NOT NULL,
    granted        BOOLEAN     NOT NULL,
    policy_version VARCHAR(32) NOT NULL,
    recorded_at    DATETIME(6) NOT NULL,
    created_at     DATETIME(6) NOT NULL,
    updated_at     DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_consents_user_type (user_id, type),
    CONSTRAINT fk_consents_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE auth_tokens (
    id         CHAR(36)    NOT NULL,
    user_id    CHAR(36)    NOT NULL,
    purpose    VARCHAR(32) NOT NULL,
    token_hash CHAR(64)    NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    used_at    DATETIME(6) NULL,
    attempts   INT         NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_auth_tokens_hash (token_hash),
    KEY idx_auth_tokens_user (user_id, purpose),
    CONSTRAINT fk_auth_tokens_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE audit_logs (
    id          CHAR(36)     NOT NULL,
    actor_id    CHAR(36)     NULL,
    actor_email VARCHAR(320) NULL,
    actor_role  VARCHAR(24)  NULL,
    action      VARCHAR(80)  NOT NULL,
    target      VARCHAR(160) NULL,
    outcome     VARCHAR(16)  NOT NULL,
    metadata    TEXT         NULL,
    ip_address  VARCHAR(64)  NULL,
    created_at  DATETIME(6)  NOT NULL,
    updated_at  DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    KEY idx_audit_created (created_at),
    KEY idx_audit_actor (actor_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Spring Session JDBC tables (single-node and clustered session storage).
-- Column definitions follow the schema shipped with Spring Session 4.x.

CREATE TABLE SPRING_SESSION (
    PRIMARY_ID            CHAR(36) NOT NULL,
    SESSION_ID            CHAR(36) NOT NULL,
    CREATION_TIME         BIGINT   NOT NULL,
    LAST_ACCESS_TIME      BIGINT   NOT NULL,
    MAX_INACTIVE_INTERVAL INT      NOT NULL,
    EXPIRY_TIME           BIGINT   NOT NULL,
    PRINCIPAL_NAME        VARCHAR(100) NULL,
    CONSTRAINT SPRING_SESSION_PK PRIMARY KEY (PRIMARY_ID)
) ENGINE = InnoDB ROW_FORMAT = DYNAMIC;

CREATE UNIQUE INDEX SPRING_SESSION_IX1 ON SPRING_SESSION (SESSION_ID);
CREATE INDEX SPRING_SESSION_IX2 ON SPRING_SESSION (EXPIRY_TIME);
CREATE INDEX SPRING_SESSION_IX3 ON SPRING_SESSION (PRINCIPAL_NAME);

CREATE TABLE SPRING_SESSION_ATTRIBUTES (
    SESSION_PRIMARY_ID CHAR(36)     NOT NULL,
    ATTRIBUTE_NAME     VARCHAR(200) NOT NULL,
    ATTRIBUTE_BYTES    BLOB         NOT NULL,
    CONSTRAINT SPRING_SESSION_ATTRIBUTES_PK PRIMARY KEY (SESSION_PRIMARY_ID, ATTRIBUTE_NAME),
    CONSTRAINT SPRING_SESSION_ATTRIBUTES_FK FOREIGN KEY (SESSION_PRIMARY_ID)
        REFERENCES SPRING_SESSION (PRIMARY_ID) ON DELETE CASCADE
) ENGINE = InnoDB ROW_FORMAT = DYNAMIC;
-- Programme catalogue, enrolment and learning progress.

CREATE TABLE programmes (
    id             CHAR(36)     NOT NULL,
    title          VARCHAR(160) NOT NULL,
    summary        VARCHAR(400) NOT NULL,
    description    TEXT         NOT NULL,
    level          INT          NOT NULL,
    theme          VARCHAR(80)  NOT NULL,
    duration_weeks INT          NOT NULL,
    commitment     VARCHAR(80)  NOT NULL,
    mode           VARCHAR(80)  NOT NULL,
    capacity       INT          NOT NULL,
    status         VARCHAR(16)  NOT NULL,
    starts_at      DATETIME(6)  NOT NULL,
    ends_at        DATETIME(6)  NOT NULL,
    cohort         VARCHAR(80)  NOT NULL,
    facilitator_id CHAR(36)     NOT NULL,
    created_at     DATETIME(6)  NOT NULL,
    updated_at     DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    KEY idx_programmes_status (status, starts_at),
    KEY idx_programmes_facilitator (facilitator_id),
    CONSTRAINT fk_programmes_facilitator FOREIGN KEY (facilitator_id) REFERENCES users (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE programme_eligibility (
    programme_id CHAR(36)     NOT NULL,
    position     INT          NOT NULL,
    value        VARCHAR(500) NOT NULL,
    PRIMARY KEY (programme_id, position),
    CONSTRAINT fk_programme_eligibility FOREIGN KEY (programme_id) REFERENCES programmes (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE programme_outcomes (
    programme_id CHAR(36)     NOT NULL,
    position     INT          NOT NULL,
    value        VARCHAR(500) NOT NULL,
    PRIMARY KEY (programme_id, position),
    CONSTRAINT fk_programme_outcomes FOREIGN KEY (programme_id) REFERENCES programmes (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE programme_skills (
    programme_id CHAR(36)    NOT NULL,
    position     INT         NOT NULL,
    value        VARCHAR(80) NOT NULL,
    PRIMARY KEY (programme_id, position),
    CONSTRAINT fk_programme_skills FOREIGN KEY (programme_id) REFERENCES programmes (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE enrolments (
    id             CHAR(36)    NOT NULL,
    programme_id   CHAR(36)    NOT NULL,
    user_id        CHAR(36)    NOT NULL,
    status         VARCHAR(16) NOT NULL,
    progress       INT         NOT NULL DEFAULT 0,
    last_lesson_id CHAR(36)    NULL,
    enrolled_at    DATETIME(6) NOT NULL,
    completed_at   DATETIME(6) NULL,
    created_at     DATETIME(6) NOT NULL,
    updated_at     DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_enrolments_programme_user (programme_id, user_id),
    KEY idx_enrolments_user (user_id, status),
    KEY idx_enrolments_programme_status (programme_id, status),
    CONSTRAINT fk_enrolments_programme FOREIGN KEY (programme_id) REFERENCES programmes (id),
    CONSTRAINT fk_enrolments_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE learning_modules (
    id            CHAR(36)     NOT NULL,
    programme_id  CHAR(36)     NOT NULL,
    title         VARCHAR(160) NOT NULL,
    summary       VARCHAR(500) NOT NULL,
    position      INT          NOT NULL,
    status        VARCHAR(16)  NOT NULL,
    duration_mins INT          NOT NULL,
    created_at    DATETIME(6)  NOT NULL,
    updated_at    DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    KEY idx_modules_programme (programme_id, position),
    CONSTRAINT fk_modules_programme FOREIGN KEY (programme_id) REFERENCES programmes (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE lessons (
    id             CHAR(36)     NOT NULL,
    module_id      CHAR(36)     NOT NULL,
    title          VARCHAR(160) NOT NULL,
    lesson_type    VARCHAR(16)  NOT NULL,
    duration_mins  INT          NOT NULL,
    summary        VARCHAR(500) NOT NULL,
    position       INT          NOT NULL,
    resource_label VARCHAR(160) NULL,
    resource_size  VARCHAR(32)  NULL,
    created_at     DATETIME(6)  NOT NULL,
    updated_at     DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    KEY idx_lessons_module (module_id, position),
    CONSTRAINT fk_lessons_module FOREIGN KEY (module_id) REFERENCES learning_modules (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE lesson_body (
    lesson_id CHAR(36)      NOT NULL,
    position  INT           NOT NULL,
    paragraph VARCHAR(4000) NOT NULL,
    PRIMARY KEY (lesson_id, position),
    CONSTRAINT fk_lesson_body_lesson FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE lesson_completions (
    id           CHAR(36)    NOT NULL,
    user_id      CHAR(36)    NOT NULL,
    lesson_id    CHAR(36)    NOT NULL,
    programme_id CHAR(36)    NOT NULL,
    completed_at DATETIME(6) NOT NULL,
    created_at   DATETIME(6) NOT NULL,
    updated_at   DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_completions_user_lesson (user_id, lesson_id),
    KEY idx_completions_user_programme (user_id, programme_id),
    CONSTRAINT fk_completions_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_completions_lesson FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE CASCADE,
    CONSTRAINT fk_completions_programme FOREIGN KEY (programme_id) REFERENCES programmes (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Virtual exchange sessions and in-app notifications.

CREATE TABLE exchange_sessions (
    id             CHAR(36)     NOT NULL,
    programme_id   CHAR(36)     NOT NULL,
    title          VARCHAR(160) NOT NULL,
    starts_at      DATETIME(6)  NOT NULL,
    duration_mins  INT          NOT NULL,
    timezone       VARCHAR(64)  NOT NULL,
    facilitator_id CHAR(36)     NOT NULL,
    capacity       INT          NOT NULL,
    description    TEXT         NOT NULL,
    meeting_url    VARCHAR(500) NULL,
    status         VARCHAR(16)  NOT NULL,
    created_at     DATETIME(6)  NOT NULL,
    updated_at     DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    KEY idx_sessions_starts (starts_at),
    KEY idx_sessions_programme (programme_id),
    CONSTRAINT fk_sessions_programme FOREIGN KEY (programme_id) REFERENCES programmes (id) ON DELETE CASCADE,
    CONSTRAINT fk_sessions_facilitator FOREIGN KEY (facilitator_id) REFERENCES users (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE session_registrations (
    id            CHAR(36)    NOT NULL,
    session_id    CHAR(36)    NOT NULL,
    user_id       CHAR(36)    NOT NULL,
    registered_at DATETIME(6) NOT NULL,
    created_at    DATETIME(6) NOT NULL,
    updated_at    DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_session_registrations_session_user (session_id, user_id),
    KEY idx_session_registrations_user (user_id),
    CONSTRAINT fk_registrations_session FOREIGN KEY (session_id) REFERENCES exchange_sessions (id) ON DELETE CASCADE,
    CONSTRAINT fk_registrations_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE notifications (
    id         CHAR(36)      NOT NULL,
    user_id    CHAR(36)      NOT NULL,
    title      VARCHAR(160)  NOT NULL,
    body       VARCHAR(1000) NOT NULL,
    href       VARCHAR(300)  NULL,
    kind       VARCHAR(20)   NOT NULL,
    read_at    DATETIME(6)   NULL,
    created_at DATETIME(6)   NOT NULL,
    updated_at DATETIME(6)   NOT NULL,
    PRIMARY KEY (id),
    KEY idx_notifications_user_created (user_id, created_at),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Teams, projects, milestones, evidence submissions and mentor feedback.

CREATE TABLE teams (
    id           CHAR(36)     NOT NULL,
    programme_id CHAR(36)     NOT NULL,
    name         VARCHAR(120) NOT NULL,
    theme        VARCHAR(80)  NOT NULL,
    mentor_id    CHAR(36)     NULL,
    capacity     INT          NOT NULL DEFAULT 6,
    created_at   DATETIME(6)  NOT NULL,
    updated_at   DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_teams_programme_name (programme_id, name),
    KEY idx_teams_mentor (mentor_id),
    CONSTRAINT fk_teams_programme FOREIGN KEY (programme_id) REFERENCES programmes (id) ON DELETE CASCADE,
    CONSTRAINT fk_teams_mentor FOREIGN KEY (mentor_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE team_members (
    team_id   CHAR(36) NOT NULL,
    user_id   CHAR(36) NOT NULL,
    PRIMARY KEY (team_id, user_id),
    KEY idx_team_members_user (user_id),
    CONSTRAINT fk_team_members_team FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
    CONSTRAINT fk_team_members_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE team_messages (
    id         CHAR(36)     NOT NULL,
    team_id    CHAR(36)     NOT NULL,
    author_id  CHAR(36)     NOT NULL,
    body       VARCHAR(2000) NOT NULL,
    sent_at    DATETIME(6)  NOT NULL,
    created_at DATETIME(6)  NOT NULL,
    updated_at DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    KEY idx_team_messages_team (team_id, sent_at),
    CONSTRAINT fk_team_messages_team FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
    CONSTRAINT fk_team_messages_author FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE projects (
    id         CHAR(36)     NOT NULL,
    team_id    CHAR(36)     NOT NULL,
    title      VARCHAR(160) NOT NULL,
    problem    VARCHAR(500) NOT NULL,
    theme      VARCHAR(80)  NOT NULL,
    summary    VARCHAR(1000) NOT NULL,
    status     VARCHAR(20)  NOT NULL,
    created_at DATETIME(6)  NOT NULL,
    updated_at DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_projects_team (team_id),
    CONSTRAINT fk_projects_team FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE project_objectives (
    project_id CHAR(36)     NOT NULL,
    position   INT          NOT NULL,
    value      VARCHAR(500) NOT NULL,
    PRIMARY KEY (project_id, position),
    CONSTRAINT fk_project_objectives FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE milestones (
    id          CHAR(36)     NOT NULL,
    project_id  CHAR(36)     NOT NULL,
    title       VARCHAR(160) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    due_at      DATETIME(6)  NOT NULL,
    status      VARCHAR(20)  NOT NULL,
    evidence    VARCHAR(200) NULL,
    feedback    VARCHAR(2000) NULL,
    position    INT          NOT NULL,
    created_at  DATETIME(6)  NOT NULL,
    updated_at  DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    KEY idx_milestones_project (project_id, position),
    CONSTRAINT fk_milestones_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE project_resources (
    id         CHAR(36)     NOT NULL,
    project_id CHAR(36)     NOT NULL,
    label      VARCHAR(200) NOT NULL,
    kind       VARCHAR(40)  NOT NULL,
    added_by   VARCHAR(160) NOT NULL,
    added_at   DATETIME(6)  NOT NULL,
    created_at DATETIME(6)  NOT NULL,
    updated_at DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    KEY idx_project_resources_project (project_id, added_at),
    CONSTRAINT fk_project_resources_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE submissions (
    id                 CHAR(36)      NOT NULL,
    project_id         CHAR(36)      NOT NULL,
    team_id            CHAR(36)      NOT NULL,
    milestone_id       CHAR(36)      NOT NULL,
    title              VARCHAR(160)  NOT NULL,
    file_name          VARCHAR(255)  NOT NULL,
    stored_name        VARCHAR(255)  NOT NULL,
    content_type       VARCHAR(120)  NULL,
    size_bytes         BIGINT        NOT NULL,
    note               VARCHAR(2000) NULL,
    submitted_by       CHAR(36)      NOT NULL,
    submitted_at       DATETIME(6)   NOT NULL,
    status             VARCHAR(20)   NOT NULL,
    reviewer_id        CHAR(36)      NULL,
    score              INT           NULL,
    max_score          INT           NOT NULL DEFAULT 20,
    feedback           VARCHAR(2000) NULL,
    revision_requested VARCHAR(2000) NULL,
    created_at         DATETIME(6)   NOT NULL,
    updated_at         DATETIME(6)   NOT NULL,
    PRIMARY KEY (id),
    KEY idx_submissions_team (team_id, submitted_at),
    KEY idx_submissions_milestone (milestone_id),
    CONSTRAINT fk_submissions_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
    CONSTRAINT fk_submissions_team FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
    CONSTRAINT fk_submissions_milestone FOREIGN KEY (milestone_id) REFERENCES milestones (id) ON DELETE CASCADE,
    CONSTRAINT fk_submissions_author FOREIGN KEY (submitted_by) REFERENCES users (id),
    CONSTRAINT fk_submissions_reviewer FOREIGN KEY (reviewer_id) REFERENCES users (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE mentor_feedback (
    id           CHAR(36)      NOT NULL,
    team_id      CHAR(36)      NOT NULL,
    author_id    CHAR(36)      NOT NULL,
    milestone_id CHAR(36)      NULL,
    body         VARCHAR(2000) NOT NULL,
    resolved     BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at   DATETIME(6)   NOT NULL,
    updated_at   DATETIME(6)   NOT NULL,
    PRIMARY KEY (id),
    KEY idx_mentor_feedback_team (team_id, created_at),
    CONSTRAINT fk_mentor_feedback_team FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
    CONSTRAINT fk_mentor_feedback_author FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_mentor_feedback_milestone FOREIGN KEY (milestone_id) REFERENCES milestones (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Assessments, graded attempts and verifiable certificates.

CREATE TABLE assessments (
    id            CHAR(36)     NOT NULL,
    programme_id  CHAR(36)     NOT NULL,
    title         VARCHAR(160) NOT NULL,
    type          VARCHAR(20)  NOT NULL,
    description   VARCHAR(1000) NOT NULL,
    opens_at      DATETIME(6)  NULL,
    due_at        DATETIME(6)  NOT NULL,
    max_score     INT          NOT NULL DEFAULT 100,
    max_attempts  INT          NOT NULL DEFAULT 1,
    published     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at    DATETIME(6)  NOT NULL,
    updated_at    DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    KEY idx_assessments_programme (programme_id, due_at),
    CONSTRAINT fk_assessments_programme FOREIGN KEY (programme_id) REFERENCES programmes (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE assessment_instructions (
    assessment_id CHAR(36)      NOT NULL,
    position      INT           NOT NULL,
    value         VARCHAR(1000) NOT NULL,
    PRIMARY KEY (assessment_id, position),
    CONSTRAINT fk_assessment_instructions FOREIGN KEY (assessment_id) REFERENCES assessments (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE assessment_criteria (
    assessment_id CHAR(36)     NOT NULL,
    position      INT          NOT NULL,
    criterion_key VARCHAR(40)  NOT NULL,
    label         VARCHAR(160) NOT NULL,
    description   VARCHAR(500) NOT NULL,
    max_score     INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (assessment_id, position),
    CONSTRAINT fk_assessment_criteria FOREIGN KEY (assessment_id) REFERENCES assessments (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE assessment_attempts (
    id            CHAR(36)     NOT NULL,
    assessment_id CHAR(36)     NOT NULL,
    user_id       CHAR(36)     NOT NULL,
    attempt_no    INT          NOT NULL,
    body          MEDIUMTEXT   NOT NULL,
    submitted_at  DATETIME(6)  NOT NULL,
    status        VARCHAR(16)  NOT NULL,
    score         INT          NULL,
    feedback      VARCHAR(2000) NULL,
    grader_id     CHAR(36)     NULL,
    graded_at     DATETIME(6)  NULL,
    created_at    DATETIME(6)  NOT NULL,
    updated_at    DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_attempts_assessment_user_no (assessment_id, user_id, attempt_no),
    KEY idx_attempts_user (user_id, submitted_at),
    KEY idx_attempts_status (assessment_id, status),
    CONSTRAINT fk_attempts_assessment FOREIGN KEY (assessment_id) REFERENCES assessments (id) ON DELETE CASCADE,
    CONSTRAINT fk_attempts_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_attempts_grader FOREIGN KEY (grader_id) REFERENCES users (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE certificates (
    id                CHAR(36)     NOT NULL,
    programme_id      CHAR(36)     NOT NULL,
    participant_id    CHAR(36)     NOT NULL,
    code              VARCHAR(40)  NOT NULL,
    status            VARCHAR(16)  NOT NULL,
    issued_at         DATETIME(6)  NULL,
    revoked_at        DATETIME(6)  NULL,
    verification_note VARCHAR(500) NOT NULL,
    issued_by         CHAR(36)     NULL,
    created_at        DATETIME(6)  NOT NULL,
    updated_at        DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_certificates_code (code),
    UNIQUE KEY uk_certificates_programme_participant (programme_id, participant_id),
    KEY idx_certificates_participant (participant_id, status),
    CONSTRAINT fk_certificates_programme FOREIGN KEY (programme_id) REFERENCES programmes (id) ON DELETE CASCADE,
    CONSTRAINT fk_certificates_participant FOREIGN KEY (participant_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_certificates_issuer FOREIGN KEY (issued_by) REFERENCES users (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Governance, employer access, partner nominations and reporting support.

CREATE TABLE incidents (
    id          CHAR(36)     NOT NULL,
    reference   VARCHAR(40)  NOT NULL,
    category    VARCHAR(80)  NOT NULL,
    severity    VARCHAR(16)  NOT NULL,
    status      VARCHAR(20)  NOT NULL,
    reported_at DATETIME(6)  NOT NULL,
    reported_by CHAR(36)     NOT NULL,
    assigned_to CHAR(36)     NULL,
    summary     VARCHAR(2000) NOT NULL,
    created_at  DATETIME(6)  NOT NULL,
    updated_at  DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_incidents_reference (reference),
    KEY idx_incidents_status (status, reported_at),
    CONSTRAINT fk_incidents_reporter FOREIGN KEY (reported_by) REFERENCES users (id),
    CONSTRAINT fk_incidents_assignee FOREIGN KEY (assigned_to) REFERENCES users (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE incident_notes (
    incident_id CHAR(36)      NOT NULL,
    position    INT           NOT NULL,
    author_name VARCHAR(160)  NOT NULL,
    body        VARCHAR(2000) NOT NULL,
    noted_at    DATETIME(6)   NOT NULL,
    PRIMARY KEY (incident_id, position),
    CONSTRAINT fk_incident_notes_incident FOREIGN KEY (incident_id) REFERENCES incidents (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE incident_actions (
    incident_id CHAR(36)     NOT NULL,
    position    INT          NOT NULL,
    action      VARCHAR(500) NOT NULL,
    actor_name  VARCHAR(160) NOT NULL,
    acted_at    DATETIME(6)  NOT NULL,
    PRIMARY KEY (incident_id, position),
    CONSTRAINT fk_incident_actions_incident FOREIGN KEY (incident_id) REFERENCES incidents (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE privacy_requests (
    id           CHAR(36)      NOT NULL,
    reference    VARCHAR(40)   NOT NULL,
    requester_id CHAR(36)      NOT NULL,
    type         VARCHAR(20)   NOT NULL,
    received_at  DATETIME(6)   NOT NULL,
    status       VARCHAR(20)   NOT NULL,
    assignee_id  CHAR(36)      NULL,
    note         VARCHAR(2000) NULL,
    created_at   DATETIME(6)   NOT NULL,
    updated_at   DATETIME(6)   NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_privacy_requests_reference (reference),
    KEY idx_privacy_requests_status (status, received_at),
    CONSTRAINT fk_privacy_requests_requester FOREIGN KEY (requester_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_privacy_requests_assignee FOREIGN KEY (assignee_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE nominations (
    id            CHAR(36)     NOT NULL,
    institution   VARCHAR(160) NOT NULL,
    learner_name  VARCHAR(160) NOT NULL,
    learner_email VARCHAR(320) NOT NULL,
    programme_id  CHAR(36)     NOT NULL,
    nominated_by  CHAR(36)     NOT NULL,
    nominated_at  DATETIME(6)  NOT NULL,
    status        VARCHAR(20)  NOT NULL,
    note          VARCHAR(1000) NULL,
    created_at    DATETIME(6)  NOT NULL,
    updated_at    DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    KEY idx_nominations_status (status, nominated_at),
    KEY idx_nominations_programme (programme_id),
    CONSTRAINT fk_nominations_programme FOREIGN KEY (programme_id) REFERENCES programmes (id) ON DELETE CASCADE,
    CONSTRAINT fk_nominations_partner FOREIGN KEY (nominated_by) REFERENCES users (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE talent_profiles (
    id              CHAR(36)     NOT NULL,
    user_id         CHAR(36)     NOT NULL,
    headline        VARCHAR(160) NOT NULL,
    project_summary VARCHAR(1000) NOT NULL,
    availability    VARCHAR(20)  NOT NULL,
    created_at      DATETIME(6)  NOT NULL,
    updated_at      DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_talent_profiles_user (user_id),
    CONSTRAINT fk_talent_profiles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE talent_portfolio_items (
    profile_id CHAR(36)      NOT NULL,
    position   INT           NOT NULL,
    title      VARCHAR(160)  NOT NULL,
    theme      VARCHAR(80)   NOT NULL,
    summary    VARCHAR(1000) NOT NULL,
    PRIMARY KEY (profile_id, position),
    CONSTRAINT fk_portfolio_items_profile FOREIGN KEY (profile_id) REFERENCES talent_profiles (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE saved_talent (
    id          CHAR(36)    NOT NULL,
    employer_id CHAR(36)    NOT NULL,
    user_id     CHAR(36)    NOT NULL,
    saved_at    DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_saved_talent_employer_user (employer_id, user_id),
    CONSTRAINT fk_saved_talent_employer FOREIGN KEY (employer_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_saved_talent_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE introductions (
    id           CHAR(36)      NOT NULL,
    employer_id  CHAR(36)      NOT NULL,
    talent_id    CHAR(36)      NOT NULL,
    note         VARCHAR(1000) NOT NULL,
    requested_at DATETIME(6)   NOT NULL,
    status       VARCHAR(20)   NOT NULL,
    PRIMARY KEY (id),
    KEY idx_introductions_talent (talent_id, requested_at),
    CONSTRAINT fk_introductions_employer FOREIGN KEY (employer_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_introductions_talent FOREIGN KEY (talent_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE briefing_requests (
    id           CHAR(36)      NOT NULL,
    partner_id   CHAR(36)      NOT NULL,
    programme_id CHAR(36)      NOT NULL,
    note         VARCHAR(1000) NOT NULL,
    requested_at DATETIME(6)   NOT NULL,
    status       VARCHAR(20)   NOT NULL,
    PRIMARY KEY (id),
    KEY idx_briefing_requests_partner (partner_id, requested_at),
    CONSTRAINT fk_briefing_requests_partner FOREIGN KEY (partner_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_briefing_requests_programme FOREIGN KEY (programme_id) REFERENCES programmes (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Governance and employer tables share the standard audit timestamps in their
-- entities. Older versions of the schema omitted them on three tables, so add
-- them here rather than mutating an applied migration.

ALTER TABLE saved_talent
    ADD COLUMN created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6);

ALTER TABLE introductions
    ADD COLUMN created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6);

ALTER TABLE briefing_requests
    ADD COLUMN created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6);
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
-- ==============================================================================
-- V10: youth eligibility, team member roles and recognition badges
-- ==============================================================================

-- 18-35 eligibility is captured at registration. Existing accounts keep NULL so
-- the migration is reversible and does not invent personal data.
ALTER TABLE users
    ADD COLUMN date_of_birth DATE NULL AFTER initials;

-- Level Two teams now record the role each member plays.
ALTER TABLE team_members
    ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'MEMBER' AFTER user_id,
    ADD COLUMN joined_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) AFTER role;

-- Badges are awarded alongside certificates and are separately verifiable.
CREATE TABLE badges (
    id          CHAR(36)     NOT NULL,
    code        VARCHAR(40)  NOT NULL,
    name        VARCHAR(80)  NOT NULL,
    description VARCHAR(255) NOT NULL,
    criteria    VARCHAR(255) NOT NULL,
    created_at  DATETIME(6)  NOT NULL,
    updated_at  DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_badges_code (code)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE user_badges (
    id         CHAR(36)     NOT NULL,
    user_id    CHAR(36)     NOT NULL,
    badge_id   CHAR(36)     NOT NULL,
    awarded_at DATETIME(6)  NOT NULL,
    awarded_by CHAR(36)     NULL,
    reason     VARCHAR(255) NULL,
    created_at DATETIME(6)  NOT NULL,
    updated_at DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_user_badges_user_badge (user_id, badge_id),
    KEY idx_user_badges_user (user_id),
    CONSTRAINT fk_user_badges_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_user_badges_badge FOREIGN KEY (badge_id) REFERENCES badges (id) ON DELETE CASCADE,
    CONSTRAINT fk_user_badges_awarder FOREIGN KEY (awarded_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

INSERT INTO badges (id, code, name, description, criteria, created_at, updated_at) VALUES
    ('b1000000-0000-4000-8000-000000000001', 'FIRST_EXCHANGE', 'First Exchange',
     'Completed a Level One virtual exchange session.',
     'Attend one Level One session.', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
    ('b1000000-0000-4000-8000-000000000002', 'TEAM_PLAYER', 'Team Player',
     'Joined a Level Two Impact Project team.',
     'Become a member of a Level Two team.', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
    ('b1000000-0000-4000-8000-000000000003', 'PROGRAMME_COMPLETION', 'Programme Completed',
     'Finished every requirement of a programme and earned a certificate.',
     'A valid certificate is issued for the programme.', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6));
-- ==============================================================================
-- V11: Level One discussions, announcements and auto-scored quizzes
-- Adds the two missing communication capabilities and the question bank that
-- makes an assessment a real quiz rather than a free-text submission.
-- ==============================================================================

CREATE TABLE announcements (
    id            CHAR(36)     NOT NULL,
    title         VARCHAR(160) NOT NULL,
    body          TEXT         NOT NULL,
    audience_role VARCHAR(24)  NULL,
    programme_id  CHAR(36)     NULL,
    author_id     CHAR(36)     NOT NULL,
    published_at  DATETIME(6)  NOT NULL,
    created_at    DATETIME(6)  NOT NULL,
    updated_at    DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    KEY idx_announcements_published (published_at),
    KEY idx_announcements_role (audience_role),
    CONSTRAINT fk_announcements_programme FOREIGN KEY (programme_id) REFERENCES programmes (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_announcements_author FOREIGN KEY (author_id) REFERENCES users (id)
        ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE discussions (
    id           CHAR(36)     NOT NULL,
    programme_id CHAR(36)     NOT NULL,
    module_id    VARCHAR(36)  NULL,
    title        VARCHAR(160) NOT NULL,
    topic        VARCHAR(1000) NOT NULL,
    author_id    CHAR(36)     NOT NULL,
    pinned       BOOLEAN      NOT NULL DEFAULT FALSE,
    locked       BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at   DATETIME(6)  NOT NULL,
    updated_at   DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    KEY idx_discussions_programme (programme_id, created_at),
    CONSTRAINT fk_discussions_programme FOREIGN KEY (programme_id) REFERENCES programmes (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_discussions_module FOREIGN KEY (module_id) REFERENCES learning_modules (id)
        ON DELETE SET NULL,
    CONSTRAINT fk_discussions_author FOREIGN KEY (author_id) REFERENCES users (id)
        ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE discussion_messages (
    id            CHAR(36)    NOT NULL,
    discussion_id CHAR(36)    NOT NULL,
    author_id     CHAR(36)    NOT NULL,
    body          TEXT        NOT NULL,
    created_at    DATETIME(6) NOT NULL,
    updated_at    DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_discussion_messages_thread (discussion_id, created_at),
    CONSTRAINT fk_discussion_messages_discussion FOREIGN KEY (discussion_id) REFERENCES discussions (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_discussion_messages_author FOREIGN KEY (author_id) REFERENCES users (id)
        ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE assessment_questions (
    id            CHAR(36)    NOT NULL,
    assessment_id CHAR(36)    NOT NULL,
    prompt        VARCHAR(1000) NOT NULL,
    position      INT         NOT NULL,
    points        INT         NOT NULL,
    created_at    DATETIME(6) NOT NULL,
    updated_at    DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_assessment_questions_position (assessment_id, position),
    CONSTRAINT fk_assessment_questions_assessment FOREIGN KEY (assessment_id) REFERENCES assessments (id)
        ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE assessment_question_options (
    question_id CHAR(36)     NOT NULL,
    position    INT          NOT NULL,
    label       VARCHAR(500) NOT NULL,
    correct     BOOLEAN      NOT NULL DEFAULT FALSE,
    PRIMARY KEY (question_id, position),
    CONSTRAINT fk_question_options_question FOREIGN KEY (question_id) REFERENCES assessment_questions (id)
        ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE assessment_attempt_answers (
    id             CHAR(36)    NOT NULL,
    attempt_id     CHAR(36)    NOT NULL,
    question_id    CHAR(36)    NOT NULL,
    option_index   INT         NOT NULL,
    awarded_points INT         NOT NULL,
    created_at     DATETIME(6) NOT NULL,
    updated_at     DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_attempt_answers_question (attempt_id, question_id),
    CONSTRAINT fk_attempt_answers_attempt FOREIGN KEY (attempt_id) REFERENCES assessment_attempts (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_attempt_answers_question FOREIGN KEY (question_id) REFERENCES assessment_questions (id)
        ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
