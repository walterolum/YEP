-- V12 — Phase 2b seed: the remaining Tech & Digital courses (Python, Java, SQL, mobile,
-- data analysis, AI basics, cybersecurity, UI/UX, digital marketing), their career paths,
-- attribution and first modules/lessons. All lesson text is original YEP writing; the cited
-- open resources are the sources the lessons are adapted from and are linked on each course page.

-- ---------------------------------------------------------------------------
-- 1. Career paths added to Tech & Digital
-- ---------------------------------------------------------------------------
INSERT INTO career_paths (academy_id, title, slug, summary, icon, sort_order, published)
SELECT a.id, v.title, v.slug, v.summary, v.icon, v.sort_order, 1
FROM academies a
JOIN (
    SELECT 'data-and-ai' AS slug, 'Data & AI' AS title,
           'Turn data into decisions and use AI tools honestly.' AS summary,
           '🤖' AS icon, 20 AS sort_order
    UNION ALL SELECT 'cybersecurity', 'Cybersecurity', 'Keep people, accounts and devices safe.', '🛡️', 30
    UNION ALL SELECT 'product-design', 'Product & Design', 'Design usable products and test them with real people.', '🎨', 40
    UNION ALL SELECT 'digital-marketing', 'Digital Marketing', 'Reach the right audience and measure what worked.', '📣', 50
) v ON a.slug = 'tech-digital'
WHERE NOT EXISTS (SELECT 1 FROM career_paths p WHERE p.slug = v.slug);

-- ---------------------------------------------------------------------------
-- 2. Nine courses with full licensing metadata
-- ---------------------------------------------------------------------------
INSERT INTO courses (career_path_id, code, title, slug, summary, level, duration_hours, icon,
                     sort_order, published, language, certificate_available,
                     source_name, source_url, licence, licence_url, author, attribution_text, review_status)
SELECT p.id, v.code, v.title, v.slug, v.summary, 1, v.hours, v.icon, v.sort_order, 1, 'en', 1,
       v.source_name, v.source_url, v.licence, v.licence_url, v.author, v.attribution_text, 'PUBLISHED'
