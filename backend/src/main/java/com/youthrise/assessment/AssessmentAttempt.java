package com.youthrise.assessment;

import com.youthrise.common.BaseEntity;
import com.youthrise.common.exception.ScoringException;
import com.youthrise.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;

@Entity
@Table(name = "assessment_attempts", uniqueConstraints =
        @UniqueConstraint(name = "uk_attempts_assessment_user_no",
                columnNames = {"assessment_id", "user_id", "attempt_no"}))
public class AssessmentAttempt extends BaseEntity implements Assessable {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assessment_id", nullable = false)
    private Assessment assessment;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "attempt_no", nullable = false)
    private int attemptNo;

    @Column(name = "body", nullable = false, columnDefinition = "mediumtext")
    private String body;

    @Column(name = "submitted_at", nullable = false)
    private Instant submittedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    private AttemptStatus status;

    @Column(name = "score")
    private Integer score;

    @Column(name = "feedback", length = 2000)
    private String feedback;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grader_id")
    private User grader;

    @Column(name = "graded_at")
    private Instant gradedAt;

    protected AssessmentAttempt() {
    }

    public static AssessmentAttempt submit(Assessment assessment, User user, int attemptNo, String body) {
        AssessmentAttempt attempt = new AssessmentAttempt();
        attempt.assessment = assessment;
        attempt.user = user;
        attempt.attemptNo = attemptNo;
        attempt.body = body.trim();
        attempt.submittedAt = Instant.now();
        attempt.status = AttemptStatus.SUBMITTED;
        return attempt;
    }

    /**
     * Records an automatically marked quiz attempt. The score is checked against
     * the assessment maximum exactly as a human marking would be, and no grader
     * account is recorded because no person reviewed it.
     */
    public static AssessmentAttempt autoGraded(Assessment assessment, User user, int attemptNo,
                                               String body, int score, String feedback) {
        AssessmentAttempt attempt = submit(assessment, user, attemptNo, body);
        if (score < 0 || score > assessment.getMaxScore()) {
            throw new ScoringException(assessment.getMaxScore());
        }
        attempt.status = AttemptStatus.GRADED;
        attempt.score = score;
        attempt.feedback = feedback;
        attempt.gradedAt = Instant.now();
        return attempt;
    }

    public void grade(User grader, int score, String feedback) {
        if (status != AttemptStatus.SUBMITTED) {
            throw new IllegalStateException("Only ungraded attempts can be marked");
        }
        if (score < 0 || score > assessment.getMaxScore()) {
            throw new ScoringException(assessment.getMaxScore());
        }
        this.status = AttemptStatus.GRADED;
        this.score = score;
        this.feedback = feedback;
        this.grader = grader;
        this.gradedAt = Instant.now();
    }

    @Override
    public int maxScore() {
        return assessment.getMaxScore();
    }

    @Override
    public Integer awardedScore() {
        return score;
    }

    @Override
    public boolean isGraded() {
        return status == AttemptStatus.GRADED;
    }

    public Assessment getAssessment() {
        return assessment;
    }

    public User getUser() {
        return user;
    }

    public int getAttemptNo() {
        return attemptNo;
    }

    public String getBody() {
        return body;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public AttemptStatus getStatus() {
        return status;
    }

    public Integer getScore() {
        return score;
    }

    public String getFeedback() {
        return feedback;
    }

    public User getGrader() {
        return grader;
    }

    public Instant getGradedAt() {
        return gradedAt;
    }
}
