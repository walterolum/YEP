package com.youthrise.notification;

import com.youthrise.common.ApiException;
import com.youthrise.user.User;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

    private final NotificationRepository notifications;

    public NotificationService(NotificationRepository notifications) {
        this.notifications = notifications;
    }

    @Transactional
    public void notifyUser(User user, String title, String body, String href, NotificationKind kind) {
        if (href != null && (!href.startsWith("/") || href.startsWith("//"))) {
            throw new IllegalArgumentException("Notification links must be relative application paths");
        }
        notifications.save(Notification.create(user, title, body, href, kind));
    }

    @Transactional(readOnly = true)
    public List<NotificationDtos.NotificationResponse> listForUser(String userId) {
        return notifications.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(NotificationDtos.NotificationResponse::from)
                .toList();
    }

    @Transactional
    public void markRead(String id, String userId) {
        Notification notification = notifications.findByIdAndUserId(id, userId)
                .orElseThrow(() -> ApiException.notFound("NOTIFICATION_NOT_FOUND",
                        "That notification could not be found."));
        notification.markRead();
    }

    @Transactional
    public void markAllRead(String userId) {
        notifications.markAllRead(userId, Instant.now());
    }
}
