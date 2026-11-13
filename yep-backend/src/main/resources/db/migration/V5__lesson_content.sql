-- Serious lesson bodies for Level One. Each lesson follows the same teaching pattern:
-- outcomes, why it matters, a worked example, a practice task, key terms and what comes next.

UPDATE lessons SET content = 'WHAT YOU WILL LEARN
Name the five tools every modern workplace expects you to use, and explain what each one is for.

WHY IT MATTERS
Employers rarely test whether you can "use a computer" in the abstract. They test whether you can open a shared document, find last week''s file, reply to a client and join a meeting without losing the thread. These five tools are the floor of digital work: a browser, email, a calendar, a document editor and cloud storage. Every other tool you meet later is built on them.

WORKED EXAMPLE
A supervisor asks for "the updated budget before the 3pm meeting". A worker with good tool habits opens cloud storage, searches the shared folder rather than their downloads, opens the budget document, checks the change history to confirm it is the latest version, exports a PDF, attaches it to a calendar invitation for 3pm and writes one sentence of context. The whole task takes four minutes because every tool has a clear job.

PRACTICE
Open your browser and create three bookmarks: your email, your cloud drive and your calendar. Send yourself an email with a file attached. Put a 15-minute appointment in your calendar and add the file link to the invitation. Confirm you can open the same file from a second tab, as if you were on another device.

KEY TERMS
Browser, tab, bookmark, attachment, calendar invite, shared drive, version history.

NEXT
Lesson 2 covers the security habits that protect these accounts and files.' WHERE id = 1;

UPDATE lessons SET content = 'WHAT YOU WILL LEARN
Apply three checks to any link or message before you trust it, and recover safely if an account is compromised.

WHY IT MATTERS
Most job scams, fake recruiters and account thefts begin with a message that looks almost right. Attackers copy real logos, real names and real email signatures. You cannot rely on how convincing something looks; you rely on a short, repeatable inspection routine.

THE THREE CHECKS
1. Sender: read the full address, not the display name. A real employer writes from a company domain, not from a free mailbox with a random number.
2. Destination: hover a link and read the address before clicking. The words before the first slash are the actual site; "admissions-university.secure-login.xyz" is not the university.
3. Request: any message that creates urgency, asks for money, asks for a password or one-time code, or asks you to move a conversation to a private chat is suspicious until proven otherwise.

WORKED EXAMPLE
A message offers a paid internship and asks you to pay a registration fee today. The sender address is hr.internships@gmail.com, the link points to a shortened URL, and the deadline is "within two hours". Three checks, three failures. You report and delete it.

PRACTICE
Find one real message in your inbox and score it against the three checks. Write down the full sender address and the true destination of every link. If you cannot see the destination, do not click.

KEY TERMS
Phishing, spoofing, display name, shortened URL, one-time code, two-factor authentication.

NEXT
Lesson 3 turns these habits into a workspace you can use for the rest of the programme.' WHERE id = 2;

UPDATE lessons SET content = 'WHAT YOU WILL LEARN
Build a browser profile, folder structure and note system that survive a restart and are easy to hand over.

WHY IT MATTERS
A messy workspace costs minutes every hour: files in Downloads, tabs reopened by memory, notes in three places. Clean structure is not decoration. It is how you prove to an employer or a mentor that your work can be found, reviewed and continued by someone else.

SET UP IN FOUR STEPS
1. Browser profile: sign in to the browser so bookmarks and passwords follow you, and turn on sync.
2. Folders: create YEP/Level One, YEP/Level Two, YEP/Admin and YEP/Evidence. Put everything you produce in one of them, named Year-Month-Day-Topic (for example 2026-11-13-source-check).
3. Notes: one document called "YEP log" with a dated line for every study session: what you did, what you learned, what is next.
4. Recovery test: restart the device, then confirm your bookmarks, folders and notes are all still there and open correctly.

DELIVERABLE
A screenshot or short note showing the four folders, the browser sync state and the first three lines of your YEP log.

KEY TERMS
Profile synchronisation, folder taxonomy, naming convention, version control, handover.

NEXT
Module 2 moves from tools to artificial intelligence and how to use it without losing your own judgement.' WHERE id = 3;