FROM career_paths p
JOIN (
    SELECT 'software-development' AS path_slug, 'TECH-PY-L1' AS code,
           'Python Programming Fundamentals' AS title, 'python-programming-fundamentals' AS slug,
           'Write scripts that read data, make decisions and save results.' AS summary,
           20 AS hours, '🐍' AS icon, 20 AS sort_order,
           'freeCodeCamp — Scientific Computing with Python' AS source_name,
           'https://www.freecodecamp.org/learn/scientific-computing-with-python/' AS source_url,
           'CC BY-SA 4.0' AS licence, 'https://creativecommons.org/licenses/by-sa/4.0/' AS licence_url,
           'freeCodeCamp contributors; adapted by YEP' AS author,
           'Adapted from the freeCodeCamp Scientific Computing with Python curriculum (CC BY-SA 4.0); lessons and exercises rewritten by YEP.' AS attribution_text
    UNION ALL SELECT 'software-development', 'TECH-JAVA-L1', 'Java Programming Foundations',
           'java-programming-foundations', 'Classes, collections and the tooling behind an Android app.', 24, '☕', 30,
           'MIT OpenCourseWare — 6.092 Introduction to Programming in Java',
           'https://ocw.mit.edu/courses/6-092-introduction-to-programming-in-java-january-iap-2010/',
           'CC BY-NC-SA 4.0', 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
           'MIT OpenCourseWare; adapted by YEP',
           'Adapted from MIT OpenCourseWare 6.092 Introduction to Programming in Java (CC BY-NC-SA 4.0); examples rewritten by YEP.'
    UNION ALL SELECT 'software-development', 'TECH-SQL-L1', 'SQL and Databases',
           'sql-and-databases', 'Ask questions of a database and get trustworthy answers.', 16, '🗄️', 40,
           'Khan Academy — Intro to SQL',
           'https://www.khanacademy.org/computing/computer-programming/sql',
           'CC BY-NC-SA 3.0 US', 'https://creativecommons.org/licenses/by-nc-sa/3.0/us/',
           'Khan Academy; adapted by YEP',
           'Adapted from Khan Academy Intro to SQL (CC BY-NC-SA 3.0 US); datasets and exercises written by YEP.'
    UNION ALL SELECT 'software-development', 'TECH-MOB-L1', 'Mobile App Development Basics',
           'mobile-app-development-basics', 'Plan, build and test a small offline-friendly app.', 20, '📱', 50,
           'YEP original curriculum', NULL,
           'YEP original — all rights reserved', NULL,
           'YEP Curriculum Team',
           'Original YEP curriculum, written by the YEP Curriculum Team. No third-party material is reproduced.'
    UNION ALL SELECT 'data-and-ai', 'DAT-ANALYST-L1', 'Data Analysis for Decisions',
           'data-analysis-for-decisions', 'Clean a dataset, summarise it and explain what it does not prove.', 20, '📊', 10,
           'OpenLearn — Using data',
           'https://www.open.edu/openlearn/science-maths-technology/using-data/content-section-0',
           'CC BY-NC-SA 4.0', 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
           'The Open University (OpenLearn); adapted by YEP',
           'Adapted from the OpenLearn course Using data (CC BY-NC-SA 4.0); local datasets and exercises written by YEP.'
    UNION ALL SELECT 'data-and-ai', 'AIT-AI-L1', 'AI Basics for Work',
           'ai-basics-for-work', 'What models actually do, where they fail and how to use them fairly.', 16, '🤖', 20,
           'OpenLearn — Artificial intelligence',
           'https://www.open.edu/openlearn/science-maths-technology/artificial-intelligence/content-section-0',
           'CC BY-NC-SA 4.0', 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
           'The Open University (OpenLearn); adapted by YEP',
           'Adapted from the OpenLearn course Artificial intelligence (CC BY-NC-SA 4.0); workplace examples written by YEP.'
    UNION ALL SELECT 'cybersecurity', 'SEC-CYBER-L1', 'Cybersecurity Essentials',
           'cybersecurity-essentials', 'Protect accounts, spot phishing and recover from an incident.', 16, '🛡️', 10,
           'OpenLearn — Introduction to cyber security',
           'https://www.open.edu/openlearn/science-maths-technology/introduction-cyber-security/content-section-0',
           'CC BY-NC-SA 4.0', 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
           'The Open University (OpenLearn); adapted by YEP',
           'Adapted from the OpenLearn course Introduction to cyber security (CC BY-NC-SA 4.0); drills and checklists written by YEP.'
    UNION ALL SELECT 'product-design', 'DES-UX-L1', 'UI/UX Design Foundations',
           'ui-ux-design-foundations', 'Understand users, sketch flows and test a prototype.', 16, '🎨', 10,
           'OpenLearn — Design thinking',
           'https://www.open.edu/openlearn/science-maths-technology/design-thinking/content-section-0',
           'CC BY-NC-SA 4.0', 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
           'The Open University (OpenLearn); adapted by YEP',
           'Adapted from the OpenLearn course Design thinking (CC BY-NC-SA 4.0); templates and exercises written by YEP.'
    UNION ALL SELECT 'digital-marketing', 'MKT-DIGI-L1', 'Digital Marketing Fundamentals',
           'digital-marketing-fundamentals', 'Choose an audience and channel, then measure what worked.', 14, '📣', 10,
           'OpenStax — Principles of Marketing',
           'https://openstax.org/details/books/principles-marketing',
           'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/',
           'OpenStax, Rice University; adapted by YEP',
           'Adapted from OpenStax Principles of Marketing (CC BY 4.0); African market examples written by YEP.'
) v ON p.slug = v.path_slug
WHERE NOT EXISTS (SELECT 1 FROM courses c WHERE c.code = v.code);

-- ---------------------------------------------------------------------------
-- 3. First two modules and four lessons for each new course (ids 200+).
-- ---------------------------------------------------------------------------
INSERT INTO modules (id, course_id, name, icon, outcome, sort_order, level) VALUES
(200, (SELECT id FROM courses WHERE code = 'TECH-PY-L1'), 'Variables and decisions', '🐍',
 'Store values, branch on conditions and repeat work with a loop.', 10, 1),
(201, (SELECT id FROM courses WHERE code = 'TECH-PY-L1'), 'Functions and files', '⚙️',
 'Write reusable functions and summarise a text file.', 20, 1),
(202, (SELECT id FROM courses WHERE code = 'TECH-JAVA-L1'), 'Classes and objects', '☕',
 'Model a real thing as a class with fields and behaviour.', 10, 1),
(203, (SELECT id FROM courses WHERE code = 'TECH-JAVA-L1'), 'Collections and errors', '📦',
 'Use lists and maps, and handle bad input without crashing.', 20, 1),
