package com.youthrise.notification;

import com.youthrise.user.UserPrincipal;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class NotificationController {

    private final NotificationService notifications;

    public NotificationController(NotificationService notifications) {
        this.notifications = notifications;
    }

    @GetMapping("/me/notifications")
    public List<NotificationDtos.NotificationResponse> list(@AuthenticationPrincipal UserPrincipal principal) {
        return notifications.listForUser(principal.id());
    }

    @PostMapping("/notifications/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable String id, @AuthenticationPrincipal UserPrincipal principal) {
        notifications.markRead(id, principal.id());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/me/notifications/read-all")
    public ResponseEntity<Void> markAllRead(@AuthenticationPrincipal UserPrincipal principal) {
        notifications.markAllRead(principal.id());
        return ResponseEntity.noContent().build();
    }
}
