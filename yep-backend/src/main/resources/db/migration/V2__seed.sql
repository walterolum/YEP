-- =============================================================================
-- YEP – V2: sample data
-- Every seeded account uses the development password: Password123!
-- (BCrypt, cost 10 — change it before any real deployment.)
-- =============================================================================

INSERT INTO settings (setting_key, setting_value) VALUES
    ('platform_name', 'YEP – Youth Empowerment Management System'),
    ('support_email', 'support@yep.example'),
    ('min_age', '18'),
    ('max_age', '35'),
    ('require_approval', 'true'),
    ('low_bandwidth', 'false'),
    ('email_notifications', 'true'),
    ('level2_min_completion', '80'),
    ('level2_min_score', '65'),
    ('level2_min_attendance', '75');

INSERT INTO role_permissions (role, permission, allowed) VALUES
    ('ADMIN', 'Manage users', TRUE), ('ADMIN', 'Programmes', TRUE), ('ADMIN', 'Assessments', TRUE),
    ('ADMIN', 'Certificates', TRUE), ('ADMIN', 'Reports', TRUE),
    ('PARTICIPANT', 'Manage users', FALSE), ('PARTICIPANT', 'Programmes', FALSE),
    ('PARTICIPANT', 'Assessments', FALSE), ('PARTICIPANT', 'Certificates', FALSE),
    ('PARTICIPANT', 'Reports', FALSE),
    ('FACILITATOR', 'Manage users', FALSE), ('FACILITATOR', 'Programmes', TRUE),
    ('FACILITATOR', 'Assessments', TRUE), ('FACILITATOR', 'Certificates', FALSE),
    ('FACILITATOR', 'Reports', TRUE),
    ('MENTOR', 'Manage users', FALSE), ('MENTOR', 'Programmes', FALSE),
    ('MENTOR', 'Assessments', FALSE), ('MENTOR', 'Certificates', FALSE), ('MENTOR', 'Reports', TRUE),
    ('SPONSOR', 'Manage users', FALSE), ('SPONSOR', 'Programmes', FALSE),
    ('SPONSOR', 'Assessments', FALSE), ('SPONSOR', 'Certificates', FALSE), ('SPONSOR', 'Reports', TRUE);

