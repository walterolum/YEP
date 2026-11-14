package ug.yep.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** A posting a learner keeps for later. */
@Entity
@Table(name = "saved_jobs")
public class SavedJob extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "posting_id", nullable = false)
    private JobPosting posting;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    protected SavedJob() {
    }

    public SavedJob(JobPosting posting, User user) {
        this.posting = posting;
        this.user = user;
    }

    public JobPosting getPosting() {
        return posting;
    }
}
