package com.meetflow.repository;

import com.meetflow.model.StatusUpdate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StatusUpdateRepository extends JpaRepository<StatusUpdate, String> {
    List<StatusUpdate> findByEventId(String eventId);
    List<StatusUpdate> findByParticipantIdOrderByCreatedAtDesc(String participantId);
    List<StatusUpdate> findByEventIdOrderByCreatedAtDesc(String eventId);
}
