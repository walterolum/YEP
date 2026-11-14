-- R14 — rollback for V15 (funding and certificates).
DROP TABLE IF EXISTS certificate_verifications;
DROP TABLE IF EXISTS payment_intents;
DROP TABLE IF EXISTS sponsorships;
DROP TABLE IF EXISTS financial_aid_applications;
ALTER TABLE certificates DROP COLUMN scope_id, DROP COLUMN scope;
