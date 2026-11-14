-- V18 — Phase 5 follow-up: a learner may hold one certificate per course, so the legacy
-- "one certificate per user" unique key must go. The foreign key owns that index, so it is
-- dropped and recreated around the change. Codes stay globally unique.

ALTER TABLE certificates DROP FOREIGN KEY fk_certificates_user;
ALTER TABLE certificates DROP INDEX uk_certificates_user;

DROP PROCEDURE IF EXISTS yep_add_certificate_index;
DELIMITER //
CREATE PROCEDURE yep_add_certificate_index()
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.STATISTICS
                   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'certificates'
                     AND INDEX_NAME = 'idx_certificate_user_scope') THEN
        CREATE INDEX idx_certificate_user_scope ON certificates (user_id, scope, scope_id);
    END IF;
END //
DELIMITER ;
CALL yep_add_certificate_index();
DROP PROCEDURE yep_add_certificate_index;

ALTER TABLE certificates
    ADD CONSTRAINT fk_certificates_user FOREIGN KEY (user_id) REFERENCES users (id);
