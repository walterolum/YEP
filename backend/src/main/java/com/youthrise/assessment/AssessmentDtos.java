package com.youthrise.assessment;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;

public final class AssessmentDtos {

    private AssessmentDtos() {
    }

    public record CriterionResponse(String id, String label, String description, int maxScore) {

        static CriterionResponse from(Assessment.Criterion criterion) {
            return new CriterionResponse(criterion.getCode(), criterion.getLabel(),
                    criterion.getDescription(), criterion.getMaxScore());
        }
    }

    public record AssessmentResponse(
            String id,
            String title,
            String programmeId,
            AssessmentType type,
            String description,
            List<String> instructions,
            Instant dueAt,
            int maxScore,
            String status,
            Instant submittedAt,
            Integer score,
            String feedback,
            List<CriterionResponse> criteria,
            boolean attemptAllowed) {
    }

    public record SubmitRequest(
            @NotBlank(message = "Write your response before submitting.")
            @Size(max = 20000, message = "Use 20000 characters or fewer.") String text) {
    }

    public record GradeRequest(
            @NotNull(message = "Enter a score.")
            @Min(value = 0, message = "Scores cannot be negative.") Integer score,
            @NotBlank(message = "Add feedback for the participant.")
            @Size(max = 2000, message = "Use 2000 characters or fewer.") String feedback) {
    }

    /** A quiz question without its correct answer, safe to send to a participant. */
    public record QuestionResponse(String id, String prompt, int points, List<String> options) {
    }

    public record QuizAnswerRequest(
            @NotBlank(message = "Each answer needs a question.") String questionId,
            @Min(value = 0, message = "Choose one of the listed options.") int optionIndex) {
    }

    public record QuizSubmitRequest(
            @NotEmpty(message = "Answer the questions before submitting.")
            @Size(max = 100, message = "This quiz has too many answers.")
            List<@Valid QuizAnswerRequest> answers) {
    }

    public record CreateQuestionRequest(
            @NotBlank(message = "Write the question.")
            @Size(max = 1000, message = "Use 1000 characters or fewer.") String prompt,
            @Min(value = 1, message = "A question is worth at least one point.") int points,
            @NotEmpty(message = "Add at least two answer options.")
            @Size(min = 2, max = 8, message = "Add between two and eight options.")
            List<@NotBlank @Size(max = 500) String> options,
            @Min(value = 0, message = "Choose which option is correct.") int correctIndex) {
    }

    public record CreateAssessmentRequest(
            @NotBlank(message = "Choose a programme.") String programmeId,
            @NotBlank(message = "Give the assessment a title.")
            @Size(max = 160, message = "Use 160 characters or fewer.") String title,
            @NotNull(message = "Choose an assessment type.") AssessmentType type,
            @NotBlank(message = "Describe the assessment.")
            @Size(max = 1000, message = "Use 1000 characters or fewer.") String description,
            @NotNull(message = "Set a due date.") Instant dueAt,
            @Min(value = 1, message = "The maximum score must be at least one.") int maxScore,
            @Min(value = 1, message = "Allow at least one attempt.") int maxAttempts,
            @Size(max = 50, message = "Add at most 50 questions.") List<@Valid CreateQuestionRequest> questions) {
    }

    public record AttemptResponse(
            String id,
            String assessmentId,
            String userId,
            int attemptNo,
            String body,
            Instant submittedAt,
            AttemptStatus status,
            Integer score,
            String feedback,
            Instant gradedAt) {

        static AttemptResponse from(AssessmentAttempt attempt) {
            return new AttemptResponse(attempt.getId(), attempt.getAssessment().getId(),
                    attempt.getUser().getId(), attempt.getAttemptNo(), attempt.getBody(),
                    attempt.getSubmittedAt(), attempt.getStatus(), attempt.getScore(),
                    attempt.getFeedback(), attempt.getGradedAt());
        }
    }
}
