package com.youthrise.common;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Audit writes use their own transaction so a failed business operation still
 * leaves an attributable record of the attempt.
 */
@Service
public class AuditService {

    private final AuditLogRepository repository;

    public AuditService(AuditLogRepository repository) {
        this.repository = repository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(String actorId, String actorEmail, String actorRole, String action,
                       String target, String outcome, String metadata, String ipAddress) {
        repository.save(AuditLog.create(actorId, actorEmail, actorRole, action, target, outcome, metadata, ipAddress));
    }

    public void success(String actorId, String actorEmail, String actorRole, String action,
                        String target, String ipAddress) {
        record(actorId, actorEmail, actorRole, action, target, "success", null, ipAddress);
    }

    public void failed(String actorId, String actorEmail, String actorRole, String action,
                       String target, String reason, String ipAddress) {
        record(actorId, actorEmail, actorRole, action, target, "failed", reason, ipAddress);
    }
}
