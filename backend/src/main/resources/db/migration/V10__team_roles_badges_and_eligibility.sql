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