(204, (SELECT id FROM courses WHERE code = 'TECH-SQL-L1'), 'Reading data', '🔎',
 'Select exactly the rows and columns you need.', 10, 1),
(205, (SELECT id FROM courses WHERE code = 'TECH-SQL-L1'), 'Shaping data', '🧮',
 'Group rows and join two tables into one answer.', 20, 1),
(206, (SELECT id FROM courses WHERE code = 'TECH-MOB-L1'), 'How an app is built', '📱',
 'Explain screens, state and navigation in a mobile app.', 10, 1),
(207, (SELECT id FROM courses WHERE code = 'TECH-MOB-L1'), 'Ship a small app', '🚀',
 'Build an offline-friendly flow and test it on a real phone.', 20, 1),
(208, (SELECT id FROM courses WHERE code = 'DAT-ANALYST-L1'), 'Ask a question of data', '📊',
 'Clean a table and summarise it without hiding problems.', 10, 1),
(209, (SELECT id FROM courses WHERE code = 'DAT-ANALYST-L1'), 'Communicate findings', '📝',
 'Choose an honest chart and write a one-page finding.', 20, 1),
(210, (SELECT id FROM courses WHERE code = 'AIT-AI-L1'), 'What AI can and cannot do', '🤖',
 'Describe how a model learns and where it fails.', 10, 1),
(211, (SELECT id FROM courses WHERE code = 'AIT-AI-L1'), 'Use AI responsibly', '⚖️',
 'Spot bias and privacy risks and set rules for use.', 20, 1),
(212, (SELECT id FROM courses WHERE code = 'SEC-CYBER-L1'), 'Everyday security', '🛡️',
 'Protect accounts and recognise a phishing attempt.', 10, 1),
(213, (SELECT id FROM courses WHERE code = 'SEC-CYBER-L1'), 'Responding to incidents', '🚨',
 'Recover from a compromise and write a response checklist.', 20, 1),
(214, (SELECT id FROM courses WHERE code = 'DES-UX-L1'), 'Understand the user', '🧑‍🎨',
 'Interview a user and map their journey through a task.', 10, 1),
(215, (SELECT id FROM courses WHERE code = 'DES-UX-L1'), 'Design and test', '📐',
 'Wireframe an accessible screen and test it with five people.', 20, 1),
(216, (SELECT id FROM courses WHERE code = 'MKT-DIGI-L1'), 'Reach the right people', '📣',
 'Match an audience and offer to a channel.', 10, 1),
(217, (SELECT id FROM courses WHERE code = 'MKT-DIGI-L1'), 'Measure and improve', '📈',
 'Pick the numbers that show whether it worked.', 20, 1);

INSERT INTO lessons (id, module_id, title, type, content, duration_minutes, sort_order) VALUES
-- PYTHON
(200, 200, 'Values, names and types', 'NOTES',
 'A variable is a name pointing at a value. Python has numbers (int, float), text (str), truth values (bool) and containers. Use print(type(x)) when unsure. Names should describe meaning, not type: total_cost beats x. Convert deliberately with int() and float(), and remember that input() always returns text, so a number typed by a user must be converted before you add it.', 15, 10),
(201, 200, 'Branch and repeat', 'ACTIVITY',
 'Write a program that asks for a monthly budget and three expenses, adds the expenses, and prints whether the plan is under, on, or over budget. Use if/elif/else and a for loop over a list. Then change one expense to text and see the error; fix it with a conversion and a clear message.', 25, 20),
(202, 201, 'Functions that do one thing', 'NOTES',
 'A function packages a step so you can name it and reuse it: def monthly_total(expenses): return sum(expenses). Keep one job per function, pass what it needs as arguments instead of reading global names, and return a value rather than printing inside it. That makes the function testable and safe to call from anywhere.', 15, 10),
(203, 201, 'Read a file and summarise it', 'ACTIVITY',
 'Create a text file with one expense amount per line. Write a function that reads the file, ignores blank lines, converts each line to a number, and returns the count and total. Print a short summary and handle a bad line by reporting its number rather than crashing.', 25, 20),
-- JAVA
(204, 202, 'Your first class', 'NOTES',
 'A class describes fields (what it stores) and methods (what it does). new creates an object and the constructor fills in its fields. Keep fields private and expose behaviour through methods so a class cannot be put into an impossible state. A useful test: can you describe the class in one sentence without using the word "and"?', 20, 10),
