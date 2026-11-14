-- V16 — Phase 6: jobs board, applications, saved jobs, portfolio items and impact records.

CREATE TABLE job_postings (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    employer_id BIGINT NOT NULL,
    title VARCHAR(160) NOT NULL,
    organisation VARCHAR(160) NOT NULL,
    location VARCHAR(120) NOT NULL,
    work_mode VARCHAR(20) NOT NULL DEFAULT 'ONSITE',
    description TEXT NOT NULL,
    skills VARCHAR(500) NULL,
    closes_at DATETIME(6) NULL,
    published TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    KEY idx_job_employer (employer_id),
    CONSTRAINT fk_job_employer FOREIGN KEY (employer_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE job_applications (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    posting_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    cover_note VARCHAR(2000) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED',
    decided_at DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    UNIQUE KEY uk_job_application (posting_id, user_id),
    CONSTRAINT fk_application_posting FOREIGN KEY (posting_id) REFERENCES job_postings (id),
    CONSTRAINT fk_application_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE saved_jobs (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    posting_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    UNIQUE KEY uk_saved_job (posting_id, user_id),
    CONSTRAINT fk_saved_posting FOREIGN KEY (posting_id) REFERENCES job_postings (id),
    CONSTRAINT fk_saved_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE portfolio_items (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(160) NOT NULL,
    description VARCHAR(1000) NULL,
    url VARCHAR(500) NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'PROJECT',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_portfolio_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE impact_records (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    country VARCHAR(80) NOT NULL,
    gender VARCHAR(20) NULL,
    education_level VARCHAR(40) NULL,
    learners INT NOT NULL DEFAULT 0,
    certificates INT NOT NULL DEFAULT 0,
    placements INT NOT NULL DEFAULT 0,
    period VARCHAR(20) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    KEY idx_impact_country (country)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A starter employer account posting is created through the API; no demo jobs are seeded so
-- the board only ever shows real opportunities.
