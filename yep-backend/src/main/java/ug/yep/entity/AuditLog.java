package ug.yep.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** Append-only record of privileged actions. */
@Entity
@Table(name = "audit_log")
public class AuditLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    private User actor;

    @Column(name = "action", nullable = false, length = 80)
    private String action;

    @Column(name = "target_type", length = 40)
    private String targetType;

    @Column(name = "target_id", length = 64)
    private String targetId;

    @Column(name = "details", length = 1000)
    private String details;

    protected AuditLog() {
    }

    public AuditLog(User actor, String action, String targetType, String targetId, String details) {
        this.actor = actor;
        this.action = action;
        this.targetType = targetType;
        this.targetId = targetId;
        this.details = details;
    }

    public User getActor() {
        return actor;
    }

    public String getAction() {
        return action;
    }

    public String getTargetType() {
        return targetType;
    }

    public String getTargetId() {
        return targetId;
    }

    public String getDetails() {
        return details;
    }
}
