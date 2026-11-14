-- R13 — rollback for V14 (virtual sessions).
DELETE FROM slot_bookings;
DELETE FROM booking_slots;
DELETE FROM session_feedback;
DELETE FROM session_recordings;
UPDATE sessions SET series_id = NULL;
ALTER TABLE sessions DROP FOREIGN KEY fk_session_series;
DROP TABLE IF EXISTS slot_bookings;
DROP TABLE IF EXISTS booking_slots;
DROP TABLE IF EXISTS session_feedback;
DROP TABLE IF EXISTS session_recordings;
DROP TABLE IF EXISTS session_series;
ALTER TABLE sessions DROP COLUMN series_id, DROP COLUMN duration_minutes,
    DROP COLUMN room_url, DROP COLUMN provider;