UPDATE lessons SET content = 'WHAT YOU WILL LEARN
Describe what a generative AI system does, and separate tasks it genuinely helps with from tasks where it will mislead you.

WHY IT MATTERS
Generative AI predicts plausible text, images and code from patterns in training data. "Plausible" is the key word: it is optimised to sound right, not to be right. Used well it drafts, summarises and restructures. Used badly it invents sources, mirrors stereotypes and gives confident answers to questions nobody can answer.

GOOD USES
Drafting an outline you will rewrite; turning bullet points into a paragraph; translating a first draft for meaning; generating practice questions; summarising a document you then verify; explaining a term at two levels of difficulty.

POOR USES
Asking for facts you will not check; asking for legal, medical or financial advice; pasting personal data about other people; submitting generated work as your own evidence; asking it to speak for a community you have not consulted.

WORKED EXAMPLE
You ask an assistant for "three statistics about youth unemployment in Uganda with sources". It returns three confident paragraphs. When you search the cited reports, two do not exist and the third is from 2014. The useful output was the shape of the argument, not the numbers. You keep the structure and replace every claim with a verified source.

PRACTICE
Give the same prompt to two assistants. Mark every factual claim and every citation. Verify two claims each. Record how many survived.

KEY TERMS
Large language model, hallucination, prompt, training data, generation, verification.

NEXT
Lesson 5 examines bias, privacy and who remains accountable for AI-assisted work.' WHERE id = 4;

UPDATE lessons SET content = 'WHAT YOU WILL LEARN
Identify bias and privacy risks in AI outputs, and state who is accountable when AI-assisted work causes harm.

WHY IT MATTERS
AI systems learn from historical data, and historical data contains exclusion. A model trained mostly on one language, one region or one gender will perform worse for everyone else. Privacy risk is equally practical: anything you paste into a public tool may be stored, reviewed or reused, and you may be disclosing someone else''s information without consent.

WHERE BIAS APPEARS
Who is represented in examples; whose names are auto-completed; which dialect is treated as "professional"; whose experience is missing from a summary; which candidates a screening tool ranks higher. Bias is rarely a single dramatic error. It is a pattern of small defaults.

PRIVACY RULES
Never paste names, phone numbers, health details, grades, ID numbers, addresses or unpublished community data. Anonymise before you prompt: "a participant in a rural district" is enough context. Assume anything you type can be retained.

ACCOUNTABILITY
The person who submits the work owns the work. "The AI wrote it" is not a defence in a workplace, a court or a community meeting. If you cannot explain and defend a sentence, do not submit it.

PRACTICE
Take one AI output about a community issue. List who is missing from it, which assumptions it makes, and one sentence you would have to rewrite before showing it to that community.

KEY TERMS
Training bias, representation, informed consent, anonymisation, accountability, disclosure.

NEXT
Lesson 6 is a full audit you can reuse on any AI answer.' WHERE id = 5;

UPDATE lessons SET content = 'WHAT YOU WILL LEARN
Run a repeatable audit that turns an AI answer into verified, citable material.

WHY IT MATTERS
The difference between a beginner and a professional AI user is not the prompt. It is the audit that happens afterwards. This lesson gives you a five-step routine you can apply under time pressure.

THE FIVE-STEP AUDIT
1. Claim list: copy the answer and list every factual claim as a separate line.
2. Source hunt: for each claim, find an independent source that is not the AI itself. Prefer primary documents, official statistics and named organisations.
3. Date check: record when each source was published. Old numbers presented as current are a common failure.
4. Bias check: ask who is missing, which group is described as the default, and whether the framing would be accepted by the people discussed.
5. Rewrite: keep only what survives, and write the final text in your own words with citations attached.

WORKED EXAMPLE
Claim: "70% of young people in the region lack digital skills." The only source is a blog citing an unnamed survey from 2018. The official statistics office reports a different indicator for 2023. You drop the number, use the official figure, and explain the definition in one sentence.

DELIVERABLE
A one-page audit: five claims, five verdicts (supported, partly supported, unsupported), the sources you used and your rewritten paragraph.

