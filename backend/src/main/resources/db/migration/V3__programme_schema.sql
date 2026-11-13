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
