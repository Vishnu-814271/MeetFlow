package com.meetflow.repository;

import com.meetflow.model.CarpoolGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CarpoolGroupRepository extends JpaRepository<CarpoolGroup, String> {
    List<CarpoolGroup> findByEventId(String eventId);
}
