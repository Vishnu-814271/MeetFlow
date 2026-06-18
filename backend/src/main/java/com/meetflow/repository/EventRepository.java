package com.meetflow.repository;

import com.meetflow.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, String> {
    Optional<Event> findByEventSlug(String eventSlug);
    Optional<Event> findByEventCode(String eventCode);
}
