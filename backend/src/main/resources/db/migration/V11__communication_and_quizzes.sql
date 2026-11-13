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