INSERT INTO users (id, full_name, email, phone, password_hash, role, status, country, district,
                   date_of_birth, institution, field_of_study, requested_level, avatar) VALUES
    (1, 'Walter Olum', 'admin@yep.example', '+256 700 100 100',
     '$2a$10$Dm19spA72as5hUGdirkptuozBQc1kFZbnc1kUPvYpyhd7nxigo7T.', 'ADMIN', 'APPROVED',
     'Uganda', 'Kampala', '1986-04-12', 'YEP Secretariat', NULL, NULL, 'WO'),
    (2, 'Amara Nakato', 'amara@yep.example', '+256 700 200 200',
     '$2a$10$Dm19spA72as5hUGdirkptuozBQc1kFZbnc1kUPvYpyhd7nxigo7T.', 'PARTICIPANT', 'APPROVED',
     'Uganda', 'Kampala', '2002-02-18', 'Makerere University', 'Information Systems', 'LEVEL_TWO', 'AN'),
    (3, 'Brian Ochieng', 'brian@yep.example', '+254 700 300 300',
     '$2a$10$Dm19spA72as5hUGdirkptuozBQc1kFZbnc1kUPvYpyhd7nxigo7T.', 'PARTICIPANT', 'APPROVED',
     'Kenya', 'Nairobi', '2000-07-05', 'University of Nairobi', 'Economics', 'LEVEL_ONE', 'BO'),
    (4, 'Grace Mwangi', 'grace@yep.example', '+254 700 400 400',
     '$2a$10$Dm19spA72as5hUGdirkptuozBQc1kFZbnc1kUPvYpyhd7nxigo7T.', 'MENTOR', 'APPROVED',
     'Kenya', 'Nairobi', '1990-09-21', 'Athi Water Works', 'Water Engineering', NULL, 'GM'),
    (5, 'Daniel Okello', 'daniel@yep.example', '+256 700 500 500',
     '$2a$10$Dm19spA72as5hUGdirkptuozBQc1kFZbnc1kUPvYpyhd7nxigo7T.', 'FACILITATOR', 'APPROVED',
     'Uganda', 'Gulu', '1988-11-02', 'YEP', 'Digital Skills', NULL, 'DO'),
    (6, 'Sarah Namusoke', 'sponsor@yep.example', '+256 700 600 600',
     '$2a$10$Dm19spA72as5hUGdirkptuozBQc1kFZbnc1kUPvYpyhd7nxigo7T.', 'SPONSOR', 'APPROVED',
     'Uganda', 'Entebbe', '1984-05-30', 'East Africa Youth Fund', 'Programme Funding', NULL, 'SN'),
    (7, 'Pending Applicant', 'pending@yep.example', '+256 700 700 700',
     '$2a$10$Dm19spA72as5hUGdirkptuozBQc1kFZbnc1kUPvYpyhd7nxigo7T.', 'PARTICIPANT', 'PENDING',
     'Uganda', 'Mbale', '2001-01-10', 'Busitema University', 'Agriculture', 'LEVEL_ONE', 'PA'),
    (8, 'Rejected Applicant', 'rejected@yep.example', NULL,
     '$2a$10$Dm19spA72as5hUGdirkptuozBQc1kFZbnc1kUPvYpyhd7nxigo7T.', 'PARTICIPANT', 'REJECTED',
     'Rwanda', 'Kigali', '1998-08-08', 'University of Rwanda', 'Education', 'LEVEL_ONE', 'RA'),
    (9, 'Suspended Member', 'suspended@yep.example', NULL,
     '$2a$10$Dm19spA72as5hUGdirkptuozBQc1kFZbnc1kUPvYpyhd7nxigo7T.', 'PARTICIPANT', 'SUSPENDED',
     'Tanzania', 'Dar es Salaam', '1999-12-01', 'University of Dar es Salaam', 'Media', 'LEVEL_ONE', 'SM');

INSERT INTO user_skills (user_id, name) VALUES
    (2, 'Research'), (2, 'Facilitation'), (2, 'Community engagement'),
    (3, 'Data analysis'), (3, 'Public speaking'),
    (4, 'Mentoring'), (4, 'Water systems'),
    (5, 'Curriculum design'), (5, 'Assessment');

INSERT INTO programmes (id, title, category, icon, capacity, registration_deadline,
                        eligibility_text, published) VALUES
    (1, 'Digital Foundations', 'Digital Literacy', '💻', 120, '2026-12-31 23:59:59',
     'Open to approved participants aged 18–35 in East Africa.', TRUE),
    (2, 'Responsible AI Lab', 'AI Literacy', '🤖', 80, '2026-12-15 23:59:59',
     'Completed Digital Foundations or equivalent experience.', TRUE),
    (3, 'Community Impact Lab', 'Impact Projects', '🌍', 60, '2027-01-31 23:59:59',
     'Level One completion of at least 80%.', TRUE),
    (4, 'Media Literacy Sprint', 'Media Literacy', '📰', 50, '2027-02-28 23:59:59',
     'Draft programme — not yet open.', FALSE);

INSERT INTO modules (id, name, icon, sort_order, level) VALUES
    (1, 'Digital Literacy', '💻', 1, 1),
    (2, 'AI Literacy', '🤖', 2, 1),
    (3, 'Critical Thinking', '🧠', 3, 1),
    (4, 'Media Literacy', '📰', 4, 1),
    (5, 'Intercultural Communication', '🤝', 5, 1);

