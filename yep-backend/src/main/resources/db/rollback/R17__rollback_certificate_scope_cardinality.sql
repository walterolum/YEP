-- R17 — rollback for V18.
DROP INDEX idx_certificate_user_scope ON certificates;
-- Only safe once each user holds at most one certificate again.
ALTER TABLE certificates ADD UNIQUE KEY uk_certificates_user (user_id);
