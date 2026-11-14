-- V11 — Phase 2 seed: four more academy groups, attribution on every course, and one
-- real, openly attributed course per academy group with its first modules and lessons.
-- All lesson text is original YEP writing; the cited open resources are further reading.

-- ---------------------------------------------------------------------------
-- 1. Four more academy groups (six already exist from V6/V7)
-- ---------------------------------------------------------------------------
INSERT INTO academies (name, slug, tagline, description, icon, colour, sort_order, published) VALUES
('Math & Science', 'math-science',
 'Numeracy and science for everyday decisions',
 'Applied mathematics, data literacy and scientific thinking for work and daily life.',
 '🔢', '#0f766e', 70, 1),
('Soft Skills & Leadership', 'soft-skills-leadership',
 'Communication, teamwork and leading others',
 'Listening, feedback, running meetings and leading a small team with trust.',
 '🗣️', '#7c3aed', 80, 1),
('Career Development', 'career-development',
 'Plan a career, apply well and interview confidently',
 'Skills audits, job search systems, CVs, applications and interviews.',
 '🧭', '#b45309', 90, 1),
('Life Skills', 'life-skills',
 'Everyday skills for work and life',
 'Money habits, time, wellbeing and asking for help when it matters.',
 '🌟', '#be123c', 100, 1);

INSERT INTO career_paths (academy_id, title, slug, summary, icon, sort_order, published)
SELECT a.id, v.title, v.slug, v.summary, v.icon, 10, 1
FROM academies a
JOIN (
    SELECT 'math-science' AS academy_slug, 'Applied Mathematics' AS title,
           'applied-mathematics' AS slug, 'Numbers, data and evidence for real decisions.' AS summary,
           '➗' AS icon
    UNION ALL SELECT 'soft-skills-leadership', 'Leadership Essentials', 'leadership-essentials',
           'Communicate clearly and lead small teams well.', '🤝'
    UNION ALL SELECT 'career-development', 'Career Planning', 'career-planning',
           'Find the right roles and apply with confidence.', '🎯'
    UNION ALL SELECT 'life-skills', 'Everyday Life Skills', 'everyday-life-skills',
           'Practical habits for money, time and wellbeing.', '🌱'
) v ON v.academy_slug = a.slug;

INSERT INTO courses (career_path_id, code, title, slug, summary, level, duration_hours, icon, sort_order, published)
SELECT p.id, v.code, v.title, v.slug, v.summary, 1, v.hours, v.icon, 10, 1
FROM career_paths p
JOIN (
    SELECT 'applied-mathematics' AS path_slug, 'MTH-APPLIED-L1' AS code,
           'Applied Mathematics for Everyday Life' AS title, 'applied-mathematics-everyday-life' AS slug,
           'Percentages, interest, budgets and honest data.' AS summary, 20 AS hours, '➗' AS icon
    UNION ALL SELECT 'leadership-essentials', 'SFT-LEAD-L1', 'Communication and Leadership',
           'communication-and-leadership', 'Listening, feedback and running a small team.', 16, '🗣️'
    UNION ALL SELECT 'career-planning', 'CRD-PLAN-L1', 'Career Planning and Job Search',
           'career-planning-and-job-search', 'Skills audit, target roles, applications and interviews.', 16, '🎯'
    UNION ALL SELECT 'everyday-life-skills', 'LIF-EVERYDAY-L1', 'Everyday Life Skills',
           'everyday-life-skills', 'Money habits, time, wellbeing and asking for help.', 12, '🌟'
) v ON v.path_slug = p.slug;

-- ---------------------------------------------------------------------------
-- 2. Attribution on every course (licensing rule). Existing courses are already live.
-- ---------------------------------------------------------------------------
UPDATE courses SET
    attribution_text = 'Original YEP curriculum, written by the YEP Curriculum Team. No third-party material is reproduced.',
    author = 'YEP Curriculum Team', licence = 'YEP original — all rights reserved',
    source_name = 'YEP original curriculum'
WHERE code = 'YEP-CORE-L1';