KEY TERMS
Primary source, secondary source, corroboration, indicator, provenance, citation.

NEXT
Module 3 builds the thinking habits that make this audit fast: better questions and explicit evidence.' WHERE id = 6;

UPDATE lessons SET content = 'WHAT YOU WILL LEARN
Ask questions that produce usable answers by supplying context, constraints and the decision you need to make.

WHY IT MATTERS
Vague questions produce generic answers. "Tell me about agriculture" returns a brochure. "I have 200,000 UGX, three weeks and two teammates; should we test a mobile soil-testing service with ten farmers in Wakiso, and what would make us stop?" returns something you can act on. Skilled questioning is a workplace skill, not a chatbot trick.

THE THREE-PART STRUCTURE
Context: who you are, what you already know, what you have tried.
Constraint: time, money, people, rules, audience, format, length.
Decision: the choice the answer must help you make, and what would change your mind.

FOLLOW-UP MOVES
Ask for the strongest counter-argument; ask what evidence would disprove the claim; ask for the same answer at three levels of expertise; ask what is missing.

WORKED EXAMPLE
Weak: "How do I get funding?" Better: "We are four students in Kampala with a working prototype and 500 users, no revenue, and a funder requires registration. Which three funding routes fit within six months, and what documents does each require?" The second question can be answered; the first cannot.

PRACTICE
Rewrite five vague questions from your own work using context, constraint and decision. Ask one of them and note what the answer still fails to address.

KEY TERMS
Context, constraint, decision criterion, counter-argument, falsification, scope.

NEXT
Lesson 8 separates what is observed from what is assumed.' WHERE id = 7;

UPDATE lessons SET content = 'WHAT YOU WILL LEARN
Break an argument into claim, reasons, evidence and assumptions, and test each part.

WHY IT MATTERS
Most disagreements at work are not about facts. They are about assumptions nobody stated. If you can surface the assumption, you can test it, and the disagreement usually becomes a short, answerable question.

THE STRUCTURE
Claim: what is being asserted. Reasons: why the speaker believes it. Evidence: what they observed or measured. Assumption: what must also be true for the reasons to support the claim. Decision: what follows if the claim is accepted.

TESTING EVIDENCE
Ask: how many cases, selected how, measured how, over what period, and who benefits from this conclusion? Anecdotes are evidence of experience, not evidence of frequency.

TESTING ASSUMPTIONS
Turn each assumption into a question you could answer with data. "Farmers will pay" becomes "what did ten farmers do when asked to pay a deposit?"

WORKED EXAMPLE
Claim: "Our workshop worked because attendance was high." Reasons: 90 people came. Assumption: attendance equals learning. Test: ask participants to demonstrate one skill afterwards. The evaluation changes from counting people to measuring capability.

PRACTICE
Take a sentence from a report or news story. Write its claim, two reasons, the evidence behind each, and one assumption. Propose the cheapest test of that assumption.

KEY TERMS
Claim, premise, inference, assumption, anecdote, correlation, causal claim.

NEXT
Lesson 9 applies the structure to a real workplace disagreement.' WHERE id = 8;

UPDATE lessons SET content = 'WHAT YOU WILL LEARN
Facilitate a short, evidence-based review of a disagreement without escalating it.

WHY IT MATTERS
Teams lose weeks to arguments that are actually one unstated assumption apart. A structured 30-minute breakdown resolves most of them and leaves a written record that prevents the same argument returning.

RUN THE SESSION IN FIVE STEPS
1. Write the decision on the board: one sentence, no blame.
2. Each side states its claim in one sentence, then its two strongest reasons.
3. For each reason, name the evidence and its source. Mark anything that is opinion as opinion.
4. List assumptions. Choose the single assumption that, if wrong, would change the decision.
5. Agree the smallest test, the owner and the date. Record it.

FACILITATION RULES
No interrupting; one claim at a time; separate people from positions; write down dissent instead of resolving it by vote; end with an owner and a date, never with "we will discuss later".

DELIVERABLE
A one-page decision note: decision, claims, evidence, assumption tested, test design, owner, review date.

KEY TERMS
Facilitation, dissent, decision record, owner, test design, review date.

