package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

/** An in-app notification for one account. */
@Entity
@Table(name = "notifications")
public class Notification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "category", nullable = false, length = 40)
    private String category;

    @Column(name = "message", nullable = false, length = 500)
    private String message;

    @Column(name = "read_at")
    private Instant readAt;

    protected Notification() {
    }

    public Notification(User user, String category, String message) {
        this.user = user;
        this.category = category;
        this.message = message;
    }

    public void markRead() {
        if (readAt == null) {
            readAt = Instant.now();
        }
    }

    public User getUser() {
        return user;
    }

    public String getCategory() {
        return category;
    }

    public String getMessage() {
        return message;
    }

    public Instant getReadAt() {
        return readAt;
    }

    public boolean isRead() {
        return readAt != null;
    }
}