UPDATE courses SET
    attribution_text = 'Adapted from the freeCodeCamp Responsive Web Design curriculum (CC BY-SA 4.0); lessons rewritten and extended by YEP.',
    author = 'freeCodeCamp contributors; adapted by YEP',
    licence = 'CC BY-SA 4.0',
    licence_url = 'https://creativecommons.org/licenses/by-sa/4.0/',
    source_name = 'freeCodeCamp — Responsive Web Design',
    source_url = 'https://www.freecodecamp.org/learn/2022/responsive-web-design/'
WHERE code = 'TECH-WEB-L1';

UPDATE courses SET
    attribution_text = 'Adapted from OpenStax Entrepreneurship (CC BY 4.0); local examples and exercises written by YEP.',
    author = 'OpenStax, Rice University; adapted by YEP',
    licence = 'CC BY 4.0',
    licence_url = 'https://creativecommons.org/licenses/by/4.0/',
    source_name = 'OpenStax — Entrepreneurship',
    source_url = 'https://openstax.org/details/books/entrepreneurship'
WHERE code IN ('BUS-SBM-L1', 'BUS-SBM-L2');

UPDATE courses SET
    attribution_text = 'Adapted from FAO e-learning Academy agribusiness modules (CC BY-NC-SA 3.0 IGO); East African examples written by YEP.',
    author = 'FAO e-learning Academy; adapted by YEP',
    licence = 'CC BY-NC-SA 3.0 IGO',
    licence_url = 'https://creativecommons.org/licenses/by-nc-sa/3.0/igo/',
    source_name = 'FAO e-learning Academy — Agribusiness',
    source_url = 'https://elearning.fao.org/'
WHERE code IN ('AGR-AGRI-L1', 'AGR-AGRI-L2');

UPDATE courses SET
    attribution_text = 'Original YEP media curriculum, written by the YEP creative team. No third-party material is reproduced.',
    author = 'YEP Creative Team', licence = 'YEP original — all rights reserved',
    source_name = 'YEP original curriculum'
WHERE code IN ('CRE-CONTENT-L1', 'CRE-CONTENT-L2', 'PRO-EMP-L1', 'CRD-PLAN-L1');

UPDATE courses SET
    attribution_text = 'Adapted from the OpenLearn course Solar energy (CC BY-NC-SA 4.0); installation checklists written by YEP.',
    author = 'The Open University (OpenLearn); adapted by YEP',
    licence = 'CC BY-NC-SA 4.0',
    licence_url = 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    source_name = 'OpenLearn — Solar energy',
    source_url = 'https://www.open.edu/openlearn/science-maths-technology/solar-energy/content-section-0'
WHERE code IN ('VOC-SOLAR-L1', 'VOC-SOLAR-L2');

UPDATE courses SET
    attribution_text = 'Adapted from OpenStax Elementary Algebra 2e (CC BY 4.0); market and budget examples written by YEP.',
    author = 'OpenStax, Rice University; adapted by YEP',
    licence = 'CC BY 4.0',
    licence_url = 'https://creativecommons.org/licenses/by/4.0/',
    source_name = 'OpenStax — Elementary Algebra 2e',
    source_url = 'https://openstax.org/details/books/elementary-algebra-2e'
WHERE code = 'MTH-APPLIED-L1';

UPDATE courses SET
    attribution_text = 'Adapted from MIT OpenCourseWare 15.279 Management Communication for Undergraduates (CC BY-NC-SA 4.0); exercises rewritten by YEP.',
    author = 'MIT OpenCourseWare; adapted by YEP',
    licence = 'CC BY-NC-SA 4.0',
    licence_url = 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    source_name = 'MIT OpenCourseWare — Management Communication',
    source_url = 'https://ocw.mit.edu/courses/15-279-management-communication-for-undergraduates-fall-2012/'
WHERE code = 'SFT-LEAD-L1';

UPDATE courses SET
    attribution_text = 'Adapted from Khan Academy Life skills (CC BY-NC-SA 3.0 US); examples and exercises written by YEP.',
    author = 'Khan Academy; adapted by YEP',
    licence = 'CC BY-NC-SA 3.0 US',
    licence_url = 'https://creativecommons.org/licenses/by-nc-sa/3.0/us/',
    source_name = 'Khan Academy — Life skills',
    source_url = 'https://www.khanacademy.org/college-careers-more/life-skills'
