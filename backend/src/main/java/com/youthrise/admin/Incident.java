package com.youthrise.admin;

import com.youthrise.common.BaseEntity;
import com.youthrise.user.User;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "incidents")
public class Incident extends BaseEntity {

    @Column(name = "reference", nullable = false, length = 40, unique = true)
    private String reference;

    @Column(name = "category", nullable = false, length = 80)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 16)
    private IncidentSeverity severity;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private IncidentStatus status;

    @Column(name = "reported_at", nullable = false)
    private Instant reportedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reported_by", nullable = false)
    private User reportedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    @Column(name = "summary", nullable = false, length = 2000)
    private String summary;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "incident_notes", joinColumns = @JoinColumn(name = "incident_id"))
    @OrderColumn(name = "position")
    private List<Note> notes = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "incident_actions", joinColumns = @JoinColumn(name = "incident_id"))
    @OrderColumn(name = "position")
    private List<Action> actions = new ArrayList<>();

    protected Incident() {
    }

    @Embeddable
    public static class Note {

        @Column(name = "author_name", nullable = false, length = 160)
        private String authorName;

        @Column(name = "body", nullable = false, length = 2000)
        private String body;

        @Column(name = "noted_at", nullable = false)
        private Instant notedAt;

        protected Note() {
        }

        Note(String authorName, String body, Instant notedAt) {
            this.authorName = authorName;
            this.body = body;
            this.notedAt = notedAt;
        }

        public String getAuthorName() {
            return authorName;
        }

        public String getBody() {
            return body;
        }

        public Instant getNotedAt() {
            return notedAt;
        }
    }

    @Embeddable
    public static class Action {

        @Column(name = "action", nullable = false, length = 500)
        private String action;

        @Column(name = "actor_name", nullable = false, length = 160)
        private String actorName;

        @Column(name = "acted_at", nullable = false)
        private Instant actedAt;

        protected Action() {
        }

        Action(String action, String actorName, Instant actedAt) {
            this.action = action;
            this.actorName = actorName;
            this.actedAt = actedAt;
        }

        public String getAction() {
            return action;
        }

        public String getActorName() {
            return actorName;
        }

        public Instant getActedAt() {
            return actedAt;
        }
    }

    public void apply(IncidentStatus newStatus, IncidentSeverity newSeverity, User newAssignee,
                      String note, String actorName) {
        List<String> changes = new ArrayList<>();
        if (newStatus != null && newStatus != status) {
            changes.add("status " + status.name().toLowerCase() + " -> " + newStatus.name().toLowerCase());
            this.status = newStatus;
        }
        if (newSeverity != null && newSeverity != severity) {
            changes.add("severity " + severity.name().toLowerCase() + " -> " + newSeverity.name().toLowerCase());
            this.severity = newSeverity;
        }
        if (newAssignee != null) {
            changes.add("assignee set to " + newAssignee.getFullName());
            this.assignedTo = newAssignee;
        }
        Instant now = Instant.now();
        if (note != null && !note.isBlank()) {
            notes.add(new Note(actorName, note.trim(), now));
        }
        if (!changes.isEmpty()) {
            actions.add(new Action(String.join("; ", changes), actorName, now));
        }
    }

    public String getReference() {
        return reference;
    }

    public String getCategory() {
        return category;
    }

    public IncidentSeverity getSeverity() {
        return severity;
    }

    public IncidentStatus getStatus() {
        return status;
    }

    public Instant getReportedAt() {
        return reportedAt;
    }

    public User getReportedBy() {
        return reportedBy;
    }

    public User getAssignedTo() {
        return assignedTo;
    }

    public String getSummary() {
        return summary;
    }

    public List<Note> getNotes() {
        return notes;
    }

    public List<Action> getActions() {
        return actions;
    }
}