INSERT INTO lessons (id, module_id, title, type, sort_order) VALUES
    (1, 1, 'Introduction to digital tools', 'VIDEO', 1),
    (2, 1, 'Working safely online', 'NOTES', 2),
    (3, 1, 'Practice: set up your workspace', 'ACTIVITY', 3),
    (4, 2, 'What generative AI can and cannot do', 'VIDEO', 1),
    (5, 2, 'Bias, privacy and accountability', 'NOTES', 2),
    (6, 2, 'Practice: audit an AI answer', 'ACTIVITY', 3),
    (7, 3, 'Asking better questions', 'VIDEO', 1),
    (8, 3, 'Evidence and assumptions', 'NOTES', 2),
    (9, 3, 'Practice: break an argument down', 'ACTIVITY', 3),
    (10, 4, 'Verifying a source', 'VIDEO', 1),
    (11, 4, 'Recognising manipulated media', 'NOTES', 2),
    (12, 4, 'Practice: fact-check a post', 'ACTIVITY', 3),
    (13, 5, 'Working across contexts', 'VIDEO', 1),
    (14, 5, 'Giving and receiving feedback', 'NOTES', 2),
    (15, 5, 'Practice: agree a team contract', 'ACTIVITY', 3);

INSERT INTO lesson_progress (user_id, lesson_id, completed_at)
SELECT 2, id, DATE_SUB(NOW(6), INTERVAL (16 - id) DAY) FROM lessons WHERE id <= 12;

INSERT INTO lesson_progress (user_id, lesson_id, completed_at)
SELECT 3, id, DATE_SUB(NOW(6), INTERVAL (8 - id) DAY) FROM lessons WHERE id <= 4;

INSERT INTO materials (module_id, title, type, url) VALUES
    (1, 'Digital foundations workbook', 'PDF', '/uploads/materials/digital-foundations.pdf'),
    (2, 'Responsible AI checklist', 'PDF', '/uploads/materials/ai-checklist.pdf'),
    (3, 'Critical thinking worksheet', 'SLIDES', '/uploads/materials/critical-thinking.pptx'),
    (NULL, 'YEP participant handbook', 'PDF', '/uploads/materials/participant-handbook.pdf'),
    (NULL, 'Level One welcome video', 'VIDEO', 'https://example.org/yep/welcome');

INSERT INTO discussion_threads (id, title, created_by) VALUES
    (1, 'How do you verify information before sharing it?', 5),
    (2, 'What surprised you about generative AI?', 2);

INSERT INTO discussion_posts (thread_id, user_id, body) VALUES
    (1, 5, 'Share one habit you use before forwarding a claim.'),
    (1, 2, 'I check whether at least two independent outlets report the same number.'),
    (1, 3, 'I look for the original document rather than a screenshot of it.'),
    (2, 2, 'It is confident even when it is wrong, which changes how I read it.');

INSERT INTO projects (id, title, category, description, status) VALUES
    (1, 'Community water point reporting', 'Health',
     'A privacy-preserving way for a water committee to track repairs and publish status updates.',
     'APPROVED'),
    (2, 'Solar-aware school energy tracker', 'Climate Change',
     'A daily recording routine and weekly summary to help two schools use solar energy better.',
     'PROPOSED'),
    (3, 'Digital skills bridge for market traders', 'Employment',
     'A short, trader-led curriculum built around the digital tasks traders actually perform.',
     'IN_PROGRESS');

INSERT INTO teams (id, name, project_id, lead_user_id, mentor_id, facilitator_id, cohort) VALUES
    (1, 'Team Kito', 1, 2, 4, 5, '2026-A'),
    (2, 'Team Solaris', 3, 3, 4, 5, '2026-A');

INSERT INTO team_members (team_id, user_id) VALUES (1, 2), (1, 3), (2, 3);

INSERT INTO milestones (id, project_id, title, sort_order, completed, completed_at) VALUES
    (1, 1, 'Problem framing', 1, TRUE, DATE_SUB(NOW(6), INTERVAL 20 DAY)),
    (2, 1, 'Stakeholder evidence', 2, FALSE, NULL),
    (3, 1, 'Prototype', 3, FALSE, NULL),
    (4, 1, 'Public showcase', 4, FALSE, NULL),
    (5, 3, 'Problem framing', 1, TRUE, DATE_SUB(NOW(6), INTERVAL 12 DAY)),
    (6, 3, 'Stakeholder evidence', 2, TRUE, DATE_SUB(NOW(6), INTERVAL 5 DAY)),
    (7, 3, 'Prototype', 3, FALSE, NULL),
    (8, 3, 'Public showcase', 4, FALSE, NULL);