WHERE code = 'LIF-EVERYDAY-L1';

UPDATE courses SET language = 'en', certificate_available = 1, review_status = 'PUBLISHED'
WHERE review_status = 'DRAFT' OR review_status IS NULL;

-- ---------------------------------------------------------------------------
-- 3. Modules and lessons for one real course per academy.
--    Explicit ids (100+) keep the seed deterministic and never collide with V3/V5 content.
-- ---------------------------------------------------------------------------
INSERT INTO modules (id, course_id, name, icon, outcome, sort_order, level) VALUES
(100, (SELECT id FROM courses WHERE code = 'TECH-WEB-L1'), 'How the web works', '🌐',
 'Explain how a browser, a server and HTML produce a page.', 10, 1),
(101, (SELECT id FROM courses WHERE code = 'TECH-WEB-L1'), 'Styling and layout', '🎨',
 'Style a page with CSS and lay it out with flexbox.', 20, 1),
(102, (SELECT id FROM courses WHERE code = 'BUS-SBM-L1'), 'From idea to offer', '💡',
 'Test a business idea against a real customer problem.', 10, 1),
(103, (SELECT id FROM courses WHERE code = 'BUS-SBM-L1'), 'Money that works', '💰',
 'Price a product and read a simple cash-flow statement.', 20, 1),
(104, (SELECT id FROM courses WHERE code = 'AGR-AGRI-L1'), 'The farm as a business', '🚜',
 'Calculate the unit economics of one crop or livestock cycle.', 10, 1),
(105, (SELECT id FROM courses WHERE code = 'AGR-AGRI-L1'), 'Inputs, yields and losses', '🌾',
 'Plan inputs and reduce post-harvest loss.', 20, 1),
(106, (SELECT id FROM courses WHERE code = 'CRE-CONTENT-L1'), 'Story before gear', '📷',
 'Plan content for a specific audience and purpose.', 10, 1),
(107, (SELECT id FROM courses WHERE code = 'CRE-CONTENT-L1'), 'Edit and publish', '🎬',
 'Assemble, caption and publish a short piece.', 20, 1),
(108, (SELECT id FROM courses WHERE code = 'PRO-EMP-L1'), 'Applying well', '📄',
 'Write a CV and cover letter that survive a 30-second scan.', 10, 1),
(109, (SELECT id FROM courses WHERE code = 'PRO-EMP-L1'), 'Interviews', '🤝',
 'Answer behavioural questions with the STAR method.', 20, 1),
(110, (SELECT id FROM courses WHERE code = 'VOC-SOLAR-L1'), 'Solar components and safety', '☀️',
 'Identify the parts of a small solar system and the main hazards.', 10, 1),
(111, (SELECT id FROM courses WHERE code = 'VOC-SOLAR-L1'), 'Sizing and installing', '🔧',
 'Size a small system from a load list and follow an install checklist.', 20, 1),
(112, (SELECT id FROM courses WHERE code = 'MTH-APPLIED-L1'), 'Numbers for money', '➗',
 'Use percentages and interest to compare real offers.', 10, 1),
(113, (SELECT id FROM courses WHERE code = 'MTH-APPLIED-L1'), 'Data you can trust', '📊',
 'Read averages and charts critically.', 20, 1),
(114, (SELECT id FROM courses WHERE code = 'SFT-LEAD-L1'), 'Communication that lands', '🗣️',
 'Listen actively and give feedback people can act on.', 10, 1),
(115, (SELECT id FROM courses WHERE code = 'SFT-LEAD-L1'), 'Leading a small team', '🧑‍🤝‍🧑',
 'Agree roles, build trust and run a short meeting.', 20, 1),
(116, (SELECT id FROM courses WHERE code = 'CRD-PLAN-L1'), 'Know your direction', '🧭',
 'Audit your skills and choose target roles.', 10, 1),
