package com.youthrise.discussion;

import com.youthrise.common.BaseEntity;
import com.youthrise.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** A single reply inside a {@link Discussion} thread. */
@Entity
@Table(name = "discussion_messages")
public class DiscussionMessage extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "discussion_id", nullable = false)
    private Discussion discussion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(name = "body", nullable = false, columnDefinition = "text")
    private String body;

    protected DiscussionMessage() {
    }

    static DiscussionMessage create(Discussion discussion, User author, String body) {
        DiscussionMessage message = new DiscussionMessage();
        message.discussion = discussion;
        message.author = author;
        message.body = body.trim();
        return message;
    }

    public Discussion getDiscussion() {
        return discussion;
    }

    public User getAuthor() {
        return author;
    }

    public String getBody() {
        return body;
    }
}
