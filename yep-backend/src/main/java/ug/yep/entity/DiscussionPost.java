package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** A reply in a discussion thread. */
@Entity
@Table(name = "discussion_posts")
public class DiscussionPost extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "thread_id", nullable = false)
    private DiscussionThread thread;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "body", nullable = false, columnDefinition = "text")
    private String body;

    protected DiscussionPost() {
    }

    public DiscussionPost(DiscussionThread thread, User user, String body) {
        this.thread = thread;
        this.user = user;
        this.body = body.trim();
    }

    public DiscussionThread getThread() {
        return thread;
    }

    public User getUser() {
        return user;
    }

    public String getBody() {
        return body;
    }
}