(117, (SELECT id FROM courses WHERE code = 'CRD-PLAN-L1'), 'Run a job search system', '🎯',
 'Find openings and track applications.', 20, 1),
(118, (SELECT id FROM courses WHERE code = 'LIF-EVERYDAY-L1'), 'Daily decisions', '🌱',
 'Build money and time habits that survive a bad month.', 10, 1),
(119, (SELECT id FROM courses WHERE code = 'LIF-EVERYDAY-L1'), 'Staying well', '💚',
 'Protect sleep and stress, and know when to ask for help.', 20, 1);

INSERT INTO lessons (id, module_id, title, type, content, duration_minutes, sort_order) VALUES
-- TECH-WEB
(100, 100, 'Requests, responses and the browser', 'NOTES',
 'When you open a website, your browser sends a request and a server answers with HTML. The browser then reads the HTML and asks for the CSS, images and JavaScript it references. HTML describes structure, CSS describes appearance and JavaScript describes behaviour. Try it: open any page, press View Source and find one heading, one link and one image.', 15, 10),
(101, 100, 'Your first HTML page', 'ACTIVITY',
 'Create a file called index.html with a doctype, a html element, a head with a title, and a body containing one heading, one paragraph and one link. Open it in a browser. Then change the heading text and reload. Goal: you can explain what each tag does without copying a template.', 20, 10),
(102, 101, 'Selectors, colour and type', 'NOTES',
 'A CSS rule has a selector and declarations: p { color: #1f2937; font-size: 16px; }. Use classes for reusable styles and keep colours in one place. Aim for readable contrast: dark text on light backgrounds, and never rely on colour alone to carry meaning.', 15, 10),
(103, 101, 'Layout with flexbox', 'ACTIVITY',
 'Put three cards in a container and use display: flex, gap and flex-wrap so they sit in a row on wide screens and stack on a phone. Then centre one item with justify-content and align-items. Test by resizing the window to a narrow width.', 20, 10),
-- BUSINESS
(104, 102, 'Start from a customer problem', 'NOTES',
 'A business survives by solving a problem somebody already pays to solve. Write down who your customer is, what they do today instead, and why that is painful or expensive. Talk to five potential customers before spending money. If nobody describes the problem in their own words, change the idea rather than the marketing.', 20, 10),
(105, 102, 'Your value proposition', 'ACTIVITY',
 'In one sentence: we help (customer) to (outcome) by (offer), unlike (alternative). Keep it specific enough that a stranger can repeat it. Test it on three people and rewrite it until they can explain your offer back to you.', 20, 10),
(106, 103, 'Costs and pricing', 'NOTES',
 'Separate fixed costs (rent, licences) from variable costs (materials per unit). Price above variable cost or every sale loses money. A simple check: if you sell 100 units, does revenue cover fixed costs plus variable costs plus a margin? Write the numbers down; a price you feel good about is not a price that works.', 20, 10),
(107, 103, 'Cash flow basics', 'ACTIVITY',
 'List money in and money out for the next four weeks, week by week. Mark the week where the balance is lowest. Move a purchase or ask a customer for a deposit so that week stays positive. Cash timing, not profit, is what closes small businesses.', 20, 10),
-- AGRICULTURE
(108, 104, 'Unit economics of one cycle', 'NOTES',
 'Pick one crop or livestock cycle. Add every input: seed, feed, labour, transport, water. Estimate a realistic yield, not the best harvest you have seen. Divide total cost by expected output to get cost per kilogram or per animal. That number decides whether the cycle is worth repeating.', 20, 10),
(109, 104, 'Records that change decisions', 'ACTIVITY',
 'Create a one-page record with date, activity, input cost, labour hours and output. Fill it for one week. At the end, name one decision the record would change, such as shifting planting date or renegotiating an input price.', 15, 10),
(110, 105, 'Plan inputs and yields', 'NOTES',
 'Match inputs to the soil and the season instead of buying by habit. Test soil where possible, choose varieties suited to your rainfall, and space plants as recommended. Keep a comparison plot when trying something new so you can tell whether it worked.', 20, 10),
