package com.youthrise.admin;

import com.youthrise.user.UserDtos;
import com.youthrise.user.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService admins;

    public AdminController(AdminService admins) {
        this.admins = admins;
    }

    /** Searchable user directory for the administration console. */
    @GetMapping("/users")
    public List<UserDtos.UserResponse> users(@RequestParam(required = false) String q) {
        return admins.listUsers(q);
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<Void> changeStatus(@PathVariable String id,
                                             @Valid @RequestBody AdminDtos.UserStatusRequest body,
                                             @AuthenticationPrincipal UserPrincipal principal,
                                             HttpServletRequest request) {
        admins.changeUserStatus(id, body.status(), principal, request.getRemoteAddr());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users/{id}/roles")
    public ResponseEntity<Void> assignRole(@PathVariable String id,
                                           @Valid @RequestBody AdminDtos.RoleRequest body,
                                           @AuthenticationPrincipal UserPrincipal principal,
                                           HttpServletRequest request) {
        admins.assignRole(id, body.role(), principal, request.getRemoteAddr());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users/invitations")
    public ResponseEntity<UserDtos.UserResponse> invite(
            @Valid @RequestBody AdminDtos.InviteRequest body,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(admins.invite(body, principal, request.getRemoteAddr()));
    }

    /** Incident queue for the governance console (documented contract extension). */
    @GetMapping("/incidents")
    public List<AdminDtos.IncidentResponse> incidents() {
        return admins.listIncidents();
    }

    @PatchMapping("/incidents/{id}")
    public ResponseEntity<Void> updateIncident(@PathVariable String id,
                                               @Valid @RequestBody AdminDtos.IncidentPatch body,
                                               @AuthenticationPrincipal UserPrincipal principal,
                                               HttpServletRequest request) {
        admins.updateIncident(id, body, principal, request.getRemoteAddr());
        return ResponseEntity.noContent().build();
    }

    /** Privacy request queue for the governance console (documented contract extension). */
    @GetMapping("/privacy-requests")
    public List<AdminDtos.PrivacyRequestResponse> privacyRequests() {
        return admins.listPrivacyRequests();
    }

    @PatchMapping("/privacy-requests/{id}")
    public ResponseEntity<Void> updatePrivacyRequest(@PathVariable String id,
                                                     @Valid @RequestBody AdminDtos.PrivacyPatch body,
                                                     @AuthenticationPrincipal UserPrincipal principal,
                                                     HttpServletRequest request) {
        admins.updatePrivacyRequest(id, body, principal, request.getRemoteAddr());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/modules/{id}/status")
    public ResponseEntity<Void> setModuleStatus(@PathVariable String id,
                                                @Valid @RequestBody AdminDtos.ModuleStatusRequest body,
                                                @AuthenticationPrincipal UserPrincipal principal) {
        admins.setModuleStatus(id, body.status(), principal);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/audit-log")
    public List<AdminDtos.AuditEntryResponse> auditLog() {
        return admins.auditLog();
    }

    @GetMapping("/summary")
    public AdminDtos.AdminSummaryResponse summary() {
        return admins.summary();
    }
}
