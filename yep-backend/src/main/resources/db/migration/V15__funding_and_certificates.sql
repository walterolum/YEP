-- V15 — Phase 5: financial aid, sponsorship seats, a payment-intent abstraction and
-- verifiable certificates scoped to a course (or a programme).

ALTER TABLE certificates
    ADD COLUMN scope VARCHAR(20) NOT NULL DEFAULT 'PROGRAMME',
    ADD COLUMN scope_id BIGINT NULL;

CREATE TABLE financial_aid_applications (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    reason VARCHAR(1000) NOT NULL,
    income_band VARCHAR(40) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    note VARCHAR(1000) NULL,
    decided_by BIGINT NULL,
    decided_at DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    KEY idx_aid_status (status),
    UNIQUE KEY uk_aid_user_course (user_id, course_id),
    CONSTRAINT fk_aid_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_aid_course FOREIGN KEY (course_id) REFERENCES courses (id),
    CONSTRAINT fk_aid_decider FOREIGN KEY (decided_by) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sponsorships (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    sponsor_id BIGINT NOT NULL,
    learner_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    UNIQUE KEY uk_sponsorship (sponsor_id, learner_id, course_id),
    CONSTRAINT fk_sponsor_user FOREIGN KEY (sponsor_id) REFERENCES users (id),
    CONSTRAINT fk_sponsor_learner FOREIGN KEY (learner_id) REFERENCES users (id),
    CONSTRAINT fk_sponsor_course FOREIGN KEY (course_id) REFERENCES courses (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE payment_intents (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    amount_cents BIGINT NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'UGX',
    provider VARCHAR(30) NOT NULL DEFAULT 'manual',
    reference VARCHAR(60) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    UNIQUE KEY uk_payment_reference (reference),
    CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_payment_course FOREIGN KEY (course_id) REFERENCES courses (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE certificate_verifications (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    certificate_id BIGINT NOT NULL,
    checked_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    KEY idx_verification_certificate (certificate_id),
    CONSTRAINT fk_verification_certificate FOREIGN KEY (certificate_id) REFERENCES certificates (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

UPDATE certificates SET scope = 'PROGRAMME', scope_id = NULL WHERE scope IS NULL;
