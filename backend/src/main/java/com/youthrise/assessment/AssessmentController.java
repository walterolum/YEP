package com.youthrise.assessment;

import com.youthrise.user.UserPrincipal;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AssessmentController {

    private final AssessmentService assessments;

    public AssessmentController(AssessmentService assessments) {
        this.assessments = assessments;
    }

    @GetMapping("/me/assessments")
    public List<AssessmentDtos.AssessmentResponse> mine(@AuthenticationPrincipal UserPrincipal principal) {
        return assessments.listForUser(principal.id());
    }

    /** Quiz question bank for the signed-in account (correct answers never included). */
    @GetMapping("/assessments/{id}/questions")
    public List<AssessmentDtos.QuestionResponse> questions(@PathVariable String id,
                                                          @AuthenticationPrincipal UserPrincipal principal) {
        return assessments.listQuestions(id, principal);
    }

    @PostMapping("/assessments/{id}/quiz-attempts")
    public AssessmentDtos.AttemptResponse submitQuiz(
            @PathVariable String id,
            @Valid @RequestBody AssessmentDtos.QuizSubmitRequest body,
            @AuthenticationPrincipal UserPrincipal principal) {
        return assessments.submitQuiz(id, body, principal);
    }

    @PostMapping("/assessments")
    public ResponseEntity<AssessmentDtos.AssessmentResponse> create(
            @Valid @RequestBody AssessmentDtos.CreateAssessmentRequest body,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
                .body(assessments.createAssessment(body, principal));
    }

    @PostMapping("/assessments/{id}/submissions")
    public ResponseEntity<Void> submit(@PathVariable String id,
                                       @Valid @RequestBody AssessmentDtos.SubmitRequest body,
                                       @AuthenticationPrincipal UserPrincipal principal) {
        assessments.submit(id, body.text(), principal);
        return ResponseEntity.noContent().build();
    }

    /** Grading endpoint used by the facilitator workspace (documented contract extension). */
    @PostMapping("/assessments/{id}/attempts/{attemptId}/grade")
    public AssessmentDtos.AttemptResponse grade(@PathVariable String id,
                                                @PathVariable String attemptId,
                                                @Valid @RequestBody AssessmentDtos.GradeRequest body,
                                                @AuthenticationPrincipal UserPrincipal principal) {
        return assessments.grade(id, attemptId, body, principal);
    }
}
