package ug.yep.controller;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ug.yep.dto.Requests;
import ug.yep.dto.Views;
import ug.yep.security.CurrentUser;
import ug.yep.service.AdminService;

/** Programme sessions, registration and attendance. */
@RestController
@RequestMapping("/api")
public class SessionController {

    private final AdminService admin;

    public SessionController(AdminService admin) {
        this.admin = admin;
    }

    @GetMapping("/sessions")
    public List<Views.SessionView> sessions(@AuthenticationPrincipal CurrentUser actor) {
        return admin.sessions(actor.id());
    }

    @GetMapping("/sessions/{sessionId}")
    public Views.SessionView session(@AuthenticationPrincipal CurrentUser actor,
                                     @PathVariable Long sessionId) {
        return admin.sessionDetail(sessionId, actor.id());
    }

    @PostMapping("/sessions/{sessionId}/register")
    public Map<String, Object> register(@AuthenticationPrincipal CurrentUser actor,
                                        @PathVariable Long sessionId) {
        return admin.registerForSession(sessionId, actor.id());
    }

    @PostMapping("/admin/sessions")
    public Views.SessionView create(@AuthenticationPrincipal CurrentUser actor,
                                    @Valid @RequestBody Requests.CreateSessionRequest request) {
        return admin.createSession(actor, request);
    }

    @PutMapping("/admin/sessions/{sessionId}/attendance")
    public Map<String, Object> attendance(@PathVariable Long sessionId,
                                          @Valid @RequestBody Requests.AttendanceRequest request) {
        return admin.markAttendance(sessionId, request);
    }

    @GetMapping("/admin/sessions/{sessionId}/roster")
    public List<Map<String, Object>> roster(@PathVariable Long sessionId) {
        return admin.sessionRoster(sessionId);
    }
}
