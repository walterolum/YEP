package ug.yep.controller;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ug.yep.dto.Requests;
import ug.yep.dto.Views;
import ug.yep.security.CurrentUser;
import ug.yep.service.MessagingService;
import ug.yep.service.NotificationService;

/** Threads, replies and the notification feed. */
@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessagingService messaging;
    private final NotificationService notifications;
    private final ug.yep.repository.UserRepository users;

    public MessageController(MessagingService messaging, NotificationService notifications,
                             ug.yep.repository.UserRepository users) {
        this.messaging = messaging;
        this.notifications = notifications;
        this.users = users;
    }

    /** Approved people the signed-in user can start a direct conversation with. */
    @GetMapping("/directory")
    public List<Map<String, Object>> directory(@AuthenticationPrincipal CurrentUser actor) {
        return users.findAllByOrderByFullNameAsc().stream()
                .filter(user -> user.getStatus() == ug.yep.entity.Enums.UserStatus.APPROVED)
                .filter(user -> !user.getId().equals(actor.id()))
                .map(user -> Map.<String, Object>of("id", user.getId(),
                        "fullName", user.getFullName(), "role", user.getRole().name()))
                .toList();
    }

    @GetMapping
    public List<Views.ThreadView> threads(@AuthenticationPrincipal CurrentUser actor) {
        return messaging.threads(actor.id());
    }

    @GetMapping("/{threadId}")
    public Views.ThreadView thread(@AuthenticationPrincipal CurrentUser actor,
                                   @PathVariable Long threadId) {
        return messaging.thread(threadId, actor.id());
    }

    @PostMapping
    public Views.ThreadView create(@AuthenticationPrincipal CurrentUser actor,
                                   @Valid @RequestBody Requests.NewThreadRequest request) {
        return messaging.create(actor, request);
    }

    @PostMapping("/{threadId}/posts")
    public Views.ThreadView reply(@AuthenticationPrincipal CurrentUser actor,
                                  @PathVariable Long threadId,
                                  @Valid @RequestBody Requests.PostMessageRequest request) {
        return messaging.post(threadId, actor.id(), request.body());
    }

    @GetMapping("/notifications")
    public Map<String, Object> notifications(@AuthenticationPrincipal CurrentUser actor) {
        List<Views.NotificationView> items = notifications.forUser(actor.id()).stream()
                .map(Views.NotificationView::of).toList();
        return Map.of("unread", notifications.unreadCount(actor.id()), "items", items);
    }

    @PostMapping("/notifications/read")
    public Map<String, Object> readAll(@AuthenticationPrincipal CurrentUser actor) {
        notifications.markAllRead(actor.id());
        return Map.of("unread", 0);
    }

    @PostMapping("/notifications/{notificationId}/read")
    public Map<String, Object> read(@AuthenticationPrincipal CurrentUser actor,
                                    @PathVariable Long notificationId) {
        notifications.markRead(notificationId, actor.id());
        return Map.of("unread", notifications.unreadCount(actor.id()));
    }
}
