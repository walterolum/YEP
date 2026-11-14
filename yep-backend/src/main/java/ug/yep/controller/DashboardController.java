package ug.yep.controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ug.yep.dto.Views;
import ug.yep.entity.Enums;
import ug.yep.security.CurrentUser;
import ug.yep.service.DashboardService;
import ug.yep.service.LearningService;
import ug.yep.service.NotificationService;
import ug.yep.service.RoleWorkspaceService;

/** One role-aware dashboard payload so the client makes a single call on sign-in. */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboard;
    private final LearningService learning;
    private final NotificationService notifications;
    private final RoleWorkspaceService workspace;

    public DashboardController(DashboardService dashboard, LearningService learning,
                               NotificationService notifications, RoleWorkspaceService workspace) {
        this.dashboard = dashboard;
        this.learning = learning;
        this.notifications = notifications;
        this.workspace = workspace;
    }

    @GetMapping
    public Map<String, Object> dashboard(@AuthenticationPrincipal CurrentUser actor) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("role", actor.role().name());
        payload.put("user", Map.of("id", actor.id(), "fullName", actor.fullName(), "email", actor.email()));
        payload.put("sessions", dashboard.upcomingSessions(actor.id()));
        payload.put("unreadNotifications", notifications.unreadCount(actor.id()));
        if (actor.role() == Enums.Role.PARTICIPANT) {
            Views.ProgressView progress = learning.progress(actor.id());
            payload.put("progress", progress);
            payload.put("stats", dashboard.participant(actor.id(), progress));
        } else if (actor.role() == Enums.Role.INSTRUCTOR
                || actor.role() == Enums.Role.REVIEWER
                || actor.role() == Enums.Role.EMPLOYER) {
            // Each workspace sees its own numbers, never the administrator's console totals.
            payload.put("stats", workspace.stats());
        } else {
            payload.put("stats", dashboard.admin());
        }
        List<Views.ModuleView> modules = actor.role() == Enums.Role.PARTICIPANT
                ? learning.modules(actor.id()) : List.of();
        payload.put("modules", modules);
        return payload;
    }
}
