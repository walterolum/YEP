-- V14 — Phase 4: virtual sessions. Provider/room metadata on sessions, recurring series,
-- recordings that can be published as lessons, feedback and bookable slots.

ALTER TABLE sessions
    ADD COLUMN provider VARCHAR(20) NOT NULL DEFAULT 'jitsi',
    ADD COLUMN room_url VARCHAR(500) NULL,
    ADD COLUMN duration_minutes INT NOT NULL DEFAULT 60,
    ADD COLUMN series_id BIGINT NULL;

CREATE TABLE session_series (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(160) NOT NULL,
    type VARCHAR(20) NOT NULL,
    starts_at DATETIME(6) NOT NULL,
    repeat_weeks INT NOT NULL DEFAULT 1,
    duration_minutes INT NOT NULL DEFAULT 60,
    cohort VARCHAR(80) NULL,
    provider VARCHAR(20) NOT NULL DEFAULT 'jitsi',
    programme_id BIGINT NULL,
    created_by BIGINT NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_series_programme FOREIGN KEY (programme_id) REFERENCES programmes (id),
    CONSTRAINT fk_series_creator FOREIGN KEY (created_by) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE sessions
    ADD CONSTRAINT fk_session_series FOREIGN KEY (series_id) REFERENCES session_series (id);

CREATE TABLE session_recordings (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    title VARCHAR(160) NOT NULL,
    url VARCHAR(500) NOT NULL,
    transcript TEXT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    KEY idx_recording_session (session_id),
    CONSTRAINT fk_recording_session FOREIGN KEY (session_id) REFERENCES sessions (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE session_feedback (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    rating INT NOT NULL,
    comment VARCHAR(1000) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    UNIQUE KEY uk_feedback_session_user (session_id, user_id),
    CONSTRAINT fk_feedback_session FOREIGN KEY (session_id) REFERENCES sessions (id),
    CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE booking_slots (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    starts_at DATETIME(6) NOT NULL,
    ends_at DATETIME(6) NOT NULL,
    capacity INT NOT NULL DEFAULT 1,
    booked_count INT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    KEY idx_slot_session (session_id, starts_at),
    CONSTRAINT fk_slot_session FOREIGN KEY (session_id) REFERENCES sessions (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE slot_bookings (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    slot_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    UNIQUE KEY uk_slot_booking (slot_id, user_id),
    CONSTRAINT fk_slot_booking_slot FOREIGN KEY (slot_id) REFERENCES booking_slots (id),
    CONSTRAINT fk_slot_booking_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Existing sessions get a working room link.
UPDATE sessions SET provider = 'jitsi', room_url = CONCAT('https://meet.jit.si/', room_name)
WHERE room_name IS NOT NULL AND room_url IS NULL;
