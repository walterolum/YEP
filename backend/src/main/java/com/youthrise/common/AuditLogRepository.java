package com.youthrise.common;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, String> {

    java.util.List<AuditLog> findTop500ByOrderByCreatedAtDesc();
}
