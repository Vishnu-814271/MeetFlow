package com.meetflow.repository;

import com.meetflow.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, String> {
    List<AuditLog> findByEventIdOrderByCreatedAtDesc(String eventId);
}
