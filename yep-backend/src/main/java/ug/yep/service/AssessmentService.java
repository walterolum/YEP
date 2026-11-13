package ug.yep.service;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ug.yep.dto.Requests;
import ug.yep.dto.Views;
import ug.yep.entity.Assessment;
import ug.yep.entity.Question;
import ug.yep.entity.Submission;
import ug.yep.entity.User;
import ug.yep.exception.BusinessRuleException;
import ug.yep.exception.ForbiddenException;
import ug.yep.exception.NotFoundException;
import ug.yep.repository.AssessmentRepository;
import ug.yep.repository.ModuleRepository;
import ug.yep.repository.SubmissionRepository;
import ug.yep.repository.UserRepository;
import ug.yep.security.CurrentUser;

/** Assessments, scoring and the "results pending" publishing rule. */
@Service
public class AssessmentService {

    private final AssessmentRepository assessments;
    private final SubmissionRepository submissions;
    private final ModuleRepository modules;
    private final UserRepository users;
    private final NotificationService notifications;
    private final AuditService audit;

    public AssessmentService(AssessmentRepository assessments, SubmissionRepository submissions,
                             ModuleRepository modules, UserRepository users,
                             NotificationService notifications, AuditService audit) {
        this.assessments = assessments;
        this.submissions = submissions;
        this.modules = modules;
        this.users = users;
        this.notifications = notifications;
        this.audit = audit;
    }

