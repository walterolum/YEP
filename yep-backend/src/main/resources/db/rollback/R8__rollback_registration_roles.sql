-- R8 — manual rollback of V9. Run only with a backup of the yep database.
DROP TABLE IF EXISTS email_verification_tokens;

DELETE FROM settings WHERE setting_key IN ('require_email_verification', 'registration_max_per_hour');

ALTER TABLE users
    DROP COLUMN country_code,
    DROP COLUMN phone_country_code;
