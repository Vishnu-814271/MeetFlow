package com.meetflow.repository;

import com.meetflow.model.CarpoolMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CarpoolMemberRepository extends JpaRepository<CarpoolMember, String> {
    List<CarpoolMember> findByCarpoolGroupId(String carpoolGroupId);
    List<CarpoolMember> findByCarpoolGroupIdAndStatus(String carpoolGroupId, String status);
    Optional<CarpoolMember> findByCarpoolGroupIdAndParticipantId(String carpoolGroupId, String participantId);
    List<CarpoolMember> findByParticipantIdAndStatus(String participantId, String status);
}