(111, 105, 'Reduce post-harvest loss', 'ACTIVITY',
 'Identify the three biggest losses after harvest: spillage, pests, moisture or delays to market. For each, write one affordable fix (drying, hermetic storage, earlier transport, grading). Estimate how much of the harvest each fix could save.', 20, 10),
-- CREATIVE
(112, 106, 'Audience, message, purpose', 'NOTES',
 'Before shooting, answer three questions: who is this for, what should they do after watching, and what is the one idea they should remember? A 60-second piece that lands one idea beats a ten-minute piece that covers five. Write the message as a single sentence and keep it visible while you work.', 15, 10),
(113, 106, 'Shot list and storyboard', 'ACTIVITY',
 'Write a shot list of six shots for a one-minute piece: wide establishing, medium action, close detail, interview, cutaway, closing. For each shot note location, what happens and how long it lasts. Shoot only what is on the list and note what you missed.', 20, 10),
(114, 107, 'Assembly and captions', 'NOTES',
 'Cut for clarity first and style second. Remove greetings and repetition, keep the strongest three seconds at the start, and add captions because most people watch without sound. Check that captions match the audio and are readable on a phone.', 20, 10),
(115, 107, 'Publishing checklist', 'ACTIVITY',
 'Before publishing, confirm: correct aspect ratio, audible sound, accurate captions, a title that states the benefit, a short description, and alt text for any still image. Then publish and ask two people what they understood from it.', 15, 10),
-- EMPLOYABILITY
(116, 108, 'A CV that survives 30 seconds', 'NOTES',
 'Recruiters scan for role fit. Put a short profile at the top, then experience with results rather than duties, then skills and education. Use one column, clear headings and consistent dates. Save as PDF and name the file with your name and the role.', 20, 10),
(117, 108, 'Cover letters that add value', 'ACTIVITY',
 'Write four short paragraphs: the role and why you, one concrete example with a result, what you would do in the first month, and a closing line. Keep it under 250 words and address the organisation by name.', 20, 10),
(118, 109, 'STAR answers', 'NOTES',
 'For behavioural questions, describe the Situation, the Task, the Action you personally took, and the Result with a number if possible. Prepare three stories you can adapt: a team conflict, a deadline you saved, and something you learned from failure. Practise out loud, not in your head.', 20, 10),
(119, 109, 'Questions to ask them', 'ACTIVITY',
 'Prepare four questions about the work itself: what success looks like in six months, how the team makes decisions, what training exists, and what the biggest current constraint is. Avoid questions whose answer is on their website.', 15, 10),
-- SOLAR
(120, 110, 'Components of a small system', 'NOTES',
 'A basic system has panels, a charge controller, a battery and an inverter, plus fuses, earthing and cabling. The controller protects the battery from overcharge and deep discharge; the inverter converts direct current to alternating current. Learn what each part does before touching an installation.', 20, 10),
(121, 110, 'Safety first', 'NOTES',
 'Direct current can arc and batteries store large energy. Isolate before working, use insulated tools, keep metal away from terminals, ventilate battery spaces and earth the system. Never work alone on a roof. If you are unsure, stop and call a qualified installer.', 15, 10),
(122, 111, 'Load audit and sizing', 'ACTIVITY',
 'List every appliance with watts and hours per day, multiply to get watt-hours, then add them. Size the panel array for your sun hours, the battery for the days of autonomy you need, and the inverter for peak load. Show your working; a system sized by guesswork fails in the rainy season.', 25, 10),
(123, 111, 'Installation checklist', 'ACTIVITY',
 'Write the order of work: survey, mounting, wiring, protection, commissioning, handover. For each step list the check that proves it is correct, such as polarity, torque, fuse rating and measured output. Use the list on your next installation and note anything missing.', 20, 10),
-- MATHS
(124, 112, 'Percentages and interest', 'NOTES',
 'A percentage is a fraction of one hundred. To find 15 percent of 80 000, multiply by 0.15. For a loan, compare the total repaid, not the monthly instalment: a longer term can look cheaper each month while costing far more overall. Always convert offers to the same time period before comparing.', 20, 10),
