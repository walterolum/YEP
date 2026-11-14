package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

/** One timed attempt at an assessment; retakes are separate rows. */
@Entity
@Table(name = "assessment_attempts")
public class AssessmentAttempt extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assessment_id", nullable = false)
    private Assessment assessment;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @Column(name = "score")
    private Integer score;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    protected AssessmentAttempt() {
    }

    public AssessmentAttempt(Assessment assessment, User user, Instant startedAt) {
        this.assessment = assessment;
        this.user = user;
        this.startedAt = startedAt;
        this.status = "OPEN";
    }

    public void finish(int score, Instant when) {
        this.score = score;
        this.submittedAt = when;
        this.status = "SUBMITTED";
    }

    public Assessment getAssessment() {
        return assessment;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public Integer getScore() {
        return score;
    }

    public String getStatus() {
        return status;
    }
}
