package com.youthrise.notification;

import java.time.Instant;

public final class NotificationDtos {

    private NotificationDtos() {
    }

    public record NotificationResponse(
            String id,
            String userId,
            String title,
            String body,
            Instant createdAt,
            boolean read,
            String href,
            NotificationKind kind) {

        public static NotificationResponse from(Notification notification) {
            return new NotificationResponse(notification.getId(), notification.getUser().getId(),
                    notification.getTitle(), notification.getBody(), notification.getCreatedAt(),
                    notification.getReadAt() != null, notification.getHref(), notification.getKind());
        }
    }
}
