package ug.yep.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ug.yep.entity.AuditLog;
import ug.yep.entity.User;
import ug.yep.repository.AuditLogRepository;

/** Writes the append-only audit trail. */
@Service
public class AuditService {

    private final AuditLogRepository logs;

    public AuditService(AuditLogRepository logs) {
        this.logs = logs;
    }

    @Transactional
    public void record(User actor, String action, String targetType, Object targetId, String details) {
        logs.save(new AuditLog(actor, action, targetType,
                targetId == null ? null : String.valueOf(targetId), details));
    }

    @Transactional(readOnly = true)
    public java.util.List<AuditLog> recent() {
        return logs.findTop200ByOrderByCreatedAtDesc();
    }
}
