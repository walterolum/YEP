-- V13 — Phase 3: interactive learning. Lesson media, notes, per-lesson Q&A, practice
-- attempts, coding exercises/submissions, assessment retakes, and practice quizzes for the
-- Python and SQL courses. All seeded lesson, quiz and exercise text is original YEP writing.

ALTER TABLE lessons
    ADD COLUMN video_url VARCHAR(500) NULL,
    ADD COLUMN transcript TEXT NULL,
    ADD COLUMN captions_url VARCHAR(500) NULL;

CREATE TABLE lesson_notes (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    lesson_id BIGINT NOT NULL,
    body TEXT NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    UNIQUE KEY uk_lesson_notes_user_lesson (user_id, lesson_id),
    CONSTRAINT fk_lesson_notes_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_lesson_notes_lesson FOREIGN KEY (lesson_id) REFERENCES lessons (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE lesson_posts (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    lesson_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    body VARCHAR(2000) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    KEY idx_lesson_posts_lesson (lesson_id, created_at),
    CONSTRAINT fk_lesson_posts_lesson FOREIGN KEY (lesson_id) REFERENCES lessons (id),
    CONSTRAINT fk_lesson_posts_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE practice_attempts (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    chosen_option VARCHAR(1) NOT NULL,
    correct TINYINT(1) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    KEY idx_practice_user_question (user_id, question_id),
    CONSTRAINT fk_practice_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_practice_question FOREIGN KEY (question_id) REFERENCES questions (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE coding_exercises (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    lesson_id BIGINT NOT NULL,
    title VARCHAR(160) NOT NULL,
    language VARCHAR(20) NOT NULL,
    instructions TEXT NOT NULL,
    starter_code TEXT NULL,
    expected_output TEXT NULL,
    points INT NOT NULL DEFAULT 10,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    KEY idx_coding_exercise_lesson (lesson_id),
    CONSTRAINT fk_coding_exercise_lesson FOREIGN KEY (lesson_id) REFERENCES lessons (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE code_submissions (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    exercise_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    code MEDIUMTEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    score INT NOT NULL DEFAULT 0,
    output TEXT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    KEY idx_code_submission_exercise (exercise_id, user_id),
    CONSTRAINT fk_code_submission_exercise FOREIGN KEY (exercise_id) REFERENCES coding_exercises (id),
    CONSTRAINT fk_code_submission_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE assessment_attempts (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    assessment_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    started_at DATETIME(6) NOT NULL,
    submitted_at DATETIME(6) NULL,
    score INT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    KEY idx_attempt_assessment_user (assessment_id, user_id),
    CONSTRAINT fk_attempt_assessment FOREIGN KEY (assessment_id) REFERENCES assessments (id),
    CONSTRAINT fk_attempt_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Practice quizzes for the Python and SQL courses (original YEP questions).
INSERT INTO assessments (id, module_id, title, due_date, total_marks, published, results_published)
VALUES (200, 200, 'Python: variables and decisions', '2027-12-31 23:59:59.000000', 30, 1, 1),
       (201, 204, 'SQL: reading data', '2027-12-31 23:59:59.000000', 30, 1, 1);

INSERT INTO questions (id, assessment_id, prompt, option_a, option_b, option_c, option_d,
                       correct_option, sort_order) VALUES
(200, 200, 'What does input() always return?', 'An integer', 'Text', 'A list', 'A boolean', 'B', 1),
(201, 200, 'Which value is a float?', '42', '"42"', '4.2', 'True', 'C', 2),
(202, 200, 'What does if do?', 'Repeats a block', 'Chooses a block by a condition', 'Stores a value', 'Imports a file', 'B', 3),
(203, 201, 'Which clause filters rows?', 'SELECT', 'WHERE', 'ORDER BY', 'LIMIT', 'B', 1),
(204, 201, 'What does COUNT(*) return?', 'The number of rows', 'The largest value', 'The first row', 'The table name', 'A', 2),
(205, 201, 'Which clause sorts the result?', 'GROUP BY', 'ORDER BY', 'HAVING', 'JOIN', 'B', 3);

-- Coding exercises for the three language courses.
INSERT INTO coding_exercises (id, lesson_id, title, language, instructions, starter_code, expected_output, points)
VALUES
(200, 201, 'Budget check', 'python',
 'Write a program that reads three integers from standard input and prints the total, then "OVER" if the total is more than 1000 or "OK" otherwise. Print the total on its own line.',
 'numbers = [int(input()) for _ in range(3)]\n# print the total and the status\n',
 '1500\nOVER', 10),
(201, 205, 'Inventory value', 'java',
 'Given a unit price and a quantity read as integers, print the total value. Use a method called total that returns price * quantity.',
 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        int price = scanner.nextInt();\n        int quantity = scanner.nextInt();\n        // print the total\n    }\n}\n',
 '1250', 10),
(202, 209, 'Courses per academy', 'sql',
 'Write a query that returns the academy name and the number of its courses, grouped by academy, ordered by the count from most to fewest. Use the table aliases a (academies), p (career_paths) and c (courses).',
 'SELECT a.name, COUNT(c.id) AS courses\nFROM academies a\n-- join and group here\n',
 'Tech & Digital|11', 10);

-- Lesson media placeholders stay empty (no third-party video is embedded), but the columns
-- exist so instructors can attach a licensed video, transcript and captions per lesson.
