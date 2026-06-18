package com.meetflow.service;

import com.meetflow.dto.CarpoolGroupDetailsDto;
import com.meetflow.dto.CarpoolGroupDto;
import com.meetflow.dto.CarpoolMemberInfoDto;
import com.meetflow.exception.ResourceNotFoundException;
import com.meetflow.mapper.CarpoolGroupMapper;
import com.meetflow.model.CarpoolGroup;
import com.meetflow.model.CarpoolMember;
import com.meetflow.model.Participant;
import com.meetflow.model.TravelPlan;
import com.meetflow.repository.CarpoolGroupRepository;
import com.meetflow.repository.CarpoolMemberRepository;
import com.meetflow.repository.ParticipantRepository;
import com.meetflow.repository.TravelPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CarpoolService {
    private final CarpoolGroupRepository carpoolGroupRepository;
    private final CarpoolMemberRepository carpoolMemberRepository;
    private final ParticipantRepository participantRepository;
    private final TravelPlanRepository travelPlanRepository;
    private final CarpoolGroupMapper carpoolGroupMapper;

    @Transactional(readOnly = true)
    public List<CarpoolGroupDetailsDto> getCarpoolsByEventId(String eventId) {
        List<CarpoolGroup> groups = carpoolGroupRepository.findByEventId(eventId);
        return groups.stream().map(this::enrichGroupDetails).collect(Collectors.toList());
    }

    @Transactional
    public CarpoolGroupDetailsDto createCarpoolGroup(CarpoolGroupDto dto) {
        Participant driver = participantRepository.findById(dto.driverParticipantId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver participant not found: " + dto.driverParticipantId()));

        CarpoolGroup group = carpoolGroupMapper.toEntity(dto);
        if (group.getId() == null) {
            group.setId(UUID.randomUUID().toString());
        }
        group.setStatus("open");
        CarpoolGroup saved = carpoolGroupRepository.save(group);

        // Auto-join driver
        CarpoolMember driverMember = CarpoolMember.builder()
                .id(UUID.randomUUID().toString())
                .carpoolGroupId(saved.getId())
                .participantId(driver.getId())
                .role("driver")
                .joinedAt(LocalDateTime.now())
                .status("active")
                .build();
        carpoolMemberRepository.save(driverMember);

        return enrichGroupDetails(saved);
    }

    @Transactional
    public CarpoolGroupDetailsDto updateCarpoolGroup(String id, CarpoolGroupDto dto) {
        CarpoolGroup group = carpoolGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Carpool group not found: " + id));

        group.setTitle(dto.title());
        group.setOriginCity(dto.originCity());
        group.setOriginArea(dto.originArea());
        group.setVehicleType(dto.vehicleType());
        group.setDepartureDate(dto.departureDate());
        group.setDepartureTime(dto.departureTime());
        group.setSeatsAvailable(dto.seatsAvailable());
        group.setPickupNotes(dto.pickupNotes());
        group.setStatus(dto.status());

        CarpoolGroup saved = carpoolGroupRepository.save(group);
        return enrichGroupDetails(saved);
    }

    @Transactional
    public CarpoolGroupDetailsDto joinCarpool(String groupId, String participantId) {
        CarpoolGroup group = carpoolGroupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Carpool group not found: " + groupId));

        Participant passenger = participantRepository.findById(participantId)
                .orElseThrow(() -> new ResourceNotFoundException("Participant not found: " + participantId));

        if (!"open".equalsIgnoreCase(group.getStatus())) {
            throw new IllegalStateException("Carpool group is not open for joining. Current status: " + group.getStatus());
        }

        // Check if already in this group
        Optional<CarpoolMember> existing = carpoolMemberRepository.findByCarpoolGroupIdAndParticipantId(groupId, participantId);
        if (existing.isPresent()) {
            if ("active".equalsIgnoreCase(existing.get().getStatus())) {
                return enrichGroupDetails(group); // Already active
            } else {
                existing.get().setStatus("active");
                carpoolMemberRepository.save(existing.get());
            }
        } else {
            // New joiner
            CarpoolMember newMember = CarpoolMember.builder()
                    .id(UUID.randomUUID().toString())
                    .carpoolGroupId(group.getId())
                    .participantId(passenger.getId())
                    .role("passenger")
                    .joinedAt(LocalDateTime.now())
                    .status("active")
                    .build();
            carpoolMemberRepository.save(newMember);
        }

        // Check capacity
        CarpoolGroupDetailsDto details = enrichGroupDetails(group);
        if (details.seatsTaken() >= details.seatsAvailable()) {
            group.setStatus("full");
            carpoolGroupRepository.save(group);
        }

        return enrichGroupDetails(group);
    }

    @Transactional
    public CarpoolGroupDetailsDto leaveCarpool(String groupId, String participantId) {
        CarpoolGroup group = carpoolGroupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Carpool group not found: " + groupId));

        CarpoolMember member = carpoolMemberRepository.findByCarpoolGroupIdAndParticipantId(groupId, participantId)
                .orElseThrow(() -> new ResourceNotFoundException("Member association not found in this group"));

        // If driver leaves, we cancel the group
        if ("driver".equalsIgnoreCase(member.getRole())) {
            group.setStatus("cancelled");
            carpoolGroupRepository.save(group);
            member.setStatus("left");
            carpoolMemberRepository.save(member);
        } else {
            // Passenger leaves: hard delete or set status to left
            carpoolMemberRepository.delete(member); // delete passenger booking
            
            // Re-check capacity
            CarpoolGroupDetailsDto details = enrichGroupDetails(group);
            if (details.seatsTaken() < details.seatsAvailable() && "full".equalsIgnoreCase(group.getStatus())) {
                group.setStatus("open");
                carpoolGroupRepository.save(group);
            }
        }

        return enrichGroupDetails(group);
    }

    @Transactional(readOnly = true)
    public List<CarpoolGroupDetailsDto> getSuggestions(String eventId, String participantId) {
        // Fetch passenger travel plan
        Optional<TravelPlan> planOpt = travelPlanRepository.findByParticipantId(participantId);
        if (planOpt.isEmpty()) {
            return Collections.emptyList(); // no plan, no suggestions
        }

        TravelPlan plan = planOpt.get();
        String city = plan.getOriginCity();
        String area = plan.getOriginArea();

        // Get open groups in the same city
        List<CarpoolGroup> allGroups = carpoolGroupRepository.findByEventId(eventId);
        List<CarpoolGroup> matchingGroups = allGroups.stream()
                .filter(cg -> "open".equalsIgnoreCase(cg.getStatus()))
                .filter(cg -> city.equalsIgnoreCase(cg.getOriginCity()))
                .collect(Collectors.toList());

        List<CarpoolGroupDetailsDto> enriched = matchingGroups.stream()
                .map(this::enrichGroupDetails)
                .collect(Collectors.toList());

        // Sort: locality match first
        enriched.sort((g1, g2) -> {
            boolean g1AreaMatch = area != null && g1.originArea() != null && g1.originArea().toLowerCase().contains(area.toLowerCase());
            boolean g2AreaMatch = area != null && g2.originArea() != null && g2.originArea().toLowerCase().contains(area.toLowerCase());
            if (g1AreaMatch && !g2AreaMatch) return -1;
            if (!g1AreaMatch && g2AreaMatch) return 1;
            return 0; // maintain database order
        });

        return enriched;
    }

    private CarpoolGroupDetailsDto enrichGroupDetails(CarpoolGroup group) {
        List<CarpoolMember> members = carpoolMemberRepository.findByCarpoolGroupIdAndStatus(group.getId(), "active");
        
        List<String> pIds = members.stream().map(CarpoolMember::getParticipantId).collect(Collectors.toList());
        List<Participant> participants = participantRepository.findAllById(pIds);
        Map<String, Participant> pMap = participants.stream().collect(Collectors.toMap(Participant::getId, p -> p));

        List<CarpoolMemberInfoDto> infoList = new ArrayList<>();
        String driverName = "Unknown";
        String driverPhone = "";

        int seatsTaken = 0;

        for (CarpoolMember m : members) {
            Participant p = pMap.get(m.getParticipantId());
            if (p == null) continue;

            if ("driver".equalsIgnoreCase(m.getRole())) {
                driverName = p.getFullName();
                driverPhone = p.getMobileNumber();
            } else {
                seatsTaken++;
            }

            infoList.add(new CarpoolMemberInfoDto(
                    p.getId(),
                    p.getFullName(),
                    p.isShowPhone() ? p.getMobileNumber() : "[Hidden]",
                    p.isShowEmail() ? p.getEmail() : "[Hidden]",
                    m.getRole(),
                    m.getJoinedAt(),
                    m.getStatus(),
                    p.isShowPhone(),
                    p.isShowEmail()
            ));
        }

        return new CarpoolGroupDetailsDto(
                group.getId(),
                group.getEventId(),
                group.getTitle(),
                group.getOriginCity(),
                group.getOriginArea(),
                group.getDriverParticipantId(),
                driverName,
                driverPhone,
                group.getVehicleType(),
                group.getDepartureDate(),
                group.getDepartureTime(),
                group.getSeatsAvailable(),
                seatsTaken,
                group.getPickupNotes(),
                group.getStatus(),
                group.getCreatedBy(),
                infoList,
                group.getCreatedAt(),
                group.getUpdatedAt()
        );
    }
}
