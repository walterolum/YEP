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
