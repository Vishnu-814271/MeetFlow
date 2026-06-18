package com.meetflow.repository;

import com.meetflow.model.Participant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ParticipantRepository extends JpaRepository<Participant, String> {
    List<Participant> findByEventId(String eventId);
    Optional<Participant> findByEventIdAndMobileNumber(String eventId, String mobileNumber);
}
