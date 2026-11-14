package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

/** A learner's application to a posting, with the employer's decision. */
@Entity
@Table(name = "job_applications")
public class JobApplication extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "posting_id", nullable = false)
    private JobPosting posting;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "cover_note", nullable = false, length = 2000)
    private String coverNote;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "decided_at")
    private Instant decidedAt;

    protected JobApplication() {
    }

    public JobApplication(JobPosting posting, User user, String coverNote) {
        this.posting = posting;
        this.user = user;
        this.coverNote = coverNote;
        this.status = "SUBMITTED";
    }

    public void decide(String status) {
        this.status = status;
        this.decidedAt = Instant.now();
    }

    public JobPosting getPosting() {
        return posting;
    }

    public User getUser() {
        return user;
    }

    public String getCoverNote() {
        return coverNote;
    }

    public String getStatus() {
        return status;
    }
}
