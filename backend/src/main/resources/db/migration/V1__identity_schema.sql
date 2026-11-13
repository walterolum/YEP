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
