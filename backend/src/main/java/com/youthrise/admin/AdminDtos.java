package com.youthrise.admin;

import com.youthrise.common.AuditLog;
import com.youthrise.programme.ContentStatus;
import com.youthrise.user.AccountStatus;
import com.youthrise.user.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;
import java.util.Locale;

public final class AdminDtos {

    private AdminDtos() {
    }

    public record UserStatusRequest(@NotNull(message = "Choose an account status.") AccountStatus status) {
    }

    public record RoleRequest(@NotNull(message = "Choose a role.") Role role) {
    }

    public record IncidentPatch(
            IncidentStatus status,
            IncidentSeverity severity,
            String assignedTo,
            @Size(max = 2000, message = "Use 2000 characters or fewer.") String note) {
    }

    public record PrivacyPatch(
            @NotNull(message = "Choose a status.") PrivacyRequestStatus status,
            @Size(max = 2000, message = "Use 2000 characters or fewer.") String note) {
    }

    public record ModuleStatusRequest(
            @NotNull(message = "Choose a module status.") ContentStatus status) {
    }

    public record InviteRequest(
            @NotBlank(message = "Enter the person's full name.")
            @Size(max = 160) String name,
            @NotBlank(message = "Enter an email address.")
            @Email(message = "Enter a valid email address.")
            @Size(max = 320) String email,
            @NotNull(message = "Choose a role.") Role role,
            @Size(max = 160) String organization,
            @NotBlank(message = "Select a country.")
            @Size(max = 80) String country) {
    }

    public record IncidentNoteResponse(String author, String body, Instant at) {
    }

    public record IncidentActionResponse(String action, String actor, Instant at) {
    }

    public record IncidentResponse(
            String id,
            String reference,
            String category,
            IncidentSeverity severity,
            IncidentStatus status,
            Instant reportedAt,
            String reportedBy,
            String assignedTo,
            String summary,
            List<IncidentNoteResponse> notes,
            List<IncidentActionResponse> actions) {

        public static IncidentResponse from(Incident incident) {
            return new IncidentResponse(
                    incident.getId(),
                    incident.getReference(),
                    incident.getCategory(),
                    incident.getSeverity(),
                    incident.getStatus(),
                    incident.getReportedAt(),
                    incident.getReportedBy().getFullName(),
                    incident.getAssignedTo() == null ? null : incident.getAssignedTo().getFullName(),
                    incident.getSummary(),
                    incident.getNotes().stream()
                            .map(note -> new IncidentNoteResponse(note.getAuthorName(), note.getBody(), note.getNotedAt()))
                            .toList(),
                    incident.getActions().stream()
                            .map(action -> new IncidentActionResponse(action.getAction(), action.getActorName(),
                                    action.getActedAt()))
                            .toList());
        }
    }

    public record PrivacyRequestResponse(
            String id,
            String reference,
            String requester,
            PrivacyRequestType type,
            Instant receivedAt,
            PrivacyRequestStatus status,
            String assignee,
            String note) {

        public static PrivacyRequestResponse from(PrivacyRequest request) {
            return new PrivacyRequestResponse(request.getId(), request.getReference(),
                    request.getRequester().getFullName(), request.getType(), request.getReceivedAt(),
                    request.getStatus(),
                    request.getAssignee() == null ? null : request.getAssignee().getFullName(),
                    request.getNote());
        }
    }

    public record AuditEntryResponse(
            String id,
            Instant timestamp,
            String actor,
            String actorRole,
            String action,
            String target,
            String outcome,
            String metadata) {

        public static AuditEntryResponse from(AuditLog entry) {
            return new AuditEntryResponse(entry.getId(), entry.getCreatedAt(),
                    entry.getActorEmail() == null ? "system" : entry.getActorEmail(),
                    entry.getActorRole() == null ? null : entry.getActorRole().toLowerCase(Locale.ROOT),
                    entry.getAction(), entry.getTarget(), entry.getOutcome(), entry.getMetadata());
        }
    }

    public record AdminSummaryResponse(
            long users,
            long activeProgrammes,
            long activeCohorts,
            long pendingApprovals,
            long openIncidents,
            long certificatesIssued) {
    }
}
