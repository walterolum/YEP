-- ---------------------------------------------------------------------------
-- V4: remove the prototype's hard-coded demo identities and seed realistic
-- programme applications so the admin enrolment screens have data.
-- Accounts are renamed rather than deleted so existing attendance and
-- certificate references stay valid.
-- ---------------------------------------------------------------------------

UPDATE users SET full_name = 'YEP Administrator' WHERE email = 'admin@yep.example';
UPDATE users SET full_name = 'Sarah Auma', email = 'sarah.auma@yep.example'
WHERE email = 'walterolum91@gmail.com';

INSERT INTO applications (programme_id, user_id, status) VALUES
  (1, 2, 'APPROVED'),
  (1, 3, 'PENDING'),
  (2, 3, 'APPROVED'),
  (2, 7, 'PENDING'),
  (3, 2, 'PENDING')
ON DUPLICATE KEY UPDATE status = VALUES(status);
