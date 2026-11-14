-- R12 — rollback for V13 (interactive learning).
DELETE FROM assessment_attempts;
DELETE FROM code_submissions WHERE exercise_id BETWEEN 200 AND 202;
DELETE FROM coding_exercises WHERE id BETWEEN 200 AND 202;
DELETE FROM practice_attempts;
DELETE FROM lesson_posts;
DELETE FROM lesson_notes;
DELETE FROM submission_answers WHERE question_id BETWEEN 200 AND 205;
DELETE FROM questions WHERE id BETWEEN 200 AND 205;
DELETE FROM assessments WHERE id IN (200, 201);
DROP TABLE IF EXISTS assessment_attempts;
DROP TABLE IF EXISTS code_submissions;
DROP TABLE IF EXISTS coding_exercises;
DROP TABLE IF EXISTS practice_attempts;
DROP TABLE IF EXISTS lesson_posts;
DROP TABLE IF EXISTS lesson_notes;
ALTER TABLE lessons DROP COLUMN captions_url, DROP COLUMN transcript, DROP COLUMN video_url;
