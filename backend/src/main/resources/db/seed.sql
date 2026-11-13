-- =============================================================================
-- YEP sample data (fictional demonstration records only).
-- Requires schema.sql. Import after the schema: mysql -u root -p yep < seed.sql
-- =============================================================================

-- Fictional demonstration data for the YouthRise console. Loaded only by the
-- `demo` Flyway location (profile `demo`) and safe to re-run because every row
-- uses INSERT IGNORE with a stable identifier.
--
-- Demo credentials: every account uses the password `YouthRise2026!`.
-- Sign in as admin@youthrise.demo, facilitator@youthrise.demo,
-- mentor@youthrise.demo, amina@youthrise.demo, employer@youthrise.demo or
-- partner@youthrise.demo to see the role-specific workspaces.

-- ---------------------------------------------------------------------------
-- People
-- ---------------------------------------------------------------------------
INSERT IGNORE INTO users (id, full_name, email, phone, country, organization, job_title, bio, initials,
                          role, status, profile_complete, timezone, visibility, contact_permission,
                          email_verified_at, password_hash, joined_at, last_login_at, created_at, updated_at)
VALUES
('a0000000-0000-4000-8000-000000000001', 'Nadia Ssemakula', 'admin@youthrise.demo', '+256700000001', 'Uganda',
 'YouthRise', 'Programme Director',
 'Leads the YouthRise learning network and its safeguarding practice.', 'NS', 'ADMIN', 'ACTIVE', 100,
 'Africa/Kampala', 'HIDDEN', 0, UTC_TIMESTAMP(6),
 '$2a$12$rTHpIJdcTft1TWf8cIgMfurYmd2W97P.G9R7B4WnBjB/IXhMlgbfe',
 DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 400 DAY), DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 1 DAY),
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('a0000000-0000-4000-8000-000000000002', 'Aisha Nabukeera', 'facilitator@youthrise.demo', '+256700000002', 'Uganda',
 'YouthRise', 'Learning Facilitator',
 'Facilitates climate leadership cohorts and mentors youth-led community projects.', 'AN', 'FACILITATOR',
 'ACTIVE', 100, 'Africa/Kampala', 'LIMITED', 0, UTC_TIMESTAMP(6),
 '$2a$12$rTHpIJdcTft1TWf8cIgMfurYmd2W97P.G9R7B4WnBjB/IXhMlgbfe',
 DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 380 DAY), DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 2 DAY),
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('a0000000-0000-4000-8000-000000000003', 'Samuel Okiror', 'mentor@youthrise.demo', '+256700000003', 'Uganda',
 'Green Cities Alliance', 'Climate Mentor',
 'Mentors project teams on community organising and impact measurement.', 'SO', 'MENTOR', 'ACTIVE', 100,
 'Africa/Kampala', 'LIMITED', 1, UTC_TIMESTAMP(6),
 '$2a$12$rTHpIJdcTft1TWf8cIgMfurYmd2W97P.G9R7B4WnBjB/IXhMlgbfe',
 DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 300 DAY), DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 3 DAY),
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('a0000000-0000-4000-8000-000000000004', 'Amina Nakato', 'amina@youthrise.demo', '+256700000004', 'Uganda',
 'Kampala Youth Climate Network', 'Programme Coordinator',
 'Climate organiser working on cool schools and clean cooking.', 'AN', 'PARTICIPANT', 'ACTIVE', 100,
 'Africa/Kampala', 'PUBLIC', 1, UTC_TIMESTAMP(6),
 '$2a$12$rTHpIJdcTft1TWf8cIgMfurYmd2W97P.G9R7B4WnBjB/IXhMlgbfe',
 DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 220 DAY), DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 1 DAY),
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('a0000000-0000-4000-8000-000000000005', 'Brian Wasswa', 'brian@youthrise.demo', '+256700000005', 'Uganda',
 'Makerere University', 'Student',
 'Environmental science student exploring waste-to-value enterprise.', 'BW', 'PARTICIPANT', 'ACTIVE', 80,
 'Africa/Kampala', 'PUBLIC', 0, UTC_TIMESTAMP(6),
 '$2a$12$rTHpIJdcTft1TWf8cIgMfurYmd2W97P.G9R7B4WnBjB/IXhMlgbfe',
 DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 180 DAY), DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 4 DAY),
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('a0000000-0000-4000-8000-000000000006', 'Chloe Auma', 'chloe@youthrise.demo', '+256700000006', 'Uganda',
 'Gulu Youth Hub', 'Volunteer',
 'Youth hub volunteer building digital storytelling skills.', 'CA', 'PARTICIPANT', 'ACTIVE', 70,
 'Africa/Kampala', 'LIMITED', 0, UTC_TIMESTAMP(6),
 '$2a$12$rTHpIJdcTft1TWf8cIgMfurYmd2W97P.G9R7B4WnBjB/IXhMlgbfe',
 DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 150 DAY), DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 5 DAY),
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('a0000000-0000-4000-8000-000000000007', 'Daniel Kato', 'daniel@youthrise.demo', '+256700000007', 'Uganda',
 'Mbarara Youth Network', 'Community mobiliser',
 'New participant interested in water and sanitation.', 'DK', 'PARTICIPANT', 'ACTIVE', 55,
 'Africa/Kampala', 'LIMITED', 0, UTC_TIMESTAMP(6),
 '$2a$12$rTHpIJdcTft1TWf8cIgMfurYmd2W97P.G9R7B4WnBjB/IXhMlgbfe',
 DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 120 DAY), DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 6 DAY),
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('a0000000-0000-4000-8000-000000000008', 'Esther Namuli', 'esther@youthrise.demo', '+256700000008', 'Uganda',
 'Waste to Value Cooperative', 'Cooperative lead',
 'Cooperative lead turning organic waste into affordable compost.', 'EN', 'PARTICIPANT', 'ACTIVE', 95,
 'Africa/Kampala', 'LIMITED', 1, UTC_TIMESTAMP(6),
 '$2a$12$rTHpIJdcTft1TWf8cIgMfurYmd2W97P.G9R7B4WnBjB/IXhMlgbfe',
 DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 200 DAY), DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 2 DAY),
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('a0000000-0000-4000-8000-000000000009', 'Farouk Ssali', 'farouk@youthrise.demo', '+256700000009', 'Uganda',
 'Jinja Youth Association', 'Member',
 'Joined the climate cohort to strengthen local advocacy.', 'FS', 'PARTICIPANT', 'ACTIVE', 40,
 'Africa/Kampala', 'LIMITED', 0, UTC_TIMESTAMP(6),
 '$2a$12$rTHpIJdcTft1TWf8cIgMfurYmd2W97P.G9R7B4WnBjB/IXhMlgbfe',
 DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 90 DAY), DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 8 DAY),
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('a0000000-0000-4000-8000-000000000010', 'Grace Atim', 'employer@youthrise.demo', '+256700000010', 'Uganda',
 'Bright Future Energy', 'Talent Partner',
 'Recruits early-career climate and digital talent.', 'GA', 'EMPLOYER', 'ACTIVE', 100,
 'Africa/Kampala', 'LIMITED', 0, UTC_TIMESTAMP(6),
 '$2a$12$rTHpIJdcTft1TWf8cIgMfurYmd2W97P.G9R7B4WnBjB/IXhMlgbfe',
 DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 160 DAY), DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 3 DAY),
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('a0000000-0000-4000-8000-000000000011', 'Dr. Peter Muwanga', 'partner@youthrise.demo', '+256700000011', 'Uganda',
 'Makerere University', 'Partnerships Lead',
 'Coordinates university nominations and student placements.', 'PM', 'UNIVERSITY', 'ACTIVE', 100,
 'Africa/Kampala', 'LIMITED', 0, UTC_TIMESTAMP(6),
 '$2a$12$rTHpIJdcTft1TWf8cIgMfurYmd2W97P.G9R7B4WnBjB/IXhMlgbfe',
 DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 210 DAY), DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 7 DAY),
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6));

