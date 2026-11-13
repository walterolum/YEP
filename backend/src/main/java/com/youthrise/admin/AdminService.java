package com.youthrise.admin;

import com.youthrise.assessment.CertificateRepository;
import com.youthrise.assessment.CertificateStatus;
import com.youthrise.common.ApiException;
import com.youthrise.common.AuditLogRepository;
import com.youthrise.common.AuditService;
import com.youthrise.common.exception.DuplicateEmailException;
import com.youthrise.partner.NominationRepository;
import com.youthrise.partner.NominationStatus;
import com.youthrise.programme.EnrolmentRepository;
import com.youthrise.programme.ProgrammeRepository;
import com.youthrise.programme.ProgrammeStatus;
import com.youthrise.programme.ProgrammeService;
import com.youthrise.user.AccountStatus;
import com.youthrise.user.Role;
import com.youthrise.user.User;
import com.youthrise.user.UserDtos;
import com.youthrise.user.UserPrincipal;
import com.youthrise.user.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.session.FindByIndexNameSessionRepository;
import org.springframework.session.Session;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {

    private final UserRepository users;
    private final IncidentRepository incidents;
    private final PrivacyRequestRepository privacyRequests;
    private final NominationRepository nominations;
    private final CertificateRepository certificates;
    private final ProgrammeRepository programmes;
    private final EnrolmentRepository enrolments;
    private final AuditLogRepository auditLogs;
    private final AuditService audit;
    private final ProgrammeService programmeService;
    private final FindByIndexNameSessionRepository<? extends Session> sessions;

    public AdminService(UserRepository users, IncidentRepository incidents,
                        PrivacyRequestRepository privacyRequests, NominationRepository nominations,
                        CertificateRepository certificates, ProgrammeRepository programmes,
                        EnrolmentRepository enrolments, AuditLogRepository auditLogs, AuditService audit,
                        ProgrammeService programmeService,
                        FindByIndexNameSessionRepository<? extends Session> sessions) {
        this.users = users;
        this.incidents = incidents;
        this.privacyRequests = privacyRequests;
        this.nominations = nominations;
        this.certificates = certificates;
        this.programmes = programmes;
        this.enrolments = enrolments;
        this.auditLogs = auditLogs;
        this.audit = audit;
        this.programmeService = programmeService;
        this.sessions = sessions;
    }

    @Transactional
    public void changeUserStatus(String userId, AccountStatus status, UserPrincipal principal, String ipAddress) {
        if (userId.equals(principal.id())) {
            throw ApiException.forbidden("SELF_STATUS_CHANGE",
                    "You cannot change your own account status.");
        }
        User user = requiredUser(userId);
        user.changeStatus(status);
        if (status == AccountStatus.SUSPENDED) {
            invalidateSessions(user.getEmail());
        }
        audit.success(principal.id(), principal.email(), principal.role().name(),
                "USER_STATUS_CHANGED", "user:" + userId + ":" + status.name(), ipAddress);
    }

    @Transactional
    public void assignRole(String userId, Role role, UserPrincipal principal, String ipAddress) {
        if (userId.equals(principal.id()) && role != Role.ADMIN) {
            throw ApiException.forbidden("SELF_ROLE_CHANGE",
                    "You cannot remove your own administrator role.");
        }
        User user = requiredUser(userId);
        if (user.getRole() == role) {
            return;
        }
        // Role is the inheritance discriminator: one account row maps to one
        // subclass, so the move is a controlled statement rather than a field set.
        users.updateRole(userId, role.name(), Instant.now());
        // A role change must take effect immediately, not at the next login.
        invalidateSessions(user.getEmail());
        audit.success(principal.id(), principal.email(), principal.role().name(),
                "USER_ROLE_CHANGED", "user:" + userId + ":" + role.name(), ipAddress);
    }

    @Transactional
    public UserDtos.UserResponse invite(AdminDtos.InviteRequest request, UserPrincipal principal, String ipAddress) {
        String email = User.normalizeEmail(request.email());
        if (users.existsByEmailIgnoreCase(email)) {
            throw new DuplicateEmailException();
        }
        User invited = User.invited(request.name(), email, request.role(), request.country(), "Africa/Kampala");
        invited.updateProfile(null, null, null, request.organization(), null, null, null,
                null, null, null, null);
        try {
            users.saveAndFlush(invited);
        } catch (DataIntegrityViolationException ex) {
            throw new DuplicateEmailException();
        }
        audit.success(principal.id(), principal.email(), principal.role().name(),
                "USER_INVITED", "user:" + invited.getId(), ipAddress);
        return UserDtos.UserResponse.from(invited);
    }

    /**
     * User directory for the administration console. Search is optional and
     * bounded to 200 rows so a single request cannot dump the whole platform.
     */
    @Transactional(readOnly = true)
    public List<UserDtos.UserResponse> listUsers(String query) {
        String term = query == null || query.isBlank() ? null : query.trim();
        return users.searchDirectory(term).stream()
                .limit(200)
                .map(UserDtos.UserResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AdminDtos.IncidentResponse> listIncidents() {
        return incidents.findAllByOrderByReportedAtDesc().stream()
                .map(AdminDtos.IncidentResponse::from)
                .toList();
    }

    @Transactional
    public void updateIncident(String id, AdminDtos.IncidentPatch patch, UserPrincipal principal, String ipAddress) {
        Incident incident = incidents.findById(id)
                .orElseThrow(() -> ApiException.notFound("INCIDENT_NOT_FOUND",
                        "That incident could not be found."));
        User assignee = null;
        if (patch.assignedTo() != null && !patch.assignedTo().isBlank()) {
            assignee = requiredUser(patch.assignedTo());
        }
        incident.apply(patch.status(), patch.severity(), assignee, patch.note(), principal.email());
        audit.success(principal.id(), principal.email(), principal.role().name(),
                "INCIDENT_UPDATED", "incident:" + id, ipAddress);
    }

    @Transactional(readOnly = true)
    public List<AdminDtos.PrivacyRequestResponse> listPrivacyRequests() {
        return privacyRequests.findAllByOrderByReceivedAtDesc().stream()
                .map(AdminDtos.PrivacyRequestResponse::from)
                .toList();
    }

    @Transactional
    public void updatePrivacyRequest(String id, AdminDtos.PrivacyPatch patch, UserPrincipal principal,
                                    String ipAddress) {
        PrivacyRequest request = privacyRequests.findById(id)
                .orElseThrow(() -> ApiException.notFound("PRIVACY_REQUEST_NOT_FOUND",
                        "That privacy request could not be found."));
        request.update(patch.status(), patch.note(), null);
        audit.success(principal.id(), principal.email(), principal.role().name(),
                "PRIVACY_REQUEST_UPDATED", "privacy-request:" + id, ipAddress);
    }

    @Transactional
    public void setModuleStatus(String moduleId, com.youthrise.programme.ContentStatus status,
                                UserPrincipal principal) {
        programmeService.updateModuleStatus(moduleId, status, principal);
    }

    @Transactional(readOnly = true)
    public List<AdminDtos.AuditEntryResponse> auditLog() {
        return auditLogs.findTop500ByOrderByCreatedAtDesc().stream()
                .map(AdminDtos.AuditEntryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminDtos.AdminSummaryResponse summary() {
        long activeProgrammes = programmes.countByStatusNot(ProgrammeStatus.CLOSED);
        long pending = nominations.countByStatus(NominationStatus.NOMINATED)
                + privacyRequests.countByStatusNot(PrivacyRequestStatus.COMPLETED);
        return new AdminDtos.AdminSummaryResponse(
                users.count(),
                activeProgrammes,
                enrolments.countActiveCohorts(),
                pending,
                incidents.countByStatusNot(IncidentStatus.RESOLVED),
                certificates.countByStatus(CertificateStatus.VALID));
    }

    private User requiredUser(String id) {
        return users.findById(id)
                .orElseThrow(() -> ApiException.notFound("USER_NOT_FOUND", "That account could not be found."));
    }

    private void invalidateSessions(String email) {
        Map<String, ? extends Session> active = sessions.findByPrincipalName(email);
        active.keySet().forEach(sessions::deleteById);
    }
}
