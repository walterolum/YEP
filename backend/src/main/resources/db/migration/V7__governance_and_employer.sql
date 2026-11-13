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