(205, 202, 'Build a small inventory', 'ACTIVITY',
 'Write a Product class with a name, unit price and quantity. Add methods to restock and to sell that refuse to sell more than is in stock. Create three products in a main method, sell some units and print the total value of the inventory.', 25, 20),
(206, 203, 'Lists, maps and loops', 'NOTES',
 'ArrayList keeps items in order; HashMap looks a value up by key. Use an enhanced for loop when you only read items, and an iterator or index when you remove them. Generics (List<Product>) let the compiler catch type mistakes before the program runs.', 20, 10),
(207, 203, 'Handle bad input', 'ACTIVITY',
 'Read a quantity typed by the user and store it. Wrap the conversion in try/catch for NumberFormatException and ask again instead of ending the program. Then add a check that rejects negative numbers with a message. Run it with letters, with -5 and with 12.', 25, 20),
-- SQL
(208, 204, 'SELECT, WHERE, ORDER BY', 'NOTES',
 'SELECT chooses columns, WHERE filters rows and ORDER BY sorts the result. Compare text with quotes and numbers without. Use AND/OR with brackets when mixing conditions, and LIMIT to keep an exploratory query small. Always read the row count before trusting an answer.', 15, 10),
(209, 204, 'Answer ten questions', 'ACTIVITY',
 'Using the YEP demo database, write queries that answer: how many courses per academy, the five longest courses, every Level Two course, all learners in one district, and enrolments created this month. Save each query next to the question it answers so a colleague can re-run it.', 30, 20),
(210, 205, 'GROUP BY and aggregates', 'NOTES',
 'COUNT, SUM, AVG, MIN and MAX collapse many rows into a summary. GROUP BY says what each summary row represents. Anything in SELECT that is not aggregated must appear in GROUP BY. Use HAVING to filter the summary, WHERE to filter individual rows first.', 20, 10),
(211, 205, 'Join two tables', 'ACTIVITY',
 'Join courses to academies and list each course with its academy name. Then join enrolments to courses and count learners per course, sorted from most to fewest. Explain the difference between INNER JOIN and LEFT JOIN using a course that has no enrolments.', 30, 20),
-- MOBILE
(212, 206, 'Screens, state and navigation', 'NOTES',
 'A mobile app is a set of screens with shared state. Navigation moves between screens; state is the data a screen needs to render. Keep state in one place per feature so two screens cannot disagree. Design for one hand, small screens and slow networks: show what is cached, and say when something is still loading.', 20, 10),
(213, 206, 'Sketch your first flow', 'ACTIVITY',
 'Choose a three-screen flow (for example list, detail, add). Sketch each screen on paper with one primary action. Mark where data comes from and what happens when the network fails. Then rebuild the sketch as wireframes and get one person to walk through it while you stay silent.', 30, 20),
(214, 207, 'Offline first', 'NOTES',
 'Users lose signal. Save anything they create locally first, queue uploads, and reconcile when the connection returns. Never lose a draft because a request failed. Show sync state honestly: saved locally, sending, sent, needs attention.', 20, 10),
(215, 207, 'Test on a real phone', 'ACTIVITY',
 'Install your build on a physical device. Test with a slow connection, airplane mode, a full keyboard, a large font setting and a low battery. Record each problem with the step that caused it. Fix the three most damaging issues before adding features.', 30, 20),
-- DATA
(216, 208, 'Clean data before charts', 'NOTES',
 'Check what one row means before counting anything. Look for duplicates, missing values, inconsistent units and dates stored as text. Decide and write down how each problem is handled: drop, correct or flag. A chart built on unexplained missing data is a guess with confidence.', 20, 10),
(217, 208, 'Build a small summary table', 'ACTIVITY',
 'Take a dataset of at least 50 rows. Produce a table with counts and averages grouped by one category, plus a column for how many rows were missing or excluded. Write two sentences on what the table shows and one thing it cannot tell you.', 30, 20),
(218, 209, 'Charts that do not mislead', 'NOTES',
 'Match the chart to the question: bars compare categories, lines show change over time, and dots show relationships. Start bar axes at zero, label units, and do not truncate a line chart to exaggerate change. If the sample is small, say so on the chart.', 20, 10),
(219, 209, 'Write a one-page finding', 'ACTIVITY',
 'Turn your summary table into one page: the question, the data and period, the finding in one sentence, the chart, two caveats, and the decision you recommend. Give it to someone outside your team and ask what they would do next.', 30, 20),
