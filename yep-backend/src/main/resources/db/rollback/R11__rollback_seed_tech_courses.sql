-- R11 — rollback for V12 (Tech & Digital course seed).
-- Deletes only the seeded rows, newest dependencies first because the foreign keys protect them.
SET @codes := ('TECH-PY-L1','TECH-JAVA-L1','TECH-SQL-L1','TECH-MOB-L1','DAT-ANALYST-L1',
               'AIT-AI-L1','SEC-CYBER-L1','DES-UX-L1','MKT-DIGI-L1');

DELETE FROM submission_answers WHERE submission_id IN (
    SELECT s.id FROM submissions s JOIN assessments a ON a.id = s.assessment_id WHERE a.module_id BETWEEN 200 AND 217);
DELETE FROM submissions WHERE assessment_id IN (SELECT id FROM assessments WHERE module_id BETWEEN 200 AND 217);
DELETE FROM questions WHERE assessment_id IN (SELECT id FROM assessments WHERE module_id BETWEEN 200 AND 217);
DELETE FROM assessments WHERE module_id BETWEEN 200 AND 217;
DELETE FROM lesson_progress WHERE lesson_id BETWEEN 200 AND 235;
DELETE FROM course_enrollments WHERE course_id IN (SELECT id FROM courses WHERE code IN @codes);
DELETE FROM course_reviews WHERE course_id IN (SELECT id FROM courses WHERE code IN @codes);
DELETE FROM materials WHERE module_id BETWEEN 200 AND 217;
DELETE FROM lessons WHERE id BETWEEN 200 AND 235;
DELETE FROM modules WHERE id BETWEEN 200 AND 217;
DELETE FROM courses WHERE code IN @codes;
DELETE FROM career_paths
WHERE slug IN ('data-and-ai','cybersecurity','product-design','digital-marketing')
  AND NOT EXISTS (SELECT 1 FROM courses c WHERE c.career_path_id = career_paths.id);
