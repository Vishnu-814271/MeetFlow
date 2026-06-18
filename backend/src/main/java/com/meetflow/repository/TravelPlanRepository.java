package com.meetflow.repository;

import com.meetflow.model.TravelPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TravelPlanRepository extends JpaRepository<TravelPlan, String> {
    List<TravelPlan> findByEventId(String eventId);
    Optional<TravelPlan> findByParticipantId(String participantId);
}