-- AI
(220, 210, 'Models learn from examples', 'NOTES',
 'A model finds patterns in examples and applies them to new cases. It does not know facts unless they were in the data, and it cannot explain itself the way a person can. Accuracy on the examples it learned from says little about new situations, so always test on data the model has not seen.', 20, 10),
(221, 210, 'Test a classifier by hand', 'ACTIVITY',
 'Write ten short messages and label each as "urgent" or "not urgent". Ask two people to label them independently, then compare. Discuss where you disagreed and what rule would fix it. This is the work that decides whether any automated classifier can be trusted.', 25, 20),
(222, 211, 'Bias, privacy and credit', 'NOTES',
 'A model trained on biased history repeats that bias at scale. Do not paste personal data, unpublished work or other people''s writing into a tool you do not control. Disclose AI help where it affects a decision about a person, and keep a human responsible for the final call.', 20, 10),
(223, 211, 'Write an AI use policy', 'ACTIVITY',
 'Draft one page for a small organisation: which tools are allowed, what data must never be entered, when output must be checked by a person, how AI help is disclosed, and who answers questions. Keep it short enough that a new staff member can read it in five minutes.', 30, 20),
-- CYBERSECURITY
(224, 212, 'Passwords, phishing and updates', 'NOTES',
 'Use a password manager and a different password for every account; length beats complexity. Turn on two-factor authentication, preferably an app rather than SMS. Treat urgency, unusual payment requests and mismatched links as warnings. Install updates promptly: most successful attacks use known holes.', 20, 10),
(225, 212, 'Run a phishing drill', 'ACTIVITY',
 'Write two sample messages: one obviously fake and one convincing. Ask five colleagues to mark the warning signs and the safe action. Record which signs they missed, then send a short summary of what to check. Never shame individuals; fix the process.', 25, 20),
(226, 213, 'Backups and recovery', 'NOTES',
 'A backup you have never restored is a hope. Keep three copies, on two kinds of media, with one off-site. Test a restore and time it. For accounts, know how to revoke sessions, reset credentials and check forwarding rules an attacker may have added.', 20, 10),
(227, 213, 'Write an incident checklist', 'ACTIVITY',
 'Produce a one-page checklist: who to tell first, how to contain the account or device, what evidence to keep, how to tell affected people, and what to review afterwards. Assign a name to each step and rehearse it once with a colleague.', 25, 20),
-- UI/UX
(228, 214, 'Interviews and task flows', 'NOTES',
 'Ask about what people did last time, not what they would like. Record the steps, the tools and the workarounds. A journey map shows the task from the user''s side with the moments that cost them time. Design the flow before designing any screen.', 20, 10),
(229, 214, 'Map one user journey', 'ACTIVITY',
 'Interview one person about a real task they do weekly. Draw the journey in five to seven steps, marking where they get stuck or ask for help. Circle the single step where a small change would save the most time.', 30, 20),
(230, 215, 'Wireframes and accessibility', 'NOTES',
 'A wireframe shows structure and hierarchy without decoration: what is on the screen, what is most important, what happens next. Use real labels, not lorem ipsum. Meet contrast ratios, size text for readability, make tap targets large, and never rely on colour alone.', 20, 10),
(231, 215, 'Test with five people', 'ACTIVITY',
 'Test your wireframe with five people. Give each a task, not instructions: "find the certificate you earned". Stay quiet, note where they hesitate, and ask what they expected. Fix the two issues that appeared most often and test again.', 30, 20),
-- DIGITAL MARKETING
(232, 216, 'Audience, offer and channel', 'NOTES',
 'Write down who you are speaking to, what they get and what it costs them. Choose one channel where that audience already spends time rather than being everywhere. A clear offer to a narrow audience beats a vague offer to everyone.', 20, 10),
(233, 216, 'Write a seven-day plan', 'ACTIVITY',
 'Draft a seven-day plan for one channel: audience, one offer, seven post ideas, and the action you want people to take. Each post must stand alone. Show the plan to two people in the target audience and rewrite the weakest idea.', 25, 20),
(234, 217, 'Content that earns attention', 'NOTES',
 'Lead with the problem, not your company. Show the result with a real example, keep claims specific and checkable, and make the next step obvious. Consistency beats bursts: a simple weekly rhythm you can sustain will outperform a launch you cannot repeat.', 20, 10),
(235, 217, 'Read the numbers', 'ACTIVITY',
 'Pick three numbers that match your goal (for example reach, replies and sign-ups) and record them weekly in one sheet. After four weeks, identify which post produced the most of the action you actually wanted, and write down why you think it worked.', 25, 20);
