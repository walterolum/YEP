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
import ug.yep.entity.Enums;
import ug.yep.security.CurrentUser;
import ug.yep.service.AdminService;
import ug.yep.service.AuthService;

/** Facilitator workspace: the participant register plus session delivery and attendance. */
@RestController
@RequestMapping("/api/facilitator")
public class FacilitatorController {

    private final AuthService auth;
    private final AdminService admin;

    public FacilitatorController(AuthService auth, AdminService admin) {
        this.auth = auth;
        this.admin = admin;
    }

    @GetMapping("/participants")
    public List<Views.UserView> participants() {
        return auth.byRole(Enums.Role.PARTICIPANT);
    }

    @GetMapping("/sessions")
    public List<Views.SessionView> sessions(@AuthenticationPrincipal CurrentUser actor) {
        return admin.sessions(actor.id());
    }

    @PostMapping("/sessions")
    public Views.SessionView createSession(@AuthenticationPrincipal CurrentUser actor,
                                           @Valid @RequestBody Requests.CreateSessionRequest request) {
        return admin.createSession(actor, request);
    }

    @GetMapping("/sessions/{sessionId}/roster")
    public List<Map<String, Object>> roster(@PathVariable Long sessionId) {
        return admin.sessionRoster(sessionId);
    }

    @PutMapping("/sessions/{sessionId}/attendance")
    public Map<String, Object> attendance(@PathVariable Long sessionId,
                                          @Valid @RequestBody Requests.AttendanceRequest request) {
        return admin.markAttendance(sessionId, request);
    }
}
