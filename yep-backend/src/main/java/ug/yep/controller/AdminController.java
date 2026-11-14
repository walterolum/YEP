package ug.yep.controller;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ug.yep.dto.Requests;
import ug.yep.dto.Views;
import ug.yep.entity.Enums;
import ug.yep.security.CurrentUser;
import ug.yep.service.AdminService;
import ug.yep.service.AuthService;
import ug.yep.service.DashboardService;
import ug.yep.service.MessagingService;
import ug.yep.service.PermissionService;
import ug.yep.service.ProgrammeService;
import ug.yep.service.ProjectService;

/** Administrator console. Every route requires the ADMIN role (see SecurityConfig). */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AuthService auth;
    private final ProgrammeService programmes;
    private final ProjectService projects;
    private final AdminService admin;
    private final PermissionService permissions;
    private final MessagingService messaging;
    private final DashboardService dashboard;

    public AdminController(AuthService auth, ProgrammeService programmes, ProjectService projects,
                           AdminService admin, PermissionService permissions,
                           MessagingService messaging, DashboardService dashboard) {
        this.auth = auth;
        this.programmes = programmes;
        this.projects = projects;
        this.admin = admin;
        this.permissions = permissions;
        this.messaging = messaging;
        this.dashboard = dashboard;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard() {
        return dashboard.admin();
    }

    @GetMapping("/users")
    public List<Views.UserView> users(@RequestParam(required = false) String role,
                                      @RequestParam(required = false) String status,
                                      @RequestParam(required = false) String q,
                                      @RequestParam(required = false) String country,
                                      @RequestParam(required = false) String education) {
        return auth.listUsers(role, status, q, country, education);
    }

    @GetMapping("/staff")
    public Map<String, Object> staff() {
        return Map.of(
                "mentors", auth.byRole(Enums.Role.MENTOR),
                "facilitators", auth.byRole(Enums.Role.FACILITATOR),
                "sponsors", auth.byRole(Enums.Role.SPONSOR));
    }

    @PostMapping("/users")
    public ResponseEntity<Views.UserView> createUser(@AuthenticationPrincipal CurrentUser actor,
                                                     @Valid @RequestBody Requests.CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(auth.createUser(actor, request));
    }

    @PutMapping("/users/{userId}/status")
    public Views.UserView decide(@AuthenticationPrincipal CurrentUser actor, @PathVariable Long userId,
                                 @Valid @RequestBody Requests.DecisionRequest request) {
        return auth.decideUser(actor, userId, request);
    }

    @GetMapping("/applications")
    public List<Views.ApplicationView> applications() {
        return programmes.allApplications();
    }

    @PutMapping("/applications/{applicationId}")
    public Views.ApplicationView decideApplication(@AuthenticationPrincipal CurrentUser actor,
                                                   @PathVariable Long applicationId,
                                                   @Valid @RequestBody Requests.DecisionRequest request) {
        boolean approve = "APPROVED".equalsIgnoreCase(request.status());
        return programmes.decide(actor, applicationId, approve);
    }

    @GetMapping("/programmes")
    public List<Views.ProgrammeView> programmes() {
        return programmes.all();
    }

    @PostMapping("/programmes")
    public Views.ProgrammeView createProgramme(@Valid @RequestBody Requests.ProgrammeRequest request) {
        return programmes.create(request);
    }

    @PutMapping("/programmes/{programmeId}")
    public Views.ProgrammeView updateProgramme(@PathVariable Long programmeId,
                                               @Valid @RequestBody Requests.ProgrammeRequest request) {
        return programmes.update(programmeId, request);
    }

    @GetMapping("/teams")
    public List<Views.TeamView> teams() {
        return projects.allTeams();
    }

    @PostMapping("/teams")
    public Views.TeamView createTeam(@Valid @RequestBody Requests.CreateTeamRequest request) {
        return projects.createTeam(request);
    }

    @GetMapping("/sessions")
    public List<Views.SessionView> sessions() {
        return admin.sessions(null);
    }

    @GetMapping("/settings")
    public Map<String, String> settings() {
        return admin.settings();
    }

    @PutMapping("/settings")
    public Map<String, String> updateSettings(@AuthenticationPrincipal CurrentUser actor,
                                              @Valid @RequestBody Requests.SettingsRequest request) {
        return admin.updateSettings(actor, request);
    }

    @GetMapping("/permissions")
    public List<Map<String, Object>> permissions() {
        return permissions.matrix();
    }

    @PutMapping("/permissions")
    public List<Map<String, Object>> updatePermission(@Valid @RequestBody Requests.PermissionRequest request) {
        permissions.update(request.role(), request.permission(), request.allowed());
        return permissions.matrix();
    }

    @GetMapping("/audit")
    public List<Views.AuditView> audit() {
        return admin.auditTrail();
    }

    @PostMapping("/announcements")
    public Views.ThreadView announce(@AuthenticationPrincipal CurrentUser actor,
                                     @Valid @RequestBody Requests.AnnouncementRequest request) {
        return messaging.create(actor, new Requests.NewThreadRequest("ANNOUNCEMENT", request.title(),
                request.body(), null, request.audience(), null));
    }

    @GetMapping("/pledges")
    public List<Map<String, Object>> pledges() {
        return admin.pledges();
    }

    @GetMapping("/partners")
    public List<Map<String, Object>> partners() {
        return admin.partners();
    }
}
