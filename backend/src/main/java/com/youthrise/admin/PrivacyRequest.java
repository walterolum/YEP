package com.youthrise.admin;

import com.youthrise.common.BaseEntity;
import com.youthrise.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "privacy_requests")
public class PrivacyRequest extends BaseEntity {

    @Column(name = "reference", nullable = false, length = 40, unique = true)
    private String reference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private PrivacyRequestType type;

    @Column(name = "received_at", nullable = false)
    private Instant receivedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private PrivacyRequestStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private User assignee;

    @Column(name = "note", length = 2000)
    private String note;

    protected PrivacyRequest() {
    }

    public void update(PrivacyRequestStatus newStatus, String newNote, User newAssignee) {
        if (newStatus != null) {
            this.status = newStatus;
        }
        if (newAssignee != null) {
            this.assignee = newAssignee;
        }
        if (newNote != null && !newNote.isBlank()) {
            this.note = newNote.trim();
        }
    }

    public String getReference() {
        return reference;
    }

    public User getRequester() {
        return requester;
    }

    public PrivacyRequestType getType() {
        return type;
    }

    public Instant getReceivedAt() {
        return receivedAt;
    }

    public PrivacyRequestStatus getStatus() {
        return status;
    }

    public User getAssignee() {
        return assignee;
    }

    public String getNote() {
        return note;
    }
}
