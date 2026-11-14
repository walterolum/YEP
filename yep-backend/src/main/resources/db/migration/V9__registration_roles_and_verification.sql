-- V9 — Phase 1: phone dial codes, country codes and email verification.
-- Additive only: no existing column is dropped and no existing row is deleted.

ALTER TABLE users
    ADD COLUMN phone_country_code VARCHAR(8) NULL AFTER phone,
    ADD COLUMN country_code       VARCHAR(2) NULL AFTER country;

-- One row per issued verification token. Only the SHA-256 hash is stored.
CREATE TABLE email_verification_tokens (
    id         BIGINT      NOT NULL AUTO_INCREMENT,
    user_id    BIGINT      NOT NULL,
    token_hash CHAR(64)    NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    used_at    DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_email_verification_token (token_hash),
    KEY idx_email_verification_user (user_id),
    CONSTRAINT fk_email_verification_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Verification is off until an email provider is wired up; registration throttling is on.
INSERT IGNORE INTO settings (setting_key, setting_value) VALUES
    ('require_email_verification', 'false'),
    ('registration_max_per_hour', '5');
