-- ---------------------------------------------------------------------------
-- V3: course content, syllabus metadata and virtual classroom rooms.
-- Adds the material a participant actually needs to complete Level One and
-- prepare for work (lesson notes, timing, module outcomes, live-room names).
-- ---------------------------------------------------------------------------

ALTER TABLE modules ADD COLUMN outcome VARCHAR(600) NULL AFTER icon;
ALTER TABLE lessons ADD COLUMN content TEXT NULL AFTER type,
                    ADD COLUMN duration_minutes INT NOT NULL DEFAULT 20 AFTER content;
ALTER TABLE sessions ADD COLUMN room_name VARCHAR(100) NULL AFTER meeting_link;

UPDATE modules SET outcome = 'Use a computer, browser and cloud workspace confidently; protect your accounts; produce and share documents that employers expect.' WHERE id = 1;
UPDATE modules SET outcome = 'Explain what generative AI does well and where it fails; use it responsibly for study, job applications and small business tasks.' WHERE id = 2;
UPDATE modules SET outcome = 'Break a problem into questions, separate evidence from assumption, and defend a decision in a team or interview.' WHERE id = 3;
UPDATE modules SET outcome = 'Verify information before sharing it; recognise manipulated images and AI-generated text; build a trustworthy professional profile online.' WHERE id = 4;
UPDATE modules SET outcome = 'Communicate clearly with people from different backgrounds, give and receive feedback, and agree how a team will work together.' WHERE id = 5;

UPDATE lessons SET duration_minutes = 25, content = 'Digital tools are the equipment of modern work: a browser, email, a calendar, a document editor and cloud storage. This lesson walks through each one using free tools, then shows how they fit together in a typical working day.

By the end you can:
- Open and organise files in a cloud drive instead of losing them on a shared phone.
- Write a one-page document, export it as PDF and attach it to an email.
- Keep a calendar that reminds you about interviews, classes and deadlines.

Practice: create a folder called "YEP 2026", upload one document, rename it "CV - Your Name", and email it to yourself as a PDF.' WHERE id = 1;

UPDATE lessons SET duration_minutes = 30, content = 'Most job scams and account thefts start with a link or a message that looks almost right. Learn the three checks that catch nearly all of them: the sender address, the destination of a link, and whether the request creates urgency.

Key habits:
- Never reuse the password from your email anywhere else.
- Turn on two-step verification for email, social media and banking.
- Treat any request for a registration fee, "training deposit" or ID photo as a red flag until verified independently.

Practice: open your email account settings, enable two-step verification, and write down two recovery options you control.' WHERE id = 2;

UPDATE lessons SET duration_minutes = 35, content = 'A clean workspace removes friction. In this activity you set up the browser profile, folder structure and note-taking tool you will use for the rest of YEP, and you test that everything survives a restart.

Checklist:
- Browser with three bookmarks: YEP portal, a free learning site, your email.
- A single folder tree: YEP / Level One / Level Two.
- A notes file where you record one thing you learned each day.

Practice: complete the checklist, then take a screenshot of the folder tree and upload it as your first project deliverable later in Level Two.' WHERE id = 3;

UPDATE lessons SET duration_minutes = 25, content = 'Generative AI produces plausible text, images and code from patterns in its training data. It does not know whether something is true, current, or appropriate for your context.

It is useful for: drafting, summarising, translating, brainstorming, explaining a term, and turning notes into a first draft.
It is risky for: facts about people or prices, legal or medical advice, citations, and anything confidential.

Practice: ask a chatbot to "list three free courses for learning Excel". Check every link it gives you. Record how many were real and how many were invented.' WHERE id = 4;

UPDATE lessons SET duration_minutes = 30, content = 'AI systems repeat the biases in their data and can expose private information. Responsibility sits with the person who uses the output, not the tool.

Rules for your own work:
- Do not paste names, phone numbers, ID numbers or client data into a public AI tool.
- Disclose AI assistance when the output is submitted as your own work.
- Keep a human check on decisions that affect other people.

Practice: take a short paragraph you wrote and ask an AI tool to rewrite it. Compare both versions and list three changes it made without being asked.' WHERE id = 5;

UPDATE lessons SET duration_minutes = 35, content = 'This activity turns the previous two lessons into a repeatable audit. You will test an AI answer against three external sources and write a short verdict a supervisor could read.

Method:
1. Pick a factual claim from the answer.
2. Find two independent sources (not the same website).
3. Note where the claim is right, outdated or unsupported.
4. State what you would tell a colleague.

Practice: write a 150-word audit with a clear recommendation: use, use with correction, or do not use.' WHERE id = 6;

UPDATE lessons SET duration_minutes = 25, content = 'Good questions produce usable answers. This lesson teaches a simple structure for asking: context, constraint, and the decision you need to make.

Examples:
- Weak: "How do I get a job?"
- Strong: "I am 22, finishing a diploma in accounting in Kampala, with no work experience. What three entry-level roles should I apply for this month, and what should I put on a one-page CV for each?"

Practice: rewrite three vague questions you have asked recently using the context-constraint-decision structure.' WHERE id = 7;