NEXT
Module 4 takes the same discipline to information you read and share.' WHERE id = 9;

UPDATE lessons SET content = 'WHAT YOU WILL LEARN
Verify a source in under five minutes using provenance, corroboration and date checks.

WHY IT MATTERS
Sharing false information damages your professional credibility faster than almost any other mistake, and it can harm the people the information is about. Verification is a habit you can complete before the impulse to share.

THE FOUR CHECKS
1. Who published it? Find the organisation, its registration and its contact details. An unattributed page is not a source.
2. When? Undated claims cannot be checked against current reality. Look for the original publication date, not the repost date.
3. What is the evidence? A number without a method is decoration. Find the survey size, the sample and the definition used.
4. Who else reports it? Two independent outlets repeating one press release is one source, not two. Look for independent reporting or the primary document.

RED FLAGS
Screenshots instead of links, emotionally urgent language, unnamed "experts", numbers with no unit, statistics that begin in a year chosen to prove a point.

WORKED EXAMPLE
A post claims a new law bans informal trading. The link is a screenshot. The ministry website has no such notice; two newspapers repeat the same viral paragraph. Verdict: unverified and probably fabricated. You do not share it; you post the ministry link.

PRACTICE
Verify one claim from your feed. Record the four checks and the verdict in your YEP log.

KEY TERMS
Provenance, primary document, corroboration, press release, sample, publication date.

NEXT
Lesson 11 covers media that has been edited or generated.' WHERE id = 10;

UPDATE lessons SET content = 'WHAT YOU WILL LEARN
Spot manipulated images, audio and video using context, artefacts and independent evidence.

WHY IT MATTERS
Editing is cheap. Voice cloning and image generation are accessible to anyone with a phone. Detection is no longer about spotting a "fake look"; it is about verifying provenance and noticing inconsistencies that survive compression.

WHAT TO EXAMINE
Light and shadow: do shadows agree in direction and softness? Edges: hair, glasses, fingers and jewellery are still where generators fail. Text: signs and documents often contain warped or meaningless characters. Backgrounds: repeated windows, melted crowds, impossible reflections. Audio: breaths, room tone and lip-sync drift. Context: does the same event appear in any independent outlet?

STRONGER THAN LOOKING
Search the image itself, check the original upload date, find the earliest version, contact the person shown, and look for the raw file from the event organiser. Provenance beats pixel inspection.

WORKED EXAMPLE
A video shows a politician making an inflammatory statement. The audio has no room echo, the mouth moves slightly out of time, and no other outlet reports it. You search the phrase and find the original speech with different words. Verdict: manipulated.

PRACTICE
Take one viral image and find its earliest appearance. Write whether the caption in circulation matches the original context.

KEY TERMS
Deepfake, artefact, compression, reverse image search, room tone, provenance, context collapse.

NEXT
Lesson 12 is a complete fact-check you publish as a calm correction.' WHERE id = 11;

UPDATE lessons SET content = 'WHAT YOU WILL LEARN
Fact-check a social post end to end and publish a correction that people will actually read.

WHY IT MATTERS
Correcting misinformation works best when it is specific, calm and offers the accurate alternative. Mockery entrenches belief; a clear correction with a source gives readers something to share instead.

THE PROCESS
1. Save the post: screenshot with the URL, time and account.
2. Extract the checkable claims. Ignore opinion and focus on numbers, dates, quotes and events.
3. Verify each claim against a primary source. Record links and dates.
4. Rate each claim: true, mostly true, misleading, false, unverifiable.
5. Write the correction: what was claimed, what is accurate, the source, and why it matters. Keep it under 200 words.
6. Publish where the claim spread, tag the original poster without insult, and offer the source document.

TONE RULES
Lead with the accurate fact; avoid "fake news"; do not repeat the false claim more often than necessary; state uncertainty honestly; invite correction with evidence.

DELIVERABLE
A published correction plus a short note on what you could not verify.

KEY TERMS
Claim extraction, rating scale, correction, source document, outreach, uncertainty.

NEXT
Module 5 moves from information to people: communication across cultures and feedback.' WHERE id = 12;