INSERT IGNORE INTO user_interests (user_id, interest) VALUES
('a0000000-0000-4000-8000-000000000004', 'Climate'),
('a0000000-0000-4000-8000-000000000004', 'Community organising'),
('a0000000-0000-4000-8000-000000000005', 'Climate'),
('a0000000-0000-4000-8000-000000000005', 'Circular economy'),
('a0000000-0000-4000-8000-000000000008', 'Circular economy');

INSERT IGNORE INTO user_skills (user_id, skill) VALUES
('a0000000-0000-4000-8000-000000000004', 'Community organising'),
('a0000000-0000-4000-8000-000000000004', 'Data storytelling'),
('a0000000-0000-4000-8000-000000000004', 'Facilitation'),
('a0000000-0000-4000-8000-000000000005', 'Waste management'),
('a0000000-0000-4000-8000-000000000005', 'Research'),
('a0000000-0000-4000-8000-000000000008', 'Composting'),
('a0000000-0000-4000-8000-000000000008', 'Cooperative management');

INSERT IGNORE INTO consents (id, user_id, type, granted, policy_version, recorded_at, created_at, updated_at) VALUES
('d0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000004', 'PRIVACY_POLICY', 1, '2026-10', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('d0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000004', 'COMMUNICATIONS', 1, '2026-10', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('d0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000005', 'PRIVACY_POLICY', 1, '2026-10', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('d0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000005', 'COMMUNICATIONS', 1, '2026-10', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('d0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000008', 'PRIVACY_POLICY', 1, '2026-10', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('d0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000008', 'COMMUNICATIONS', 0, '2026-10', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6));

-- ---------------------------------------------------------------------------
-- Programmes and curriculum
-- ---------------------------------------------------------------------------
INSERT IGNORE INTO programmes (id, title, summary, description, level, theme, duration_weeks, commitment,
                                mode, capacity, status, starts_at, ends_at, cohort, facilitator_id,
                                created_at, updated_at)
VALUES
('b0000000-0000-4000-8000-000000000001', 'Climate Leadership Lab',
 'A practical lab for young leaders designing community climate responses.',
 'Work with a mentor and a peer team to turn a local climate concern into a measurable project. The lab combines live exchange sessions, applied activities and a final impact plan.',
 2, 'Climate', 8, '4 hrs / week', 'Hybrid · Kampala', 24, 'OPEN',
 DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 21 DAY), DATE_ADD(UTC_TIMESTAMP(6), INTERVAL 35 DAY), 'Cohort 7',
 'a0000000-0000-4000-8000-000000000002', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('b0000000-0000-4000-8000-000000000002', 'Digital Skills Accelerator',
 'Build the digital confidence to tell your project story and work safely online.',
 'A six-week online accelerator covering digital safety, collaboration tools and data storytelling for community projects.',
 1, 'Digital', 6, '3 hrs / week', 'Online', 30, 'WAITLIST',
 DATE_ADD(UTC_TIMESTAMP(6), INTERVAL 14 DAY), DATE_ADD(UTC_TIMESTAMP(6), INTERVAL 56 DAY), 'Cohort 8',
 'a0000000-0000-4000-8000-000000000002', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6));

INSERT IGNORE INTO programme_eligibility (programme_id, position, value) VALUES
('b0000000-0000-4000-8000-000000000001', 0, 'Aged 18–30 and based in Uganda'),
('b0000000-0000-4000-8000-000000000001', 1, 'Active in a community or youth-led initiative'),
('b0000000-0000-4000-8000-000000000002', 0, 'Aged 18–30 with basic smartphone or laptop access');

INSERT IGNORE INTO programme_outcomes (programme_id, position, value) VALUES
('b0000000-0000-4000-8000-000000000001', 0, 'Design a community climate project with clear indicators'),
('b0000000-0000-4000-8000-000000000001', 1, 'Facilitate inclusive community listening sessions'),
('b0000000-0000-4000-8000-000000000002', 0, 'Publish a safe, accessible project story online');

INSERT IGNORE INTO programme_skills (programme_id, position, value) VALUES
('b0000000-0000-4000-8000-000000000001', 0, 'Community organising'),
('b0000000-0000-4000-8000-000000000001', 1, 'Impact measurement'),
('b0000000-0000-4000-8000-000000000001', 2, 'Facilitation'),
('b0000000-0000-4000-8000-000000000002', 0, 'Digital storytelling'),
('b0000000-0000-4000-8000-000000000002', 1, 'Online safety');

INSERT IGNORE INTO learning_modules (id, programme_id, title, summary, position, status, duration_mins,
                                     created_at, updated_at)
VALUES
('c0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001',
 'Foundations of climate leadership', 'Understand the local climate context and your leadership role.', 1,
 'PUBLISHED', 90, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('c0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001',
 'Community organising', 'Build coalitions and facilitate inclusive listening sessions.', 2,
 'PUBLISHED', 120, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('c0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001',
 'Measuring impact', 'Choose indicators and tell a credible story with data.', 3,
 'PUBLISHED', 75, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('c0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000002',
 'Digital foundations', 'Work safely and collaborate with your team online.', 1,
 'PUBLISHED', 60, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6));

INSERT IGNORE INTO lessons (id, module_id, title, lesson_type, duration_mins, summary, position,
                            resource_label, resource_size, created_at, updated_at)
VALUES
('e0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001',
 'Why climate leadership matters', 'READING', 20,
 'Connect global climate trends to the realities of your community.', 1,
 'Climate leadership primer.pdf', '1.4 MB', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('e0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000001',
 'Mapping your climate context', 'ACTIVITY', 30,
 'Use a simple stakeholder and hazard map to understand your starting point.', 2,
 NULL, NULL, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('e0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000002',
 'Building a community coalition', 'VIDEO', 25,
 'Learn how trusted local relationships make climate action durable.', 1,
 'Coalition building (video)', '12 min', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('e0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000002',
 'Facilitating a listening circle', 'ACTIVITY', 40,
 'Plan and facilitate a listening circle that includes quieter voices.', 2,
 'Listening circle guide.pdf', '640 KB', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('e0000000-0000-4000-8000-000000000005', 'c0000000-0000-4000-8000-000000000003',
 'Choosing indicators that matter', 'READING', 25,
 'Pick a small set of indicators your team can actually measure.', 1,
 NULL, NULL, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('e0000000-0000-4000-8000-000000000006', 'c0000000-0000-4000-8000-000000000003',
 'Telling the story with data', 'QUIZ', 20,
 'Check your understanding of honest, accessible data storytelling.', 2,
 NULL, NULL, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('e0000000-0000-4000-8000-000000000007', 'c0000000-0000-4000-8000-000000000004',
 'Working safely online', 'READING', 15,
 'Protect your accounts, your team and the people you work with.', 1,
 'Online safety checklist.pdf', '320 KB', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6));

INSERT IGNORE INTO lesson_body (lesson_id, position, paragraph) VALUES
('e0000000-0000-4000-8000-000000000001', 0, 'Climate leadership starts with noticing what is already changing around you: rainfall patterns, heat, water access and the ways people cope.'),
('e0000000-0000-4000-8000-000000000001', 1, 'A leader does not need every answer. The work is to convene the right people, ask honest questions and keep momentum over time.'),
('e0000000-0000-4000-8000-000000000002', 0, 'Draw a map with three circles: people affected, people with influence and people already taking action. Look for overlaps and gaps.'),
('e0000000-0000-4000-8000-000000000003', 0, 'Coalitions last when they share a clear purpose and distribute work fairly. Start with a small group that trusts one another.'),
('e0000000-0000-4000-8000-000000000004', 0, 'A listening circle is not a debate. Set agreements, invite each person to speak once, and record themes rather than attributing quotes.'),
('e0000000-0000-4000-8000-000000000005', 0, 'Choose indicators that are useful, feasible and safe to collect. Two good indicators beat ten that nobody maintains.'),
('e0000000-0000-4000-8000-000000000006', 0, 'When you present data, state the period, the sample and the limitation. Avoid implying causation from a simple before-and-after.'),
('e0000000-0000-4000-8000-000000000007', 0, 'Use unique passwords, turn on two-factor authentication and never share participant information in public channels.');

INSERT IGNORE INTO lesson_completions (id, user_id, lesson_id, programme_id, completed_at, created_at, updated_at)
VALUES
('f0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000004', 'e0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 18 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('f0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000004', 'e0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 17 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('f0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000004', 'e0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 12 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('f0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000004', 'e0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 11 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('f0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000004', 'e0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000001', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 6 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('f0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000004', 'e0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000001', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 5 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('f0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000008', 'e0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 19 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('f0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000008', 'e0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 18 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('f0000000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000008', 'e0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 13 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('f0000000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000008', 'e0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 12 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('f0000000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000008', 'e0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000001', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 7 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('f0000000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000008', 'e0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000001', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 6 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('f0000000-0000-4000-8000-000000000013', 'a0000000-0000-4000-8000-000000000005', 'e0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 16 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('f0000000-0000-4000-8000-000000000014', 'a0000000-0000-4000-8000-000000000005', 'e0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 15 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('f0000000-0000-4000-8000-000000000015', 'a0000000-0000-4000-8000-000000000005', 'e0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 9 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('f0000000-0000-4000-8000-000000000016', 'a0000000-0000-4000-8000-000000000005', 'e0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 8 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('f0000000-0000-4000-8000-000000000017', 'a0000000-0000-4000-8000-000000000006', 'e0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 14 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('f0000000-0000-4000-8000-000000000018', 'a0000000-0000-4000-8000-000000000006', 'e0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 13 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('f0000000-0000-4000-8000-000000000019', 'a0000000-0000-4000-8000-000000000007', 'e0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 11 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6));

INSERT IGNORE INTO enrolments (id, programme_id, user_id, status, progress, last_lesson_id, enrolled_at, completed_at,
                               created_at, updated_at)
VALUES
('11000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000004', 'COMPLETED', 100, 'e0000000-0000-4000-8000-000000000006', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 24 DAY), DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 5 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('11000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000005', 'ACTIVE', 60, 'e0000000-0000-4000-8000-000000000004', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 20 DAY), NULL, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('11000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000006', 'ACTIVE', 35, 'e0000000-0000-4000-8000-000000000002', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 18 DAY), NULL, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('11000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000007', 'ACTIVE', 15, 'e0000000-0000-4000-8000-000000000001', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 15 DAY), NULL, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('11000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000008', 'COMPLETED', 100, 'e0000000-0000-4000-8000-000000000006', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 25 DAY), DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 6 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('11000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000009', 'ACTIVE', 0, NULL, DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 12 DAY), NULL, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('11000000-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000004', 'ACTIVE', 20, 'e0000000-0000-4000-8000-000000000007', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 10 DAY), NULL, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('11000000-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000005', 'WAITLISTED', 0, NULL, DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 9 DAY), NULL, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6));

-- ---------------------------------------------------------------------------
-- Teams, projects and mentorship
-- ---------------------------------------------------------------------------
INSERT IGNORE INTO teams (id, programme_id, name, theme, mentor_id, capacity, created_at, updated_at) VALUES
('22000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001',
 'Green Kampala Collective', 'Climate', 'a0000000-0000-4000-8000-000000000003', 6, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('22000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001',
 'Waste to Value', 'Circular economy', 'a0000000-0000-4000-8000-000000000003', 6, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('22000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000002',
 'Digital Storytellers', 'Digital', 'a0000000-0000-4000-8000-000000000003', 6, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6));

INSERT IGNORE INTO team_members (team_id, user_id) VALUES
('22000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000004'),
('22000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000005'),
('22000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000006'),
('22000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000007'),
('22000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000008'),
('22000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000009'),
('22000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000004'),
('22000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000005');

INSERT IGNORE INTO team_messages (id, team_id, author_id, body, sent_at, created_at, updated_at) VALUES
('23000000-0000-4000-8000-000000000001', '22000000-0000-4000-8000-000000000001',
 'a0000000-0000-4000-8000-000000000004',
 'Sharing the school audit checklist before Thursday. Add anything your school needs.', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 2 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('23000000-0000-4000-8000-000000000002', '22000000-0000-4000-8000-000000000001',
 'a0000000-0000-4000-8000-000000000005',
 'I have added a question on shaded walking routes. The survey is ready for review.', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 1 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6));

INSERT IGNORE INTO projects (id, team_id, title, problem, theme, summary, status, created_at, updated_at) VALUES
('24000000-0000-4000-8000-000000000001', '22000000-0000-4000-8000-000000000001',
 'Cool Schools Kampala',
 'Classrooms overheat and outdoor play is unsafe during the hottest months.',
 'Climate',
 'A school-led cooling plan combining shade trees, ventilation and a heat-safe timetable.',
 'ACTIVE', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('24000000-0000-4000-8000-000000000002', '22000000-0000-4000-8000-000000000002',
 'Waste to Value Cooperative',
 'Market organic waste is dumped in drains, causing flooding and methane emissions.',
 'Circular economy',
 'A cooperative collecting market waste and producing compost for urban farmers.',
 'UNDER_REVIEW', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('24000000-0000-4000-8000-000000000003', '22000000-0000-4000-8000-000000000003',
 'Digital Storytellers',
 'Community projects lack accessible digital stories that funders and neighbours can find.',
 'Digital',
 'A shared storytelling toolkit and publishing plan for youth-led projects.',
 'DRAFT', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6));

INSERT IGNORE INTO project_objectives (project_id, position, value) VALUES
('24000000-0000-4000-8000-000000000001', 0, 'Complete heat and shade audits in three schools'),
('24000000-0000-4000-8000-000000000001', 1, 'Co-design a heat-safe timetable with students and staff'),
('24000000-0000-4000-8000-000000000001', 2, 'Plant and maintain 120 shade trees'),
('24000000-0000-4000-8000-000000000002', 0, 'Collect baseline waste volumes from two markets'),
('24000000-0000-4000-8000-000000000002', 1, 'Train 20 cooperative members in safe composting');

INSERT IGNORE INTO milestones (id, project_id, title, description, due_at, status, evidence, feedback, position,
                               created_at, updated_at)
VALUES
('25000000-0000-4000-8000-000000000001', '24000000-0000-4000-8000-000000000001',
 'Stakeholder map', 'Map students, staff, local leaders and businesses affected by school heat.', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 10 DAY),
 'APPROVED', 'stakeholder-map.pdf',
 'Clear map with a realistic plan for the first listening circle.', 1, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('25000000-0000-4000-8000-000000000002', '24000000-0000-4000-8000-000000000001',
 'Pilot cooling audit', 'Run the audit in one school and agree the three priority actions.', DATE_ADD(UTC_TIMESTAMP(6), INTERVAL 7 DAY),
 'IN_PROGRESS', NULL, NULL, 2, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('25000000-0000-4000-8000-000000000003', '24000000-0000-4000-8000-000000000001',
 'Community showcase', 'Present findings and the draft cooling plan to the school community.', DATE_ADD(UTC_TIMESTAMP(6), INTERVAL 28 DAY),
 'NOT_STARTED', NULL, NULL, 3, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('25000000-0000-4000-8000-000000000004', '24000000-0000-4000-8000-000000000002',
 'Waste baseline survey', 'Measure daily organic waste volumes at two markets.', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 3 DAY),
 'SUBMITTED', 'waste-baseline.xlsx', NULL, 1, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('25000000-0000-4000-8000-000000000005', '24000000-0000-4000-8000-000000000002',
 'Cooperative business plan', 'Agree pricing, roles and a safe composting process.', DATE_ADD(UTC_TIMESTAMP(6), INTERVAL 14 DAY),
 'NOT_STARTED', NULL, NULL, 2, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('25000000-0000-4000-8000-000000000006', '24000000-0000-4000-8000-000000000003',
 'Audience research', 'Interview five community projects about their current communications.', DATE_ADD(UTC_TIMESTAMP(6), INTERVAL 10 DAY),
 'NOT_STARTED', NULL, NULL, 1, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6));

INSERT IGNORE INTO project_resources (id, project_id, label, kind, added_by, added_at, created_at, updated_at) VALUES
('26000000-0000-4000-8000-000000000001', '24000000-0000-4000-8000-000000000001',
 'School heat audit template', 'Template', 'Samuel Okiror', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 6 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('26000000-0000-4000-8000-000000000002', '24000000-0000-4000-8000-000000000001',
 'Kampala heat and shade data', 'Dataset', 'Amina Nakato', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 4 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6));

INSERT IGNORE INTO submissions (id, project_id, team_id, milestone_id, title, file_name, stored_name, content_type,
                                 size_bytes, note, submitted_by, submitted_at, status, reviewer_id, score, max_score,
                                 feedback, revision_requested, created_at, updated_at)
VALUES
('27000000-0000-4000-8000-000000000001', '24000000-0000-4000-8000-000000000001',
 '22000000-0000-4000-8000-000000000001', '25000000-0000-4000-8000-000000000001',
 'Stakeholder map', 'stakeholder-map.pdf', 'demo-stakeholder-map.pdf', 'application/pdf', 284000,
 'Mapped 34 stakeholders across three schools and agreed the first listening circle.', 'a0000000-0000-4000-8000-000000000004',
 DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 9 DAY), 'APPROVED', 'a0000000-0000-4000-8000-000000000003', 18, 20,
 'Strong map and a realistic next step. Add a named contact for the district office before the showcase.', NULL,
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('27000000-0000-4000-8000-000000000002', '24000000-0000-4000-8000-000000000002',
 '22000000-0000-4000-8000-000000000002', '25000000-0000-4000-8000-000000000004',
 'Waste baseline survey', 'waste-baseline.xlsx', 'demo-waste-baseline.xlsx',
 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 96000,
 'Two-week baseline from both markets with daily volumes and photos.', 'a0000000-0000-4000-8000-000000000008',
 DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 2 DAY), 'SUBMITTED', NULL, NULL, 20, NULL, NULL,
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6));

INSERT IGNORE INTO mentor_feedback (id, team_id, author_id, milestone_id, body, resolved, created_at, updated_at) VALUES
('28000000-0000-4000-8000-000000000001', '22000000-0000-4000-8000-000000000001',
 'a0000000-0000-4000-8000-000000000003', '25000000-0000-4000-8000-000000000001',
 'Strong start. Bring one student and one staff member to the next planning call so the timetable reflects both needs.',
 1, DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 8 DAY), UTC_TIMESTAMP(6)),
('28000000-0000-4000-8000-000000000002', '22000000-0000-4000-8000-000000000002',
 'a0000000-0000-4000-8000-000000000003', NULL,
 'Check the composting site lease before you commit to volumes. Keep the community liaison informed about smell and traffic.',
 0, DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 1 DAY), UTC_TIMESTAMP(6));

-- ---------------------------------------------------------------------------
-- Exchange sessions, notifications
-- ---------------------------------------------------------------------------
INSERT IGNORE INTO exchange_sessions (id, programme_id, title, starts_at, duration_mins, timezone, facilitator_id,
                                      capacity, description, meeting_url, status, created_at, updated_at)
VALUES
('29000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001',
 'Live briefing: measuring community impact', DATE_ADD(UTC_TIMESTAMP(6), INTERVAL 3 DAY), 90, 'Africa/Kampala',
 'a0000000-0000-4000-8000-000000000002', 40,
 'A practical walkthrough of indicators, data collection and honest reporting.',
 'https://meet.example.org/climate-impact', 'UPCOMING', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('29000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001',
 'Peer exchange: local climate campaigns', DATE_ADD(UTC_TIMESTAMP(6), INTERVAL 10 DAY), 75, 'Africa/Kampala',
 'a0000000-0000-4000-8000-000000000002', 30,
 'Teams share one campaign, one challenge and one ask for the group.',
 'https://meet.example.org/climate-peer-exchange', 'UPCOMING', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('29000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000002',
 'Digital tools clinic', DATE_ADD(UTC_TIMESTAMP(6), INTERVAL 5 DAY), 60, 'Africa/Kampala',
 'a0000000-0000-4000-8000-000000000002', 25,
 'Bring one digital tool you want to use and we will test it together.',
 'https://meet.example.org/digital-clinic', 'UPCOMING', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('29000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001',
 'Cohort welcome and orientation', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 7 DAY), 60, 'Africa/Kampala',
 'a0000000-0000-4000-8000-000000000002', 40,
 'An orientation to the lab, its expectations and the support available.',
 'https://meet.example.org/climate-welcome', 'COMPLETED', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6));

INSERT IGNORE INTO session_registrations (id, session_id, user_id, registered_at, created_at, updated_at) VALUES
('2a000000-0000-4000-8000-000000000001', '29000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000004', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 4 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('2a000000-0000-4000-8000-000000000002', '29000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000005', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 4 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('2a000000-0000-4000-8000-000000000003', '29000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000006', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 3 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('2a000000-0000-4000-8000-000000000004', '29000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000004', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 2 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('2a000000-0000-4000-8000-000000000005', '29000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000008', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 2 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('2a000000-0000-4000-8000-000000000006', '29000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000004', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 12 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6));

INSERT IGNORE INTO notifications (id, user_id, title, body, href, kind, read_at, created_at, updated_at) VALUES
('2b000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000004',
 'Your certificate is ready', 'Your Climate Leadership Lab certificate is now available to download.',
 '/app/certificates', 'APPROVAL', NULL, DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 4 DAY), UTC_TIMESTAMP(6)),
('2b000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000004',
 'Session confirmed', 'You are registered for the impact measurement briefing.',
 '/app/sessions', 'SESSION', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 1 DAY), DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 4 DAY), UTC_TIMESTAMP(6)),
('2b000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000005',
 'Assessment waiting for review', 'Your climate context reflection has been submitted.',
 '/app/assessments', 'SYSTEM', NULL, DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 1 DAY), UTC_TIMESTAMP(6));

-- ---------------------------------------------------------------------------
-- Assessments, attempts and certificates
-- ---------------------------------------------------------------------------
INSERT IGNORE INTO assessments (id, programme_id, title, type, description, opens_at, due_at, max_score,
                                 max_attempts, published, created_at, updated_at)
VALUES
('2c000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001',
 'Climate context reflection', 'REFLECTION',
 'Reflect on the climate pressures in your community and the assets you can build on.',
 DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 7 DAY), DATE_ADD(UTC_TIMESTAMP(6), INTERVAL 14 DAY), 100, 2, 1,
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('2c000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001',
 'Community impact plan', 'FINAL',
 'Submit the outline of your team project, its indicators and its community safeguards.',
 DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 3 DAY), DATE_ADD(UTC_TIMESTAMP(6), INTERVAL 30 DAY), 100, 1, 1,
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('2c000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000002',
 'Digital safety quiz', 'QUIZ',
 'Check your understanding of account safety, consent and accessible publishing.',
 DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 2 DAY), DATE_ADD(UTC_TIMESTAMP(6), INTERVAL 20 DAY), 100, 1, 1,
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6));

INSERT IGNORE INTO assessment_instructions (assessment_id, position, value) VALUES
('2c000000-0000-4000-8000-000000000001', 0, 'Use at least one local example from your own community.'),
('2c000000-0000-4000-8000-000000000001', 1, 'Write between 400 and 800 words.'),
('2c000000-0000-4000-8000-000000000002', 0, 'Describe the problem, the team and the change you expect.'),
('2c000000-0000-4000-8000-000000000002', 1, 'Name at least two indicators and how you will collect them.'),
('2c000000-0000-4000-8000-000000000003', 0, 'Answer all ten questions in your own words.');

INSERT IGNORE INTO assessment_criteria (assessment_id, position, criterion_key, label, description, max_score) VALUES
('2c000000-0000-4000-8000-000000000001', 0, 'context', 'Local context', 'Specific, accurate description of local climate pressures.', 25),
('2c000000-0000-4000-8000-000000000001', 1, 'assets', 'Community assets', 'Identifies credible people, skills and institutions to build on.', 25),
('2c000000-0000-4000-8000-000000000001', 2, 'reflection', 'Critical reflection', 'Shows honest reflection on the learner''s own role and limits.', 25),
('2c000000-0000-4000-8000-000000000001', 3, 'writing', 'Clarity', 'Clear, well-structured writing for a community audience.', 25),
('2c000000-0000-4000-8000-000000000002', 0, 'problem', 'Problem definition', 'The problem is specific and grounded in evidence.', 20),
('2c000000-0000-4000-8000-000000000002', 1, 'indicators', 'Indicators', 'Indicators are useful, feasible and safe to collect.', 30),
('2c000000-0000-4000-8000-000000000002', 2, 'safeguards', 'Community safeguards', 'Consent, accessibility and risk are addressed.', 30),
('2c000000-0000-4000-8000-000000000002', 3, 'feasibility', 'Feasibility', 'The plan matches the team''s time and resources.', 20),
('2c000000-0000-4000-8000-000000000003', 0, 'safety', 'Digital safety', 'Correct answers on account and data safety.', 50),
('2c000000-0000-4000-8000-000000000003', 1, 'consent', 'Consent and publishing', 'Correct answers on consent and accessible publishing.', 50);

INSERT IGNORE INTO assessment_attempts (id, assessment_id, user_id, attempt_no, body, submitted_at, status, score,
                                        feedback, grader_id, graded_at, created_at, updated_at)
VALUES
('2d000000-0000-4000-8000-000000000001', '2c000000-0000-4000-8000-000000000001',
 'a0000000-0000-4000-8000-000000000004', 1,
 'In Bwaise, heavier rain and blocked drains now flood the market twice a season. At the same time, landlords are planting shade trees and the market association already coordinates clean-up days. My role is to connect the school heat work with the market association so both groups share data and volunteers.',
 DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 6 DAY), 'GRADED', 88,
 'A grounded reflection with a clear next step. Strengthen the evidence on how the two groups will share data.',
 'a0000000-0000-4000-8000-000000000002', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 2 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('2d000000-0000-4000-8000-000000000002', '2c000000-0000-4000-8000-000000000002',
 'a0000000-0000-4000-8000-000000000004', 1,
 'Cool Schools Kampala will work with three schools to audit heat and shade, agree a heat-safe timetable and plant 120 trees. Indicators: number of classrooms with afternoon shade, student-reported heat discomfort, and trees surviving after three months. Safeguards: student consent for quotes, accessible sessions and a named safeguarding contact.',
 DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 5 DAY), 'GRADED', 92,
 'A realistic plan with sensible safeguards. Confirm who maintains the trees during the holidays.',
 'a0000000-0000-4000-8000-000000000002', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 2 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('2d000000-0000-4000-8000-000000000003', '2c000000-0000-4000-8000-000000000001',
 'a0000000-0000-4000-8000-000000000008', 1,
 'Our cooperative works beside Nakawa market where organic waste blocks the drainage every rainy season. Traders already separate some waste, and the market chair is willing to trial a collection point. My role is to make the trial safe and fair for the people who handle the waste.',
 DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 6 DAY), 'GRADED', 95,
 'Excellent use of local detail and a clear role for the cooperative.',
 'a0000000-0000-4000-8000-000000000002', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 3 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('2d000000-0000-4000-8000-000000000004', '2c000000-0000-4000-8000-000000000002',
 'a0000000-0000-4000-8000-000000000008', 1,
 'Waste to Value will collect organic waste from two markets, train twenty members in safe composting and sell compost to urban farmers. Indicators: tonnes collected per week, compost sold per month, and member income. Safeguards: protective equipment, a complaints channel and a written site agreement.',
 DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 5 DAY), 'GRADED', 90,
 'Strong plan. Add a contingency for the site lease.',
 'a0000000-0000-4000-8000-000000000002', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 3 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('2d000000-0000-4000-8000-000000000005', '2c000000-0000-4000-8000-000000000001',
 'a0000000-0000-4000-8000-000000000005', 1,
 'Kampala''s heat is uneven: informal settlements have less shade and more metal roofing. I am still gathering evidence from two schools and will add the district officer''s view before the deadline.',
 DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 1 DAY), 'SUBMITTED', NULL, NULL, NULL, NULL, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6));

INSERT IGNORE INTO certificates (id, programme_id, participant_id, code, status, issued_at, revoked_at,
                                  verification_note, issued_by, created_at, updated_at)
VALUES
('2e000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001',
 'a0000000-0000-4000-8000-000000000004', 'YEP-7K2M-9QRA-4TXB', 'VALID',
 DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 4 DAY), NULL,
 'Issued after verified completion of the programme and its required assessments.',
 'a0000000-0000-4000-8000-000000000002', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('2e000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001',
 'a0000000-0000-4000-8000-000000000008', 'YEP-3F8N-6WPD-2JHC', 'VALID',
 DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 5 DAY), NULL,
 'Issued after verified completion of the programme and its required assessments.',
 'a0000000-0000-4000-8000-000000000002', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6));

-- ---------------------------------------------------------------------------
-- Governance, partner and employer workspaces
-- ---------------------------------------------------------------------------
INSERT IGNORE INTO incidents (id, reference, category, severity, status, reported_at, reported_by, assigned_to,
                              summary, created_at, updated_at)
VALUES
('2f000000-0000-4000-8000-000000000001', 'INC-2026-014', 'Safeguarding', 'HIGH', 'INVESTIGATING',
 DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 2 DAY), 'a0000000-0000-4000-8000-000000000002',
 'a0000000-0000-4000-8000-000000000001',
 'A participant reported an unsafe private message from an external contact. The account is blocked and the participant has been offered support.',
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('2f000000-0000-4000-8000-000000000002', 'INC-2026-011', 'Data access', 'MEDIUM', 'TRIAGED',
 DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 6 DAY), 'a0000000-0000-4000-8000-000000000011', NULL,
 'A partner account requested an export that included learner contact details. The request was declined pending a data-sharing agreement.',
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6));

INSERT IGNORE INTO incident_notes (incident_id, position, author_name, body, noted_at) VALUES
('2f000000-0000-4000-8000-000000000001', 0, 'facilitator@youthrise.demo',
 'Participant confirmed the contact was not part of the programme. Details recorded with consent.',
 DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 1 DAY)),
('2f000000-0000-4000-8000-000000000002', 0, 'admin@youthrise.demo',
 'No data was shared. Requesting the partner to complete the data-sharing checklist.',
 DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 6 DAY));

INSERT IGNORE INTO incident_actions (incident_id, position, action, actor_name, acted_at) VALUES
('2f000000-0000-4000-8000-000000000001', 0, 'Blocked the external account and assigned the case to the safeguarding lead.',
 'admin@youthrise.demo', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 1 DAY)),
('2f000000-0000-4000-8000-000000000002', 0, 'Declined the export and requested a data-sharing agreement.',
 'admin@youthrise.demo', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 5 DAY));

INSERT IGNORE INTO privacy_requests (id, reference, requester_id, type, received_at, status, assignee_id, note,
                                      created_at, updated_at)
VALUES
('30000000-0000-4000-8000-000000000001', 'PRQ-2026-032', 'a0000000-0000-4000-8000-000000000004', 'ACCESS',
 DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 3 DAY), 'IN_PROGRESS', 'a0000000-0000-4000-8000-000000000001',
 'Identity verified. Compiling the learning and certificate record for review.',
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('30000000-0000-4000-8000-000000000002', 'PRQ-2026-030', 'a0000000-0000-4000-8000-000000000005', 'CORRECTION',
 DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 8 DAY), 'RECEIVED', NULL,
 'Request to update the organisation on the learner profile.',
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6));

INSERT IGNORE INTO nominations (id, institution, learner_name, learner_email, programme_id, nominated_by,
                                nominated_at, status, note, created_at, updated_at)
VALUES
('31000000-0000-4000-8000-000000000001', 'Makerere University', 'Grace Achieng',
 'grace.achieng@example.org', 'b0000000-0000-4000-8000-000000000001',
 'a0000000-0000-4000-8000-000000000011', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 4 DAY), 'INVITED',
 'Final-year environmental science student with a strong community project.',
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('31000000-0000-4000-8000-000000000002', 'Kampala International University', 'Peter Okello',
 'peter.okello@example.org', 'b0000000-0000-4000-8000-000000000002',
 'a0000000-0000-4000-8000-000000000011', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 2 DAY), 'NOMINATED',
 'Interested in the digital accelerator as part of a placement.',
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6));

INSERT IGNORE INTO talent_profiles (id, user_id, headline, project_summary, availability, created_at, updated_at) VALUES
('32000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000004',
 'Climate data storyteller', 'Led a school cooling audit and turned the findings into an accessible community report. Looking for a role that combines climate action with communications.',
 'OPEN', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('32000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000008',
 'Circular economy organiser', 'Built a market waste baseline and a cooperative composting plan with twenty members. Open to operations and partnership roles.',
 'OPEN', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('32000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000005',
 'Environmental science student', 'Researching urban waste flows and supporting a youth-led composting pilot.',
 'UNDISCLOSED', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6));

INSERT IGNORE INTO talent_portfolio_items (profile_id, position, title, theme, summary) VALUES
('32000000-0000-4000-8000-000000000001', 0, 'Cool Schools Kampala', 'Climate',
 'A school-led heat and shade audit that produced a practical cooling plan for three schools.'),
('32000000-0000-4000-8000-000000000001', 1, 'Community climate stories', 'Communications',
 'A set of accessible stories explaining local climate data to families and local leaders.'),
('32000000-0000-4000-8000-000000000002', 0, 'Waste to Value Cooperative', 'Circular economy',
 'A cooperative model turning market organic waste into affordable compost for urban farmers.'),
('32000000-0000-4000-8000-000000000003', 0, 'Market waste baseline', 'Research',
 'Two-week measurement of organic waste volumes across two Kampala markets.');

INSERT IGNORE INTO saved_talent (id, employer_id, user_id, saved_at, created_at, updated_at) VALUES
('33000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000010',
 'a0000000-0000-4000-8000-000000000004', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 2 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)),
('33000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000010',
 'a0000000-0000-4000-8000-000000000008', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 1 DAY), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6));

INSERT IGNORE INTO introductions (id, employer_id, talent_id, note, requested_at, status, created_at, updated_at) VALUES
('34000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000010',
 'a0000000-0000-4000-8000-000000000008',
 'We are recruiting a community operations lead for our composting pilot and would like to meet Esther.',
 DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 1 DAY), 'requested', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6));

INSERT IGNORE INTO briefing_requests (id, partner_id, programme_id, note, requested_at, status, created_at, updated_at) VALUES
('35000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000011',
 'b0000000-0000-4000-8000-000000000001',
 'Our placement office would like a short briefing on the Cohort 7 schedule and learner expectations.',
 DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 3 DAY), 'requested', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6));

INSERT IGNORE INTO audit_logs (id, actor_id, actor_email, actor_role, action, target, outcome, metadata,
                               ip_address, created_at, updated_at)
VALUES
('36000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'admin@youthrise.demo',
 'ADMIN', 'CERTIFICATE_ISSUED', 'certificate:2e000000-0000-4000-8000-000000000001', 'success', NULL,
 '127.0.0.1', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 4 DAY), UTC_TIMESTAMP(6)),
('36000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'facilitator@youthrise.demo',
 'FACILITATOR', 'ASSESSMENT_GRADED', 'assessment:2c000000-0000-4000-8000-000000000001', 'success', NULL,
 '127.0.0.1', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 2 DAY), UTC_TIMESTAMP(6)),
('36000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'admin@youthrise.demo',
 'ADMIN', 'INCIDENT_UPDATED', 'incident:2f000000-0000-4000-8000-000000000001', 'success', NULL,
 '127.0.0.1', DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 1 DAY), UTC_TIMESTAMP(6));
