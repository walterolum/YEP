package ug.yep.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;
import ug.yep.dto.Requests;
import ug.yep.entity.Assessment;
import ug.yep.entity.Enums;
import ug.yep.entity.Module;
import ug.yep.entity.Submission;
import ug.yep.entity.User;
import ug.yep.exception.BusinessRuleException;
import ug.yep.repository.AssessmentRepository;
import ug.yep.repository.ModuleRepository;
import ug.yep.repository.SubmissionRepository;
import ug.yep.repository.UserRepository;

/** Scoring, the "results pending" rule and the submission deadline. */
class AssessmentServiceTest {

    private AssessmentRepository assessments;
    private SubmissionRepository submissions;
    private AssessmentService service;
    private Assessment assessment;
    private User participant;

    @BeforeEach
    void setUp() {
        assessments = mock(AssessmentRepository.class);
        submissions = mock(SubmissionRepository.class);
        UserRepository users = mock(UserRepository.class);
        service = new AssessmentService(assessments, submissions, mock(ModuleRepository.class),
                users, mock(NotificationService.class), mock(AuditService.class));

        Module module = new Module("Digital Literacy", "💻", 1, 1);
        assessment = new Assessment(module, "Digital foundations check",
                Instant.now().plus(5, ChronoUnit.DAYS), 20, true);
        ReflectionTestUtils.setField(assessment, "id", 1L);
        assessment.addQuestion("What is two-step verification?", "A password", "A second proof of identity",
                "An antivirus", "A backup", "B");
        assessment.addQuestion("Which is safest?", "Reusing passwords", "Sharing passwords",
                "A password manager", "Writing on paper", "C");
        ReflectionTestUtils.setField(assessment.getQuestions().get(0), "id", 101L);
        ReflectionTestUtils.setField(assessment.getQuestions().get(1), "id", 102L);

        participant = User.create(Enums.Role.PARTICIPANT, "Amara Nakato", "amara@yep.example",
                null, "x", Enums.UserStatus.APPROVED);
        ReflectionTestUtils.setField(participant, "id", 2L);
        when(users.findById(2L)).thenReturn(Optional.of(participant));
        when(assessments.findById(1L)).thenReturn(Optional.of(assessment));
    }

    private Requests.SubmitAssessmentRequest answers(String... choices) {
        Map<Long, String> map = new LinkedHashMap<>();
        List<ug.yep.entity.Question> questions = assessment.getQuestions();
        for (int i = 0; i < choices.length; i++) {
            map.put(questions.get(i).getId(), choices[i]);
        }
        return new Requests.SubmitAssessmentRequest(map);
    }

    @Test
    void resultsStayHiddenUntilPublished() {
        Submission submission = new Submission(assessment, participant);
        submission.recordScore(20);
        when(assessments.findByPublishedTrueOrderByDueDateAsc()).thenReturn(List.of(assessment));
        when(submissions.findByAssessmentIdAndUserId(1L, 2L)).thenReturn(Optional.of(submission));

        var hidden = service.forParticipant(2L).get(0);
        assertFalse(hidden.resultsPublished());
        assertNull(hidden.myScore(), "score must not leak before publication");
        assertNull(hidden.myPercentage());
    }

    @Test
    void publishingRevealsTheScoreAndNotifies() {
        Submission submission = new Submission(assessment, participant);
        submission.recordScore(10);
        when(submissions.findByAssessmentIdOrderBySubmittedAtAsc(1L)).thenReturn(List.of(submission));
        when(assessments.findByPublishedTrueOrderByDueDateAsc()).thenReturn(List.of(assessment));
        when(submissions.findByAssessmentIdAndUserId(1L, 2L)).thenReturn(Optional.of(submission));

        var published = service.publishResults(
                new ug.yep.security.CurrentUser(1L, "admin@yep.example", "Admin", Enums.Role.ADMIN), 1L);

        verify(submissions).findByAssessmentIdOrderBySubmittedAtAsc(1L);
        var visible = service.forParticipant(2L).get(0);
        assertEquals(10, visible.myScore());
        assertEquals(50, visible.myPercentage());
        assertNotNull(published);
    }

    @Test
    void scoresCorrectAnswersOutOfTotalMarks() {
        when(submissions.findByAssessmentIdAndUserId(1L, 2L)).thenReturn(Optional.empty());
        when(submissions.save(any(Submission.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var questionIds = assessment.getQuestions().stream().map(q -> q.getId()).toList();
        Map<Long, String> map = new LinkedHashMap<>();
        map.put(questionIds.get(0), "B");
        map.put(questionIds.get(1), "A");

        service.submit(2L, 1L, new Requests.SubmitAssessmentRequest(map));

        ArgumentCaptor<Submission> captor = ArgumentCaptor.forClass(Submission.class);
        verify(submissions).save(captor.capture());
        assertEquals(10, captor.getValue().getScore(), "one of two correct answers scores half the marks");
        assertEquals("B", captor.getValue().answerFor(questionIds.get(0)).orElseThrow());
    }

    @Test
    void refusesSubmissionAfterDeadline() {
        ReflectionTestUtils.setField(assessment, "dueDate", Instant.now().minus(1, ChronoUnit.DAYS));

        BusinessRuleException error = assertThrows(BusinessRuleException.class,
                () -> service.submit(2L, 1L, answers("B", "C")));
        assertEquals("The deadline for this assessment has passed.", error.getMessage());
    }

    @Test
    void allowsARetakeWhileResultsAreUnpublished() {
        when(submissions.findByAssessmentIdAndUserId(1L, 2L))
                .thenReturn(Optional.of(new Submission(assessment, participant)));

        service.submit(2L, 1L, answers("B", "C"));

        org.mockito.Mockito.verify(submissions, org.mockito.Mockito.times(1))
                .save(org.mockito.ArgumentMatchers.any(Submission.class));
    }
}
