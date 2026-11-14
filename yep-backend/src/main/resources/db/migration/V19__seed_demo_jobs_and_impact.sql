-- V19 — Demo content for the jobs board, portfolios and impact reporting.
-- Rows are only inserted when the matching demo account exists and the content is absent, so the
-- script is safe on a database that already has real postings. No learner progress is invented.

INSERT INTO job_postings (employer_id, title, organisation, location, work_mode, description, skills, closes_at, published)
SELECT u.id, 'Data Analytics Intern', 'Acme Digital', 'Kampala, Uganda', 'HYBRID',
       'Work with the analytics team to clean enrolment data, build weekly dashboards and present findings to programme managers. You will be paired with a mentor for the first month.',
       'SQL, spreadsheets, data cleaning, clear writing', '2027-03-31 23:59:59.000000', 1
FROM users u
WHERE u.email = 'employer.one@yep.example'
  AND NOT EXISTS (SELECT 1 FROM job_postings j WHERE j.title = 'Data Analytics Intern');

INSERT INTO job_postings (employer_id, title, organisation, location, work_mode, description, skills, closes_at, published)
SELECT u.id, 'Solar Installation Technician', 'GreenGrid Africa', 'Gulu, Uganda', 'ONSITE',
       'Install and maintain small solar systems for households and clinics. Training on our equipment is provided; you must be comfortable working at height and keeping a clean safety record.',
       'Electrical safety, solar PV, customer service', '2027-06-30 23:59:59.000000', 1
FROM users u
WHERE u.email = 'employer.one@yep.example'
  AND NOT EXISTS (SELECT 1 FROM job_postings j WHERE j.title = 'Solar Installation Technician');

INSERT INTO portfolio_items (user_id, title, description, url, type)
SELECT u.id, 'Community clean-up impact project',
       'Led a five-person team that ran two clean-up days and published a simple waste map for the neighbourhood.',
       NULL, 'PROJECT'
FROM users u
WHERE u.email = 'amara@yep.example'
  AND NOT EXISTS (SELECT 1 FROM portfolio_items p WHERE p.user_id = u.id AND p.title = 'Community clean-up impact project');

INSERT INTO portfolio_items (user_id, title, description, url, type)
SELECT u.id, 'YEP Core — Level One certificate',
       'Completed the digital foundations course with a verified certificate.',
       NULL, 'CERTIFICATE'
FROM users u
WHERE u.email = 'amara@yep.example'
  AND NOT EXISTS (SELECT 1 FROM portfolio_items p WHERE p.user_id = u.id AND p.title = 'YEP Core — Level One certificate');

INSERT INTO impact_records (country, gender, education_level, learners, certificates, placements, period)
SELECT 'Uganda', NULL, NULL, 120, 48, 17, '2026-Q4'
WHERE NOT EXISTS (SELECT 1 FROM impact_records WHERE country = 'Uganda' AND period = '2026-Q4');
