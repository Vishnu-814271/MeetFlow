package com.meetflow.repository;

import com.meetflow.model.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, String> {
    Optional<NotificationLog> findByTravelPlanId(String travelPlanId);
    boolean existsByTravelPlanId(String travelPlanId);
}
