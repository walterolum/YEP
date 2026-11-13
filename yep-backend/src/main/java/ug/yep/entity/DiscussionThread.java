package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** A Level One discussion thread. */
@Entity
@Table(name = "discussion_threads")
public class DiscussionThread extends BaseEntity {

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    protected DiscussionThread() {
    }

    public DiscussionThread(String title, User createdBy) {
        this.title = title;
        this.createdBy = createdBy;
    }

    public String getTitle() {
        return title;
    }

    public User getCreatedBy() {
        return createdBy;
    }
}
