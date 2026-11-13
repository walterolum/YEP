package com.youthrise.notification;

import com.youthrise.common.BaseEntity;
import com.youthrise.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "notifications")
public class Notification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Column(name = "body", nullable = false, length = 1000)
    private String body;

    @Column(name = "href", length = 300)
    private String href;

    @Enumerated(EnumType.STRING)
    @Column(name = "kind", nullable = false, length = 20)
    private NotificationKind kind;

    @Column(name = "read_at")
    private Instant readAt;

    protected Notification() {
    }

    public static Notification create(User user, String title, String body, String href, NotificationKind kind) {
        Notification notification = new Notification();
        notification.user = user;
        notification.title = title.trim();
        notification.body = body.trim();
        notification.href = href;
        notification.kind = kind;
        return notification;
    }

    public void markRead() {
        if (readAt == null) {
            readAt = Instant.now();
        }
    }

    public User getUser() {
        return user;
    }

    public String getTitle() {
        return title;
    }

    public String getBody() {
        return body;
    }

    public String getHref() {
        return href;
    }

    public NotificationKind getKind() {
        return kind;
    }

    public Instant getReadAt() {
        return readAt;
    }
}