INSERT INTO assessments (id, module_id, title, due_date, total_marks, published, results_published) VALUES
    (1, 1, 'Digital Foundations knowledge check', DATE_ADD(NOW(6), INTERVAL 14 DAY), 20, TRUE, TRUE),
    (2, 2, 'Responsible AI knowledge check', DATE_ADD(NOW(6), INTERVAL 21 DAY), 20, TRUE, FALSE);

INSERT INTO questions (id, assessment_id, prompt, option_a, option_b, option_c, option_d, correct_option, sort_order) VALUES
    (1, 1, 'Which habit best protects your account?', 'Reusing one strong password',
     'Using a password manager and unique passwords', 'Sharing passwords with your team',
     'Writing passwords in a notebook', 'B', 1),
    (2, 1, 'What should you check before forwarding a claim?', 'How many likes it has',
     'Whether the original source exists', 'Whether it matches your opinion',
     'Whether it was posted today', 'B', 2),
    (3, 1, 'What does a digital workspace help a team do?', 'Avoid all meetings',
     'Keep files and decisions in one shared place', 'Hide progress from mentors',
     'Replace agreements', 'B', 3),
    (4, 2, 'What is a responsible use of a generative AI tool?', 'Pasting participant personal data',
     'Treating output as a verified fact', 'Drafting text and checking every claim yourself',
     'Using it to speak for a community', 'C', 1),
    (5, 2, 'Which statement about AI output is true?', 'It is always neutral',
     'It can repeat biases present in its training data', 'It cannot be wrong',
     'It always cites sources', 'B', 2),
    (6, 2, 'Who stays accountable for a submitted project?', 'The AI tool',
     'Nobody, if AI wrote it', 'The participant or team who submits it', 'The internet provider',
     'C', 3);

INSERT INTO submissions (id, assessment_id, user_id, score, graded_by, submitted_at) VALUES
    (1, 1, 2, 18, 5, DATE_SUB(NOW(6), INTERVAL 6 DAY)),
    (2, 1, 3, 15, 5, DATE_SUB(NOW(6), INTERVAL 4 DAY));

INSERT INTO submission_answers (submission_id, question_id, chosen_option) VALUES
    (1, 1, 'B'), (1, 2, 'B'), (1, 3, 'B'),
    (2, 1, 'B'), (2, 2, 'A'), (2, 3, 'B');

INSERT INTO sessions (id, title, type, starts_at, cohort, programme_id, created_by, meeting_link) VALUES
    (1, 'Level One welcome workshop', 'WORKSHOP', DATE_ADD(NOW(6), INTERVAL 3 DAY), '2026-A', 1, 5,
     'https://example.org/yep/session-1'),
    (2, 'Verifying sources together', 'DISCUSSION', DATE_ADD(NOW(6), INTERVAL 10 DAY), '2026-A', 1, 5,
     'https://example.org/yep/session-2'),
    (3, 'Impact project clinic', 'PROJECT', DATE_ADD(NOW(6), INTERVAL 17 DAY), '2026-A', 3, 4,
     'https://example.org/yep/session-3');

INSERT INTO session_registrations (session_id, user_id) VALUES
    (1, 2), (1, 3), (2, 2), (3, 2), (3, 3);

INSERT INTO attendance (session_id, user_id, present) VALUES
    (1, 2, TRUE), (1, 3, FALSE);

INSERT INTO mentorships (id, mentor_id, mentee_id, goal, progress_percent, status, request_note) VALUES
    (1, 4, 2, 'Strengthen evidence quality and keep the project scope realistic.', 40, 'ACCEPTED',
     'I would like help making my evidence concise.'),
    (2, 4, 3, 'Build confidence presenting data to non-specialists.', 0, 'REQUESTED',
     'I want feedback on my public speaking.');

INSERT INTO mentor_sessions (mentorship_id, title, starts_at, status) VALUES
    (1, 'Monthly check-in', DATE_ADD(NOW(6), INTERVAL 6 DAY), 'SCHEDULED'),
    (1, 'Evidence review', DATE_SUB(NOW(6), INTERVAL 9 DAY), 'COMPLETED');