    /** Participants only ever see published assessments, plus their own submission state. */
    @Transactional(readOnly = true)
    public List<Views.AssessmentView> forParticipant(Long userId) {
        return assessments.findByPublishedTrueOrderByDueDateAsc().stream()
                .map(assessment -> {
                    Optional<Submission> submission =
                            submissions.findByAssessmentIdAndUserId(assessment.getId(), userId);
                    boolean visible = assessment.isResultsPublished();
                    Integer score = visible ? submission.map(Submission::getScore).orElse(null) : null;
                    Integer percentage = score == null ? null : assessment.percentage(score);
                    return new Views.AssessmentView(assessment.getId(), assessment.getTitle(),
                            assessment.getModule().getName(), assessment.getDueDate(),
                            assessment.getTotalMarks(), assessment.isPublished(),
                            assessment.isResultsPublished(), submission.isPresent(), score, percentage);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Views.AssessmentView> all() {
        return assessments.findAllByOrderByDueDateAsc().stream()
                .map(assessment -> new Views.AssessmentView(assessment.getId(), assessment.getTitle(),
                        assessment.getModule().getName(), assessment.getDueDate(),
                        assessment.getTotalMarks(), assessment.isPublished(),
                        assessment.isResultsPublished(), false, null, null))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Views.QuestionView> questionsFor(Long assessmentId, Long userId) {
        Assessment assessment = require(assessmentId);
        if (!assessment.isPublished()) {
            throw new BusinessRuleException("This assessment is not published yet.");
        }
        if (assessment.isResultsPublished() && submissions
                .findByAssessmentIdAndUserId(assessmentId, userId).isEmpty()) {
            throw new BusinessRuleException("This assessment is already closed.");
        }
        return assessment.getQuestions().stream().map(Views.QuestionView::of).toList();
    }

    @Transactional
    public Map<String, Object> submit(Long userId, Long assessmentId, Requests.SubmitAssessmentRequest request) {
        Assessment assessment = require(assessmentId);
        if (!assessment.isPublished()) {
            throw new BusinessRuleException("This assessment is not open yet.");
        }
        if (assessment.isResultsPublished()) {
            throw new BusinessRuleException("Results for this assessment have already been published.");
        }
        if (Instant.now().isAfter(assessment.getDueDate())) {
            throw new BusinessRuleException("The deadline for this assessment has passed.");
        }
        if (submissions.findByAssessmentIdAndUserId(assessmentId, userId).isPresent()) {
            throw new BusinessRuleException("You have already submitted this assessment.");
        }
        User participant = users.findById(userId).orElseThrow(() -> new NotFoundException("Account"));
        Submission submission = new Submission(assessment, participant);

        int correct = 0;
        for (Question question : assessment.getQuestions()) {
            String choice = normalizeChoice(question, request.answers().get(question.getId()));
            if (choice == null) {
                continue;
            }
            submission.recordAnswer(question.getId(), choice);
            if (question.isCorrect(choice)) {
                correct++;
            }
        }
        int totalQuestions = assessment.getQuestions().size();
        int score = totalQuestions == 0 ? 0
                : (int) Math.round(correct * (double) assessment.getTotalMarks() / totalQuestions);
        submission.recordScore(score);
        submissions.save(submission);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("submitted", true);
        response.put("message", "Your answers were submitted. Results will appear after your facilitator publishes them.");
        response.put("submittedAt", submission.getSubmittedAt().toString());
        return response;
    }

    /** Accepts either an option letter (A-D) or the full option text and stores the letter. */
    private String normalizeChoice(Question question, String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String value = raw.trim();
        if (value.length() == 1 && "ABCD".contains(value.toUpperCase(java.util.Locale.ROOT))) {
            return value.toUpperCase(java.util.Locale.ROOT);
        }
        int index = question.options().indexOf(value);
        return index >= 0 ? String.valueOf((char) ('A' + index))
                : value.toUpperCase(java.util.Locale.ROOT);
    }

    @Transactional
    public Views.AssessmentView publishResults(CurrentUser actor, Long assessmentId) {
        Assessment assessment = require(assessmentId);
        assessment.publishResults(true);
        List<Submission> marked = submissions.findByAssessmentIdOrderBySubmittedAtAsc(assessmentId);
        for (Submission submission : marked) {
            notifications.send(submission.getUser(), "ASSESSMENT",
                    "Results for " + assessment.getTitle() + " are now available. You scored "
                            + submission.getScore() + "/" + assessment.getTotalMarks() + ".");
        }
        User actorUser = users.findById(actor.id()).orElse(null);
        audit.record(actorUser, "ASSESSMENT_PUBLISH", "assessment", assessmentId,
                "Results published for " + assessment.getTitle());
        return new Views.AssessmentView(assessment.getId(), assessment.getTitle(),
                assessment.getModule().getName(), assessment.getDueDate(), assessment.getTotalMarks(),
                assessment.isPublished(), assessment.isResultsPublished(), false, null, null);
    }

    @Transactional
    public Views.AssessmentView create(Requests.CreateAssessmentRequest request) {
        Assessment assessment = new Assessment(
                modules.findById(request.moduleId()).orElseThrow(() -> new NotFoundException("Module")),
                request.title(), request.dueDate(),
                Math.max(1, request.questions() == null ? 1 : request.questions().size()),
                request.published());
        if (request.questions() != null) {
            for (Requests.QuestionRequest question : request.questions()) {
                assessment.addQuestion(question.prompt(), question.optionA(), question.optionB(),
                        question.optionC(), question.optionD(), question.correctOption());
            }
        }
        assessments.save(assessment);
        return new Views.AssessmentView(assessment.getId(), assessment.getTitle(),
                assessment.getModule().getName(), assessment.getDueDate(), assessment.getTotalMarks(),
                assessment.isPublished(), false, false, null, null);
    }

    /** Roster with scores, for facilitators. Results stay visible here because staff review them. */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> roster(Long assessmentId, CurrentUser actor) {
        if (!actor.hasRole(ug.yep.entity.Enums.Role.ADMIN, ug.yep.entity.Enums.Role.FACILITATOR,
                ug.yep.entity.Enums.Role.MENTOR)) {
            throw new ForbiddenException("Only staff can view the assessment roster.");
        }
        Assessment assessment = require(assessmentId);
        return submissions.findByAssessmentIdOrderBySubmittedAtAsc(assessmentId).stream()
                .map(submission -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("student", submission.getUser().getFullName());
                    row.put("email", submission.getUser().getEmail());
                    row.put("score", submission.getScore());
                    row.put("totalMarks", assessment.getTotalMarks());
                    row.put("percentage", submission.getScore() == null ? null
                            : assessment.percentage(submission.getScore()));
                    row.put("submittedAt", submission.getSubmittedAt().toString());
                    return row;
                })
                .toList();
    }

    private Assessment require(Long id) {
        return assessments.findById(id).orElseThrow(() -> new NotFoundException("Assessment"));
    }
}
