package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

/** One message inside a thread. */
@Entity
@Table(name = "messages")
public class Message extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "thread_id", nullable = false)
    private MessageThread thread;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(name = "body", nullable = false, columnDefinition = "text")
    private String body;

    @Column(name = "sent_at", nullable = false)
    private Instant sentAt;

    protected Message() {
    }

    Message(MessageThread thread, User sender, String body) {
        this.thread = thread;
        this.sender = sender;
        this.body = body.trim();
        this.sentAt = Instant.now();
    }

    public MessageThread getThread() {
        return thread;
    }

    public User getSender() {
        return sender;
    }

    public String getBody() {
        return body;
    }

    public Instant getSentAt() {
        return sentAt;
    }
}
