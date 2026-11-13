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