UPDATE lessons SET content = 'WHAT YOU WILL LEARN
Adapt communication across language, age, hierarchy and context without erasing your own voice.

WHY IT MATTERS
East African workplaces mix languages, generations, faiths and communication norms. The same sentence can read as respectful in one setting and abrupt in another. Competence is not memorising rules for every group; it is noticing expectations and adjusting deliberately.

WHAT TO NOTICE
Greeting length; whether first names or titles are expected; directness versus indirectness; tolerance for silence; who speaks first in a meeting; how disagreement is expressed; what counts as on time; whether decisions are made publicly or privately.

PRACTICAL MOVES
Ask how people prefer to be addressed; mirror the formality of the room until invited otherwise; check understanding by asking a specific question rather than "do you understand?"; write decisions down so language differences do not become memory differences; use plain language and avoid idioms in shared documents.

WORKED EXAMPLE
A facilitator sends "Send the report now" to a partner. It reads as an order. A revised message — "Could you share the report by Thursday so we can include it in the review? Let me know if that timing is difficult" — keeps the deadline and removes the insult.

PRACTICE
Rewrite three messages from your own work for a reader from a different language background: shorter sentences, explicit request, stated deadline, no idioms.

KEY TERMS
High/low context, directness, register, face, code-switching, plain language.

NEXT
Lesson 14 covers giving and receiving feedback across those differences.' WHERE id = 13;

UPDATE lessons SET content = 'WHAT YOU WILL LEARN
Give feedback that changes behaviour, and receive it without defending.

WHY IT MATTERS
Feedback is information about effect, not a verdict on character. Most workplace conflict comes from feedback delivered as judgement ("you are careless") or received as attack. Both can be replaced with a short, specific practice.

GIVING FEEDBACK
Use observation, effect, request: "When the file arrived after the meeting (observation), we could not review it together (effect). Could you send it the day before next time? (request)". Be specific, timely, private where possible, and about behaviour you actually saw. Ask before advising.

RECEIVING FEEDBACK
Breathe, write it down, ask one clarifying question, thank the person, and decide later what to use. You do not have to agree immediately. Defensiveness ends the information flow; curiosity keeps it open.

WORKED EXAMPLE
Instead of "your presentation was bad", a mentor says: "Your evidence was strong. The first three minutes explained background we already knew, so the recommendation arrived late. Could you open with the recommendation and keep the background to one slide?"

PRACTICE
Write one piece of feedback using observation, effect and request. Then ask a peer for feedback on your last piece of work and respond with only a question and thanks.

KEY TERMS
Observation, effect, request, intent versus impact, radical candour, feedforward.

NEXT
Lesson 15 turns these habits into a team contract you can use in Level Two.' WHERE id = 14;

UPDATE lessons SET content = 'WHAT YOU WILL LEARN
Write a team contract that prevents the most common Level Two failures before they happen.

WHY IT MATTERS
Level Two teams are small, time-limited and assessed on delivered milestones. Most teams that fail do not fail on skill; they fail on unspoken expectations about meetings, decisions, contribution and credit. A contract makes those expectations explicit in one page.

WHAT THE CONTRACT MUST COVER
1. Purpose: the project''s one-sentence goal and the community it serves.
2. Roles: who leads, who owns evidence, who owns the schedule, who speaks to partners.
3. Decisions: how the team decides (consensus, lead decides after discussion) and how dissent is recorded.
4. Rhythm: meeting day and time, response time for messages, where files live.
5. Quality: what "done" means for each deliverable and who reviews before upload.
6. Contribution: how tasks are tracked and what happens when someone is unavailable.
7. Conflict: the escalation path and the review date.
8. Credit and consent: how names, photos and community data are used.

RUN A 30-MINUTE CONTRACT MEETING
Draft before the meeting; read it aloud; resolve only the disagreements; everyone signs; upload it as a deliverable; review it at the midpoint.

DELIVERABLE
A signed one-page contract uploaded to your project deliverables.

KEY TERMS
Team charter, role ownership, decision rule, escalation, midpoint review, consent.

NEXT
You have completed Level One. Keep your YEP log; it becomes evidence in your Level Two portfolio and in interviews.' WHERE id = 15;
