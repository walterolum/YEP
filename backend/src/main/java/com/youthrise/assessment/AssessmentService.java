package com.youthrise.assessment;

import com.youthrise.common.ApiException;
import com.youthrise.notification.NotificationKind;
import com.youthrise.notification.NotificationService;
import com.youthrise.programme.Enrolment;
import com.youthrise.programme.EnrolmentRepository;
import com.youthrise.programme.EnrolmentStatus;
import com.youthrise.programme.Programme;
import com.youthrise.programme.ProgrammeRepository;
import com.youthrise.user.Role;
import com.youthrise.user.User;
import com.youthrise.user.UserPrincipal;
import com.youthrise.user.UserRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AssessmentService {

    private final AssessmentRepository assessments;
    private final AssessmentAttemptRepository attempts;
    private final AssessmentQuestionRepository questions;
    private final AssessmentAttemptAnswerRepository answers;
    private final EnrolmentRepository enrolments;
    private final ProgrammeRepository programmes;
    private final UserRepository users;
    private final CertificateService certificates;
    private final NotificationService notifications;

    public AssessmentService(AssessmentRepository assessments, AssessmentAttemptRepository attempts,
                             AssessmentQuestionRepository questions,
                             AssessmentAttemptAnswerRepository answers,
                             EnrolmentRepository enrolments, ProgrammeRepository programmes,
                             UserRepository users, CertificateService certificates,
                             NotificationService notifications) {
        this.assessments = assessments;
        this.attempts = attempts;
        this.questions = questions;
        this.answers = answers;
        this.enrolments = enrolments;
        this.programmes = programmes;
        this.users = users;
        this.certificates = certificates;
        this.notifications = notifications;
    }

    @Transactional(readOnly = true)
    public List<AssessmentDtos.AssessmentResponse> listForUser(String userId) {
        List<String> programmeIds = enrolments.findByUserIdOrderByEnrolledAtDesc(userId).stream()
                .filter(enrolment -> enrolment.getStatus() == EnrolmentStatus.ACTIVE
                        || enrolment.getStatus() == EnrolmentStatus.COMPLETED)
                .map(enrolment -> enrolment.getProgramme().getId())
                .distinct()
                .toList();
        if (programmeIds.isEmpty()) {
            return List.of();
        }
        return assessments.findByProgrammeIdInAndPublishedTrueOrderByDueAtAsc(programmeIds).stream()
                .map(assessment -> toResponse(assessment, userId))
                .toList();
    }

    @Transactional
    public AssessmentDtos.AttemptResponse submit(String assessmentId, String text, UserPrincipal principal) {
        if (principal.role() != Role.PARTICIPANT) {
            throw ApiException.forbidden("FORBIDDEN", "Only participants can submit assessments.");
        }
        Assessment assessment = assessments.findById(assessmentId)
                .orElseThrow(() -> ApiException.notFound("ASSESSMENT_NOT_FOUND",
                        "That assessment could not be found."));
        Enrolment enrolment = enrolments
                .findByProgrammeIdAndUserId(assessment.getProgramme().getId(), principal.id())
                .orElseThrow(() -> ApiException.forbidden("ENROLMENT_REQUIRED",
                        "Enrol in the programme before submitting its assessments."));
        if (enrolment.getStatus() != EnrolmentStatus.ACTIVE && enrolment.getStatus() != EnrolmentStatus.COMPLETED) {
            throw ApiException.forbidden("ENROLMENT_REQUIRED",
                    "Your enrolment is not active. Contact the programme facilitator.");
        }
        if (!assessment.isOpenAt(Instant.now())) {
            throw ApiException.conflict("ASSESSMENT_LOCKED",
                    "This assessment is not open for submissions.");
        }
        long used = attempts.countByAssessmentIdAndUserId(assessmentId, principal.id());
        if (used >= assessment.getMaxAttempts()) {
            throw ApiException.conflict("ATTEMPT_LIMIT_REACHED",
                    "You have used all of the available attempts for this assessment.");
        }
        AssessmentAttempt latest = attempts
                .findFirstByAssessmentIdAndUserIdOrderByAttemptNoDesc(assessmentId, principal.id())
                .orElse(null);
        if (latest != null && latest.getStatus() == AttemptStatus.SUBMITTED) {
            throw ApiException.conflict("ASSESSMENT_ALREADY_SUBMITTED",
                    "This assessment is already waiting to be graded.");
        }
        User user = users.findById(principal.id())
                .orElseThrow(() -> ApiException.notFound("USER_NOT_FOUND", "That account could not be found."));
        try {
            AssessmentAttempt attempt = attempts.saveAndFlush(
                    AssessmentAttempt.submit(assessment, user, (int) used + 1, text));
            return AssessmentDtos.AttemptResponse.from(attempt);
        } catch (DataIntegrityViolationException ex) {
            throw ApiException.conflict("ASSESSMENT_ALREADY_SUBMITTED",
                    "This assessment is already waiting to be graded.");
        }
    }

    @Transactional
    public AssessmentDtos.AttemptResponse grade(String assessmentId, String attemptId,
                                                AssessmentDtos.GradeRequest request,
                                                UserPrincipal principal) {
        Assessment assessment = assessments.findById(assessmentId)
                .orElseThrow(() -> ApiException.notFound("ASSESSMENT_NOT_FOUND",
                        "That assessment could not be found."));
        Programme programme = assessment.getProgramme();
        boolean owner = programme.getFacilitator().getId().equals(principal.id());
        if (principal.role() != Role.ADMIN && !(principal.role() == Role.FACILITATOR && owner)) {
            throw ApiException.forbidden("FORBIDDEN",
                    "Only the programme facilitator or an administrator can grade this assessment.");
        }
        AssessmentAttempt attempt = attempts.findByIdAndAssessmentId(attemptId, assessmentId)
                .orElseThrow(() -> ApiException.notFound("ATTEMPT_NOT_FOUND",
                        "That assessment attempt could not be found."));
        if (attempt.getStatus() != AttemptStatus.SUBMITTED) {
            throw ApiException.conflict("ATTEMPT_ALREADY_GRADED",
                    "This attempt has already been graded.");
        }
        if (request.score() > assessment.getMaxScore()) {
            throw ApiException.validation("score",
                    "The score cannot exceed " + assessment.getMaxScore() + ".");
        }
        User grader = users.findById(principal.id())
                .orElseThrow(() -> ApiException.notFound("USER_NOT_FOUND", "That account could not be found."));
        try {
            attempt.grade(grader, request.score(), request.feedback());
        } catch (IllegalArgumentException ex) {
            throw ApiException.validation("score", ex.getMessage());
        }
        notifications.notifyUser(attempt.getUser(), "Assessment graded",
                "\"" + assessment.getTitle() + "\" scored " + request.score() + "/" + assessment.getMaxScore() + ".",
                "/app/assessments", NotificationKind.APPROVAL);
        certificates.issueIfEligible(programme.getId(), attempt.getUser().getId(), grader);
        return AssessmentDtos.AttemptResponse.from(attempt);
    }

    /**
     * Quiz questions for one assessment. Participants never receive the correct
     * option; staff preview the same shapes so the UI is identical.
     */
    @Transactional(readOnly = true)
    public List<AssessmentDtos.QuestionResponse> listQuestions(String assessmentId,
                                                               UserPrincipal principal) {
        Assessment assessment = assessments.findById(assessmentId)
                .orElseThrow(() -> ApiException.notFound("ASSESSMENT_NOT_FOUND",
                        "That assessment could not be found."));
        boolean staff = principal.role() == Role.ADMIN
                || (principal.role() == Role.FACILITATOR && assessment.getProgramme().getFacilitator() != null
                        && assessment.getProgramme().getFacilitator().getId().equals(principal.id()));
        if (!staff && enrolments
                .findByProgrammeIdAndUserId(assessment.getProgramme().getId(), principal.id()).isEmpty()) {
            throw ApiException.forbidden("ENROLMENT_REQUIRED",
                    "Enrol in the programme to open its assessments.");
        }
        return questions.findByAssessmentIdOrderByPositionAsc(assessmentId).stream()
                .map(question -> new AssessmentDtos.QuestionResponse(
                        question.getId(),
                        question.getPrompt(),
                        question.getPoints(),
                        question.getOptions().stream()
                                .map(AssessmentQuestion.AnswerOption::getLabel)
                                .toList()))
                .toList();
    }

    /**
     * Submits and automatically marks a multiple-choice quiz. Every question must
     * be answered exactly once; points come from the question bank, never from the
     * client, so a tampered request cannot inflate a score.
     */
    @Transactional
    public AssessmentDtos.AttemptResponse submitQuiz(String assessmentId,
                                                     AssessmentDtos.QuizSubmitRequest request,
                                                     UserPrincipal principal) {
        if (principal.role() != Role.PARTICIPANT) {
            throw ApiException.forbidden("FORBIDDEN", "Only participants can submit assessments.");
        }
        Assessment assessment = assessments.findById(assessmentId)
                .orElseThrow(() -> ApiException.notFound("ASSESSMENT_NOT_FOUND",
                        "That assessment could not be found."));
        if (assessment.getType() != AssessmentType.QUIZ) {
            throw ApiException.validation("assessmentId",
                    "That assessment is submitted in writing, not as a quiz.");
        }
        Enrolment enrolment = enrolments
                .findByProgrammeIdAndUserId(assessment.getProgramme().getId(), principal.id())
                .orElseThrow(() -> ApiException.forbidden("ENROLMENT_REQUIRED",
                        "Enrol in the programme before submitting its assessments."));
        if (enrolment.getStatus() != EnrolmentStatus.ACTIVE && enrolment.getStatus() != EnrolmentStatus.COMPLETED) {
            throw ApiException.forbidden("ENROLMENT_REQUIRED",
                    "Your enrolment is not active. Contact the programme facilitator.");
        }
        if (!assessment.isOpenAt(Instant.now())) {
            throw ApiException.conflict("ASSESSMENT_LOCKED",
                    "This assessment is not open for submissions.");
        }
        long used = attempts.countByAssessmentIdAndUserId(assessmentId, principal.id());
        if (used >= assessment.getMaxAttempts()) {
            throw ApiException.conflict("ATTEMPT_LIMIT_REACHED",
                    "You have used all of the available attempts for this assessment.");
        }
        AssessmentAttempt latest = attempts
                .findFirstByAssessmentIdAndUserIdOrderByAttemptNoDesc(assessmentId, principal.id())
                .orElse(null);
        if (latest != null && latest.getStatus() == AttemptStatus.SUBMITTED) {
            throw ApiException.conflict("ASSESSMENT_ALREADY_SUBMITTED",
                    "This assessment is already waiting to be graded.");
        }

        List<AssessmentQuestion> bank = questions.findByAssessmentIdOrderByPositionAsc(assessmentId);
        if (bank.isEmpty()) {
            throw ApiException.conflict("ASSESSMENT_HAS_NO_QUESTIONS",
                    "This quiz has no questions yet. Contact your facilitator.");
        }
        Map<String, AssessmentQuestion> byId = new LinkedHashMap<>();
        bank.forEach(question -> byId.put(question.getId(), question));
        Map<String, Integer> choices = new LinkedHashMap<>();
        for (AssessmentDtos.QuizAnswerRequest answer : request.answers()) {
            AssessmentQuestion question = byId.get(answer.questionId());
            if (question == null) {
                throw ApiException.validation("answers",
                        "One of the answers does not belong to this assessment.");
            }
            if (!question.hasOption(answer.optionIndex())) {
                throw ApiException.validation("answers", "Choose one of the listed options for every question.");
            }
            if (choices.put(question.getId(), answer.optionIndex()) != null) {
                throw ApiException.validation("answers", "Answer each question once.");
            }
        }
        if (choices.size() != bank.size()) {
            throw ApiException.validation("answers", "Answer every question before submitting.");
        }

        int score = 0;
        StringBuilder submitted = new StringBuilder();
        for (AssessmentQuestion question : bank) {
            int chosen = choices.get(question.getId());
            score += question.score(chosen);
            submitted.append(question.getPrompt())
                    .append(" -> ")
                    .append(question.getOptions().get(chosen).getLabel())
                    .append(System.lineSeparator());
        }
        score = Math.min(score, assessment.getMaxScore());

        User user = users.findById(principal.id())
                .orElseThrow(() -> ApiException.notFound("USER_NOT_FOUND", "That account could not be found."));
        AssessmentAttempt attempt = attempts.saveAndFlush(AssessmentAttempt.autoGraded(
                assessment, user, (int) used + 1, submitted.toString(), score,
                "Scored automatically from " + bank.size() + " questions."));
        List<AssessmentAttemptAnswer> recorded = new ArrayList<>(bank.size());
        for (AssessmentQuestion question : bank) {
            recorded.add(AssessmentAttemptAnswer.record(attempt, question, choices.get(question.getId())));
        }
        answers.saveAll(recorded);

        notifications.notifyUser(user, "Quiz scored",
                "\"" + assessment.getTitle() + "\" scored " + score + "/" + assessment.getMaxScore() + ".",
                "/app/assessments", NotificationKind.APPROVAL);
        certificates.issueIfEligible(assessment.getProgramme().getId(), user.getId(), user);
        return AssessmentDtos.AttemptResponse.from(attempt);
    }

    /**
     * Creates an assessment. A quiz must declare a question bank whose points add
     * up to the maximum score, so automatic marking can never exceed the total.
     */
    @Transactional
    public AssessmentDtos.AssessmentResponse createAssessment(AssessmentDtos.CreateAssessmentRequest request,
                                                              UserPrincipal principal) {
        Programme programme = programmes.findById(request.programmeId())
                .orElseThrow(() -> ApiException.notFound("PROGRAMME_NOT_FOUND",
                        "That programme could not be found."));
        boolean owner = programme.getFacilitator() != null
                && programme.getFacilitator().getId().equals(principal.id());
        if (principal.role() != Role.ADMIN && !(principal.role() == Role.FACILITATOR && owner)) {
            throw ApiException.forbidden("FORBIDDEN",
                    "Only the programme facilitator or an administrator can create assessments.");
        }
        List<AssessmentDtos.CreateQuestionRequest> questionRequests = request.questions() == null
                ? List.of() : request.questions();
        if (request.type() == AssessmentType.QUIZ) {
            if (questionRequests.isEmpty()) {
                throw ApiException.validation("questions", "A quiz needs at least one question.");
            }
            int total = questionRequests.stream().mapToInt(AssessmentDtos.CreateQuestionRequest::points).sum();
            if (total != request.maxScore()) {
                throw ApiException.validation("maxScore",
                        "The maximum score must equal the question points total (" + total + ").");
            }
        }
        Assessment assessment = Assessment.create(programme, request.title(), request.type(),
                request.description(), Instant.now(), request.dueAt(), request.maxScore(),
                request.maxAttempts(), true, List.of(), List.of());
        int position = 0;
        for (AssessmentDtos.CreateQuestionRequest questionRequest : questionRequests) {
            List<AssessmentQuestion.AnswerOption> options = new ArrayList<>();
            for (int index = 0; index < questionRequest.options().size(); index++) {
                options.add(new AssessmentQuestion.AnswerOption(questionRequest.options().get(index),
                        index == questionRequest.correctIndex()));
            }
            assessment.addQuestion(AssessmentQuestion.create(assessment, questionRequest.prompt(),
                    questionRequest.points(), position++, options));
        }
        Assessment saved = assessments.saveAndFlush(assessment);
        return toResponse(saved, principal.id());
    }

    private AssessmentDtos.AssessmentResponse toResponse(Assessment assessment, String userId) {
        Instant now = Instant.now();
        AssessmentAttempt latest = attempts
                .findFirstByAssessmentIdAndUserIdOrderByAttemptNoDesc(assessment.getId(), userId)
                .orElse(null);
        long used = attempts.countByAssessmentIdAndUserId(assessment.getId(), userId);
        String status;
        if (latest != null) {
            status = latest.getStatus() == AttemptStatus.GRADED ? "graded" : "submitted";
        } else {
            status = assessment.isOpenAt(now) ? "available" : "locked";
        }
        boolean attemptAllowed = assessment.isOpenAt(now)
                && used < assessment.getMaxAttempts()
                && (latest == null || latest.getStatus() == AttemptStatus.GRADED);
        return new AssessmentDtos.AssessmentResponse(
                assessment.getId(),
                assessment.getTitle(),
                assessment.getProgramme().getId(),
                assessment.getType(),
                assessment.getDescription(),
                List.copyOf(assessment.getInstructions()),
                assessment.getDueAt(),
                assessment.getMaxScore(),
                status,
                latest == null ? null : latest.getSubmittedAt(),
                latest == null ? null : latest.getScore(),
                latest == null ? null : latest.getFeedback(),
                assessment.getCriteria().stream().map(AssessmentDtos.CriterionResponse::from).toList(),
                attemptAllowed);
    }
}
