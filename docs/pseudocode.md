# Pseudo-code for the key rules

Runnable Java lives in the files named under each block. The pseudo-code states the rule, not the
framework details.

---

## 1. Registration with the 18–35 eligibility check

`backend/src/main/java/com/youthrise/auth/AuthService.java`, `user/EligibilityPolicy.java`

```
FUNCTION register(request, httpRequest, httpResponse):
    rateLimit("register:ip:" + clientIp, 10 per hour)

    email = lowercase(trim(request.email))
    IF accountExists(email) THEN fail 409 EMAIL_IN_USE

    // the policy owns the boundary, not the controller
    requireEligible(request.dateOfBirth):
        IF dateOfBirth is null            THEN fail "Enter your date of birth"
        IF dateOfBirth is after today     THEN fail "Enter a date of birth in the past"
        age = completedYearsBetween(dateOfBirth, today)
        IF age < 18 OR age > 35           THEN fail "open to young people aged 18 to 35"

    user = User.register(
        fullName, email, phone, country,
        hash = BCrypt(password, cost 12),
        timezone = "Africa/Kampala",
        dateOfBirth)

    save(user)                    // unique index protects concurrent duplicates
    recordConsent(user, PRIVACY_POLICY, granted = true, policyVersion)
    recordConsent(user, COMMUNICATIONS, granted = request.communicationsConsent, policyVersion)

    code = issueVerificationCode(user)      // 6 digits, hashed at rest, 30-minute expiry
    sendEmailVerification(user.email, code)
    audit.record("REGISTER", user)

    invalidateAnyExistingSession()
    createNewSession(user)                  // new session id + new CSRF token
    RETURN sessionPayload(user)
END
```

**Rules demonstrated:** server-side validation, hashing, consent capture, rate limiting, audit trail,
session fixation protection.

---

## 2. Team formation (create, select participants, add members)

`backend/src/main/java/com/youthrise/project/TeamService.java`, `Team.java`

```
FUNCTION createTeam(request, principal):
    creator = requireUser(principal.id)
    IF NOT creator.isEligibleForLevelTwo() THEN fail 403 LEVEL_TWO_ONLY

    programme = requireProgramme(request.programmeId)
    IF programme.level != 2 THEN fail 422 "Teams are formed inside Level Two programmes"

    enrolment = findEnrolment(programme, creator)
    IF enrolment is missing OR withdrawn THEN fail 403 ENROLMENT_REQUIRED

    IF nameAlreadyUsed(programme, request.name) THEN fail 409 TEAM_NAME_TAKEN

    team = Team.create(programme, request.name, request.theme, CAPACITY = 5, mentor = null)
    save(team)
    team.addMember(creator, LEAD)            // a team always has an accountable lead
    awardBadge(creator, TEAM_PLAYER)
    RETURN team

FUNCTION addMember(teamId, request, principal):
    team = requireAccessible(teamId, principal)      // member / mentor / facilitator / admin
    requireMemberManager(team, principal)

    target = resolveParticipant(request)             // by account id or e-mail address
    IF NOT target.isEligibleForLevelTwo() THEN fail "Only youth participants can join a team"
    IF team.hasMember(target)             THEN fail 409 ALREADY_TEAM_MEMBER
    IF team.members.size >= team.capacity THEN fail 409 TEAM_AT_CAPACITY
    IF target is not enrolled             THEN fail "not enrolled in this programme"

    team.addMember(target, request.role)
    awardBadge(target, TEAM_PLAYER)
    notify(target, "You joined " + team.name)
    RETURN team

FUNCTION addMembers(teamId, userIds, role, principal):        // facilitator selection
    team = requireAccessible(...); requireMemberManager(...)
    IF team.members.size + userIds.size > team.capacity THEN fail CAPACITY
    targets = []
    FOR each userId:
        user = requireUser(userId)
        validate eligible, not already a member, enrolled
        targets.add(user)
    // all checks passed before the first write: no partial roster
    FOR each target in targets: team.addMember(target, role); notify(target)
    RETURN team

FUNCTION unassignedParticipants(programmeId, principal):
    requireFacilitatorOwnsProgramme OR admin
    placed = union of members of every team in the programme
    RETURN enrolments(programme) where status != WITHDRAWN and user not in placed
```

**Single-lead invariant:** `changeMemberRole` and `removeMember` refuse to leave a team with no lead
(`LEAD_REQUIRED`).

---

## 3. Assessment scoring

`backend/src/main/java/com/youthrise/assessment/AssessmentService.java`, `AssessmentQuestion.java`,
`AssessmentAttempt.java`

