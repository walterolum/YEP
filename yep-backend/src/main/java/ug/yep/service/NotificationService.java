package ug.yep.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ug.yep.entity.Notification;
import ug.yep.entity.User;
import ug.yep.exception.ForbiddenException;
import ug.yep.exception.NotFoundException;
import ug.yep.repository.NotificationRepository;

/** Creates and reads the in-app notification feed. */
@Service
public class NotificationService {

    private final NotificationRepository notifications;

    public NotificationService(NotificationRepository notifications) {
        this.notifications = notifications;
    }

    @Transactional
    public void send(User user, String category, String message) {
        if (user != null) {
            notifications.save(new Notification(user, category, message));
        }
    }

    @Transactional(readOnly = true)
    public List<Notification> forUser(Long userId) {
        return notifications.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public long unreadCount(Long userId) {
        return notifications.countByUserIdAndReadAtIsNull(userId);
    }

    @Transactional
    public void markRead(Long notificationId, Long userId) {
        Notification notification = notifications.findById(notificationId)
                .orElseThrow(() -> new NotFoundException("Notification"));
        if (!notification.getUser().getId().equals(userId)) {
            throw new ForbiddenException("That notification belongs to another account.");
        }
        notification.markRead();
    }

    @Transactional
    public void markAllRead(Long userId) {
        notifications.findByUserIdAndReadAtIsNullOrderByCreatedAtDesc(userId)
                .forEach(Notification::markRead);
    }
}