(125, 112, 'Build a budget that survives', 'ACTIVITY',
 'List income, fixed costs, variable costs and savings for one month using real numbers from the last three months. Mark the three largest variable costs and choose one realistic reduction. Recheck after a month and record whether the plan held.', 20, 10),
(126, 113, 'Averages and misleading charts', 'NOTES',
 'A mean hides outliers: one very high value pulls it up. Ask for the median and the spread. On charts, check whether the axis starts at zero, whether the scale is consistent, and whether a difference is large enough to matter in practice.', 20, 10),
(127, 113, 'Sampling and bias', 'ACTIVITY',
 'Design a five-question survey for a real decision, such as which course times learners prefer. Note who you will ask, who you will miss, and how that gap could change the answer. Collect ten responses and describe one limitation honestly.', 20, 10),
-- SOFT SKILLS
(128, 114, 'Listening that people notice', 'NOTES',
 'Active listening means summarising what you heard before replying: so the main concern is the delivery date, not the price. Ask one clarifying question instead of offering a solution. In a disagreement, repeat the other position accurately enough that they agree you understood it.', 15, 10),
(129, 114, 'Feedback people can act on', 'ACTIVITY',
 'Use three parts: what you observed, the effect it had, and one specific request. For example: the report arrived after the meeting, so decisions were made without the numbers; can we have it the day before? Rewrite one piece of vague feedback you have received using this structure.', 20, 10),
(130, 115, 'Roles, trust and expectations', 'NOTES',
 'A small team works when each person knows what they own and what done looks like. Agree decisions in writing, name one owner per task, and set a check-in rhythm. Trust grows from reliably doing small things, not from big promises.', 20, 10),
(131, 115, 'Run a 15-minute meeting', 'ACTIVITY',
 'Prepare an agenda with three items: progress, blockers, decisions needed. Start on time, give each item a time box, and end with owners and dates. Send a three-line summary afterwards. Run one meeting this week and note what you would cut next time.', 15, 10),
-- CAREER
(132, 116, 'Skills audit', 'NOTES',
 'List what you can do, with evidence: a project, a certificate, a paid or unpaid role. Mark each skill as strong, developing or missing relative to the roles you want. Choose two gaps worth closing this quarter and one way to prove progress publicly.', 20, 10),
(133, 116, 'Choose target roles', 'ACTIVITY',
 'Pick three job titles you could realistically hold within a year. For each, collect five real adverts and list the skills they repeat. Circle the overlap. If the overlap is thin, adjust the title rather than forcing an unrelated CV.', 20, 10),
(134, 117, 'Where the work is advertised', 'NOTES',
 'Most openings are found through a mix of job boards, organisation websites, referrals and communities in your field. Check the same sources weekly rather than once, and note the closing dates. A short, specific message to someone doing the job often teaches more than another application.', 15, 10),
(135, 117, 'Track every application', 'ACTIVITY',
 'Create a simple tracker: role, organisation, date applied, contact, stage, next action and date. Update it the same day you apply. After ten applications, review which stage you reach most often; that is where to improve next.', 15, 10),
-- LIFE SKILLS
(136, 118, 'Money habits under pressure', 'NOTES',
 'Decide in advance what happens to unexpected money: a fixed share to essentials, a share to savings, a share to the business or family. Automate the transfer the day money arrives. Small, boring rules beat willpower in a difficult month.', 15, 10),
(137, 118, 'Time and energy', 'ACTIVITY',
 'For three days, note when you do your most demanding work and when you are least productive. Move one important task into your best two hours and remove one low-value commitment. Keep the change for a week before adding another.', 15, 10),
(138, 119, 'Sleep, stress and screens', 'NOTES',
 'Sleep is not optional: keep a consistent wake time, get daylight early, and stop screens before bed. For stress, use a short physical routine and write down the specific worry rather than carrying it. These are maintenance habits, not luxuries.', 15, 10),
(139, 119, 'Asking for help early', 'ACTIVITY',
 'Name one problem you have been carrying alone. Decide who could actually help, and write a two-line request that states the situation and the specific help you need. Send it this week, and note what made it easier or harder to ask.', 15, 10);
