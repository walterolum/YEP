package com.youthrise.common;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_created", columnList = "created_at"),
        @Index(name = "idx_audit_actor", columnList = "actor_id")
})
public class AuditLog extends BaseEntity {

    @Column(name = "actor_id", length = 36)
    private String actorId;

    @Column(name = "actor_email", length = 320)
    private String actorEmail;

    @Column(name = "actor_role", length = 24)
    private String actorRole;

    @Column(name = "action", nullable = false, length = 80)
    private String action;

    @Column(name = "target", length = 160)
    private String target;

    @Column(name = "outcome", nullable = false, length = 16)
    private String outcome;

    @Column(name = "metadata", columnDefinition = "text")
    private String metadata;

    @Column(name = "ip_address", length = 64)
    private String ipAddress;

    protected AuditLog() {
    }

    static AuditLog create(String actorId, String actorEmail, String actorRole, String action,
                           String target, String outcome, String metadata, String ipAddress) {
        AuditLog entry = new AuditLog();
        entry.actorId = actorId;
        entry.actorEmail = actorEmail;
        entry.actorRole = actorRole;
        entry.action = action;
        entry.target = target;
        entry.outcome = outcome;
        entry.metadata = metadata;
        entry.ipAddress = ipAddress;
        return entry;
    }

    public String getActorId() {
        return actorId;
    }

    public String getActorEmail() {
        return actorEmail;
    }

    public String getActorRole() {
        return actorRole;
    }

    public String getAction() {
        return action;
    }

    public String getTarget() {
        return target;
    }

    public String getOutcome() {
        return outcome;
    }

    public String getMetadata() {
        return metadata;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public Instant getTimestamp() {
        return getCreatedAt();
    }
}
