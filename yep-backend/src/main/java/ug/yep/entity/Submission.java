package ug.yep.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/** A participant's answer sheet and score for one assessment. */
@Entity
@Table(name = "submissions", uniqueConstraints =
        @UniqueConstraint(name = "uk_submissions_assessment_user", columnNames = {"assessment_id", "user_id"}))
public class Submission extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assessment_id", nullable = false)
    private Assessment assessment;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "score")
    private Integer score;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "graded_by")
    private User gradedBy;

    @Column(name = "submitted_at", nullable = false)
    private Instant submittedAt;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "submission_answers", joinColumns = @JoinColumn(name = "submission_id"))
    private List<SubmissionAnswer> answers = new ArrayList<>();

    protected Submission() {
    }

    public Submission(Assessment assessment, User user) {
        this.assessment = assessment;
        this.user = user;
        this.submittedAt = Instant.now();
    }

    /** One chosen option for one question. */
    @Embeddable
    public static class SubmissionAnswer {

        @Column(name = "question_id", nullable = false)
        private Long questionId;

        @Column(name = "chosen_option", nullable = false, length = 1)
        private String chosenOption;

        protected SubmissionAnswer() {
        }

        public SubmissionAnswer(Long questionId, String chosenOption) {
            this.questionId = questionId;
            this.chosenOption = chosenOption == null ? null
                    : chosenOption.toUpperCase(java.util.Locale.ROOT);
        }

        public Long getQuestionId() {
            return questionId;
        }

        public String getChosenOption() {
            return chosenOption;
        }
    }

    public void recordAnswer(Long questionId, String chosenOption) {
        answers.removeIf(answer -> answer.getQuestionId().equals(questionId));
        answers.add(new SubmissionAnswer(questionId, chosenOption));
    }

    public Optional<String> answerFor(Long questionId) {
        return answers.stream()
                .filter(answer -> answer.getQuestionId().equals(questionId))
                .map(SubmissionAnswer::getChosenOption)
                .findFirst();
    }

    public void recordScore(int score) {
        this.score = score;
    }

    public void setGradedBy(User gradedBy) {
        this.gradedBy = gradedBy;
    }

    public Assessment getAssessment() {
        return assessment;
    }

    public User getUser() {
        return user;
    }

    public Integer getScore() {
        return score;
    }

    public User getGradedBy() {
        return gradedBy;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public List<SubmissionAnswer> getAnswers() {
        return answers;
    }
}
