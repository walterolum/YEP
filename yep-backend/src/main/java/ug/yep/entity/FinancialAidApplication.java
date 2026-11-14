package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

/** A request for a sponsored seat on a paid course, decided by an admin committee. */
@Entity
@Table(name = "financial_aid_applications")
public class FinancialAidApplication extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "reason", nullable = false, length = 1000)
    private String reason;

    @Column(name = "income_band", length = 40)
    private String incomeBand;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "note", length = 1000)
    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decided_by")
    private User decidedBy;

    @Column(name = "decided_at")
    private Instant decidedAt;

    protected FinancialAidApplication() {
    }

    public FinancialAidApplication(User user, Course course, String reason, String incomeBand) {
        this.user = user;
        this.course = course;
        this.reason = reason;
        this.incomeBand = incomeBand;
        this.status = "PENDING";
    }

    public void decide(User reviewer, boolean approved, String note) {
        this.status = approved ? "APPROVED" : "REJECTED";
        this.decidedBy = reviewer;
        this.decidedAt = Instant.now();
        this.note = note;
    }

    public User getUser() {
        return user;
    }

    public Course getCourse() {
        return course;
    }

    public String getStatus() {
        return status;
    }

    public String getReason() {
        return reason;
    }

    public String getNote() {
        return note;
    }
}