INSERT INTO resources (owner_id, title, type, url) VALUES
    (4, 'Evidence pack template', 'PDF', '/uploads/resources/evidence-template.pdf'),
    (4, 'Writing a concise problem statement', 'LINK', 'https://example.org/yep/problem-statement');

INSERT INTO pledges (sponsor_id, project_id, project_title, amount_ugx, status, pledged_at) VALUES
    (6, 1, 'Community water point reporting', 5000000.00, 'PLEDGED', DATE_SUB(NOW(6), INTERVAL 15 DAY)),
    (6, 3, 'Digital skills bridge for market traders', 2500000.00, 'DISBURSED', DATE_SUB(NOW(6), INTERVAL 40 DAY));

INSERT INTO partners (name, type, icon, active) VALUES
    ('Makerere University', 'PARTNER', '🎓', TRUE),
    ('East Africa Youth Fund', 'NGO', '🌍', TRUE),
    ('Safaricom', 'EMPLOYER', '📱', TRUE),
    ('Kampala Digital Hub', 'TECHNOLOGY', '💡', TRUE);

INSERT INTO message_threads (id, kind, title, team_id, from_user_id, target_user_id) VALUES
    (1, 'ANNOUNCEMENT', 'Platform announcements', NULL, 1, NULL),
    (2, 'ANNOUNCEMENT', 'Week 3: exchange sessions open', NULL, 1, NULL),
    (3, 'SPONSOR_ENQUIRY', 'Sponsor enquiry: Community water point reporting', 1, 6, 2),
    (4, 'DM', 'Direct message', NULL, 2, 4);

INSERT INTO thread_members (thread_id, user_id) VALUES
    (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6),
    (2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6),
    (3, 6), (3, 2), (3, 3), (3, 4), (3, 5), (3, 1),
    (4, 2), (4, 4), (4, 1);

INSERT INTO messages (thread_id, sender_id, body, sent_at) VALUES
    (1, 1, 'Welcome to YEP. Level One modules are open; Level Two unlocks at 80% completion.',
     DATE_SUB(NOW(6), INTERVAL 12 DAY)),
    (2, 1, 'Registration for this month''s exchange sessions is now open.',
     DATE_SUB(NOW(6), INTERVAL 2 DAY)),
    (3, 6, 'We would like an update on the water point reporting pilot before the next disbursement.',
     DATE_SUB(NOW(6), INTERVAL 5 DAY)),
    (3, 2, 'Thank you. The stakeholder evidence milestone is in progress; we can share a summary next week.',
     DATE_SUB(NOW(6), INTERVAL 4 DAY)),
    (4, 2, 'Could we review my evidence pack before Friday?', DATE_SUB(NOW(6), INTERVAL 3 DAY)),
    (4, 4, 'Yes — send it by Wednesday and I will comment.', DATE_SUB(NOW(6), INTERVAL 2 DAY));

INSERT INTO notifications (user_id, category, message, read_at, created_at) VALUES
    (2, 'CERTIFICATES', 'Your certificate stays locked until both levels reach 100%.', NULL,
     DATE_SUB(NOW(6), INTERVAL 1 DAY)),
    (2, 'SESSION_NOTIFICATIONS', 'Level One welcome workshop starts in 3 days.', NULL,
     DATE_SUB(NOW(6), INTERVAL 1 DAY)),
    (2, 'ASSESSMENT_RESULTS', 'Your Digital Foundations score has been published: 18/20.', NULL,
     DATE_SUB(NOW(6), INTERVAL 6 DAY)),
    (3, 'APPLICATION_DECISIONS', 'Your application was approved. Welcome to YEP!', NOW(6),
     DATE_SUB(NOW(6), INTERVAL 30 DAY));

INSERT INTO audit_log (actor_id, action, target_type, target_id, details) VALUES
    (1, 'PARTICIPANT_APPROVED', 'USER', '2', 'Application approved after review.'),
    (1, 'PARTICIPANT_APPROVED', 'USER', '3', 'Application approved after review.'),
    (1, 'PROGRAMME_PUBLISHED', 'PROGRAMME', '1', 'Digital Foundations published.'),
    (5, 'ASSESSMENT_RESULTS_PUBLISHED', 'ASSESSMENT', '1', 'Results released to participants.');
