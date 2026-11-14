-- R18 — rollback for V19 demo content.
DELETE sj FROM saved_jobs sj JOIN job_postings j ON j.id = sj.posting_id
WHERE j.title IN ('Data Analytics Intern', 'Solar Installation Technician');
DELETE ja FROM job_applications ja JOIN job_postings j ON j.id = ja.posting_id
WHERE j.title IN ('Data Analytics Intern', 'Solar Installation Technician');
DELETE FROM job_postings WHERE title IN ('Data Analytics Intern', 'Solar Installation Technician');
DELETE p FROM portfolio_items p JOIN users u ON u.id = p.user_id
WHERE u.email = 'amara@yep.example'
  AND p.title IN ('Community clean-up impact project', 'YEP Core — Level One certificate');
DELETE FROM impact_records WHERE country = 'Uganda' AND period = '2026-Q4';