```
FUNCTION submitQuiz(assessmentId, answers, principal):
    requirePrincipalRole(PARTICIPANT)
    assessment = requireAssessment(assessmentId)
    IF assessment.type != QUIZ THEN fail 422

    requireActiveEnrolment(assessment.programme, principal)
    IF NOT assessment.isOpenAt(now)              THEN fail 409 ASSESSMENT_LOCKED
    IF attemptsUsed >= assessment.maxAttempts    THEN fail 409 ATTEMPT_LIMIT_REACHED
    IF latestAttempt is still SUBMITTED          THEN fail 409 ASSESSMENT_ALREADY_SUBMITTED

    bank = questions(assessment) ordered by position
    IF bank is empty THEN fail 409 ASSESSMENT_HAS_NO_QUESTIONS

    choices = {}
    FOR each submitted answer:
        question = bank[answer.questionId]  OR fail "answer does not belong"
        IF NOT question.hasOption(answer.optionIndex) THEN fail "choose a listed option"
        IF choices already contains question          THEN fail "answer each question once"
        choices[question] = answer.optionIndex
    IF choices.size != bank.size THEN fail "answer every question"

    score = 0
    FOR each question in bank:
        // points come from the bank, never from the client
        score += question.score(choices[question])      // full points or zero
    score = min(score, assessment.maxScore)

    attempt = AssessmentAttempt.autoGraded(
        assessment, user, attemptNo = used + 1,
        body = readable transcript, score, feedback = "Scored automatically")
    save(attempt)
    FOR each question: save(AttemptAnswer(attempt, question, choice, awardedPoints))

    notify(user, "Quiz scored " + score + "/" + assessment.maxScore)
    issueCertificateIfEligible(assessment.programme, user)
    RETURN attempt

FUNCTION question.score(optionIndex):
    IF optionIndex out of range THEN RETURN 0
    RETURN options[optionIndex].isCorrect ? points : 0

FUNCTION grade(assessmentId, attemptId, score, feedback, principal):     // written work
    requireFacilitatorOwnsProgramme OR admin
    IF attempt.status != SUBMITTED THEN fail 409 ATTEMPT_ALREADY_GRADED
    IF score < 0 OR score > assessment.maxScore THEN fail 422 "cannot exceed N"
    attempt.grade(grader, score, feedback)
    notify(participant)
    issueCertificateIfEligible(...)
```

**Creation rule:** a quiz must declare at least one question and the question points must add up to
`maxScore`, so automatic marking can never exceed the total.

---

## 4. Certificate generation and verification

`backend/src/main/java/com/youthrise/assessment/CertificateService.java`, `Certificate.java`

```
FUNCTION issueIfEligible(programmeId, participantId, issuedBy):
    IF certificate already exists THEN RETURN            // idempotent, unique index backs it
    enrolment = findEnrolment(programme, participant)
    IF enrolment is missing OR status != COMPLETED THEN RETURN

    FOR each published assessment in the programme:
        latest = newest attempt by the participant
        IF latest is missing OR not GRADED          THEN RETURN
        IF latest.score * 100 < assessment.maxScore * 50 THEN RETURN   // pass mark 50 %
    // every requirement met

    programme  = requireProgramme(programmeId)
    participant = requireUser(participantId)

    code = uniqueCode()
        REPEAT up to 10 times:
            candidate = "YEP-" + 4 chars + "-" + 4 chars + "-" + 4 chars
                        from A-Z without I, O, 0, 1 (unambiguous alphabet)
            IF no certificate uses candidate THEN RETURN candidate
        fail "could not allocate a unique code"

    certificate = Certificate.issue(programme, participant, code, issuedBy)
        // entity validates programme, participant and non-blank code
    save(certificate)
    awardBadge(participant, PROGRAMME_COMPLETION)
    audit.record("CERTIFICATE_ISSUED", certificate)

FUNCTION verify(code, clientIp):
    rateLimit("certificate-verify:" + clientIp, 30 per hour)    // blocks enumeration
    IF code is blank THEN fail 422
    certificate = findByCodeIgnoreCase(trim(code)) OR fail 404 CERTIFICATE_NOT_FOUND
    RETURN { programmeTitle, level, participantName,
             issueDate, code, status, verificationNote }
    // never e-mail, phone, address or internal notes

FUNCTION revoke(certificateId, note, principal):
    requireAdmin
    IF already revoked THEN fail 409 CERTIFICATE_REVOKED
    certificate.revoke(note)          // status = REVOKED, revokedAt = now, note kept
    audit.record("CERTIFICATE_REVOKED", certificate)
```

---

## 5. Announcement audience rule (new)

`backend/src/main/java/com/youthrise/announcement/Announcement.java`, `AnnouncementService.java`

```
FUNCTION publish(title, body, audienceRole, programme, author):
    IF title blank OR body blank           THEN fail IllegalArgumentException
    IF audienceRole set AND programme set  THEN fail "target a role or a programme, not both"
    publishedAt = now

FUNCTION listFor(principal):
    IF admin THEN RETURN every announcement
    visibleProgrammeIds =
        participant -> programmes they are enrolled in
        facilitator -> programmes they own
        others      -> none
    RETURN announcements where isVisibleTo(principal.role, visibleProgrammeIds)

FUNCTION isVisibleTo(role, programmeIds):
    IF announcement.programme set THEN RETURN programmeIds contains it
    RETURN audienceRole is null OR audienceRole == role
```

---

## 6. Discussion membership rule (new)

`backend/src/main/java/com/youthrise/discussion/DiscussionService.java`

```
FUNCTION requireMember(programme, principal):
    IF admin                       THEN allow
    IF principal facilitates it    THEN allow
    IF participant AND enrolled    THEN allow
    ELSE fail 403 PROGRAMME_MEMBERSHIP_REQUIRED

FUNCTION reply(discussionId, body, principal):
    discussion = requireDiscussion(discussionId)
    requireMember(discussion.programme, principal)
    IF discussion.locked THEN fail 409 DISCUSSION_LOCKED
    IF body blank        THEN fail 422
    save(DiscussionMessage(discussion, author, body)); RETURN message
```