UPDATE lessons SET duration_minutes = 30, content = 'An argument is a claim plus reasons. Critical thinking separates what is observed from what is assumed, and asks what evidence would change your mind.

Ask:
- What exactly is being claimed?
- What evidence is offered, and who benefits if I believe it?
- What is missing that would make this stronger?

Practice: find a job advertisement that promises "earn UGX 2 million a month from home". List its claims, the evidence offered, and the assumptions you would have to accept.' WHERE id = 8;

UPDATE lessons SET duration_minutes = 35, content = 'In this activity you take a real workplace disagreement and map it: claim, reasons, evidence, assumptions, and the decision that follows.

Scenario: a team cannot agree whether to spend the project budget on transport or on printing materials.

Practice: write the strongest version of both positions, then a one-paragraph recommendation that names the trade-off. This is the exact structure used in interviews and project reports.' WHERE id = 9;

UPDATE lessons SET duration_minutes = 25, content = 'Before you share anything, check who published it, when, and whether another independent source reports the same thing.

The four checks:
1. Author or organisation - are they accountable for the claim?
2. Date - is this still current?
3. Evidence - does the article link to primary data?
4. Cross-check - do two unrelated outlets agree?

Practice: verify one news headline about youth employment in East Africa using the four checks and write a three-line verdict.' WHERE id = 10;

UPDATE lessons SET duration_minutes = 30, content = 'Images, audio and video can be edited or generated. Look for inconsistent shadows, mismatched text, unnatural hands, repeated backgrounds, and audio that does not match lip movement.

For documents and screenshots: check fonts, alignment and metadata. A screenshot is not proof; the original source is.

Practice: take one viral image from the past year, find its earliest version and note what changed between versions.' WHERE id = 11;

UPDATE lessons SET duration_minutes = 35, content = 'In this activity you fact-check a social media post end to end and publish your findings as a short, calm correction.

Steps:
1. Archive the post (screenshot with the URL visible).
2. Trace the claim to its earliest source.
3. Contact or cite an authoritative source.
4. Write four sentences: claim, what is true, what is false, why it matters.

Practice: complete the four sentences for a post you have seen shared in a family or class group.' WHERE id = 12;

UPDATE lessons SET duration_minutes = 25, content = 'Workplaces mix ages, languages, religions and communication styles. Competence includes noticing how others expect to be addressed and adjusting without losing your own voice.

Topics: direct versus indirect feedback, time expectations, written versus spoken requests, and how humour travels badly across contexts.

Practice: write the same short message twice - once to a close friend, once to a new supervisor - and mark every difference.' WHERE id = 13;

UPDATE lessons SET duration_minutes = 30, content = 'Feedback is information about effect, not a judgement of character. Learn to receive it without defending, and to give it without blaming.

Receiving: ask a clarifying question before responding; separate the content from the tone.
Giving: describe the behaviour, the effect, and the request. "When the report arrived after the meeting, the team could not use it. Can we agree a 24-hour buffer?"

Practice: write one piece of feedback using behaviour-effect-request, then read it aloud and remove anything that sounds like an accusation.' WHERE id = 14;

UPDATE lessons SET duration_minutes = 35, content = 'A team contract prevents most conflict. It states how decisions are made, how work is tracked, what happens when someone misses a deadline, and how the team will disagree.

Include: meeting rhythm, response times, decision rule, file naming, and a review date.

Practice: draft a one-page contract for your Level Two team, agree it in your team thread, and store it in the team folder.' WHERE id = 15;

UPDATE sessions SET room_name = 'yep-level-one-welcome', meeting_link = NULL WHERE id = 1;
UPDATE sessions SET room_name = 'yep-source-verification', meeting_link = NULL WHERE id = 2;
UPDATE sessions SET room_name = 'yep-impact-clinic', meeting_link = NULL WHERE id = 3;

UPDATE materials SET url = 'https://www.youtube.com/watch?v=U3aXWizDbQ4' WHERE id = 5;

INSERT INTO materials (module_id, title, type, url) VALUES
  (NULL, 'Google Digital Garage - Fundamentals of Digital Marketing', 'LINK', 'https://learndigital.withgoogle.com/digitalgarage/course/digital-marketing'),
  (NULL, 'GCFGlobal - free computer and internet basics', 'LINK', 'https://edu.gcfglobal.org/en/topics/computerbasics/'),
  (NULL, 'Khan Academy - financial literacy for young adults', 'LINK', 'https://www.khanacademy.org/college-careers-more/financial-literacy'),
  (NULL, 'Elements of AI - free online course', 'LINK', 'https://www.elementsofai.com/'),
  (NULL, 'ILO - decent work and youth employment guidance', 'LINK', 'https://www.ilo.org/topics/youth-employment'),
  (NULL, 'CV and interview preparation guide', 'LINK', 'https://www.careeronestop.org/JobSearch/Resumes/resumes.aspx'),
  (NULL, 'Freelancing starter checklist (rates, contracts, invoices)', 'PDF', '/uploads/materials/freelancing-starter.pdf'),
  (NULL, 'YEP employability workbook: CV, cover letter, interview', 'PDF', '/uploads/materials/employability-workbook.pdf');
