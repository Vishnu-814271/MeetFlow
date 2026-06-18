package com.meetflow.service;

import com.meetflow.dto.TravelPlanDto;
import com.meetflow.exception.ResourceNotFoundException;
import com.meetflow.mapper.TravelPlanMapper;
import com.meetflow.model.Participant;
import com.meetflow.model.StatusUpdate;
import com.meetflow.model.TravelPlan;
import com.meetflow.repository.ParticipantRepository;
import com.meetflow.repository.StatusUpdateRepository;
import com.meetflow.repository.TravelPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TravelPlanService {
    private final TravelPlanRepository travelPlanRepository;
    private final ParticipantRepository participantRepository;
    private final StatusUpdateRepository statusUpdateRepository;
    private final TravelPlanMapper travelPlanMapper;

    @Transactional(readOnly = true)
    public List<TravelPlanDto> getTravelPlansByEventId(String eventId) {
        return travelPlanRepository.findByEventId(eventId).stream()
                .map(travelPlanMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TravelPlanDto getTravelPlanByParticipantId(String participantId) {
        TravelPlan plan = travelPlanRepository.findByParticipantId(participantId)
                .orElseThrow(() -> new ResourceNotFoundException("Travel plan not found for participant: " + participantId));
        return travelPlanMapper.toDto(plan);
    }

    @Transactional
    public TravelPlanDto saveTravelPlan(TravelPlanDto dto) {
        Participant participant = participantRepository.findById(dto.participantId())
                .orElseThrow(() -> new ResourceNotFoundException("Participant not found: " + dto.participantId()));

        Optional<TravelPlan> existingOpt = travelPlanRepository.findByParticipantId(dto.participantId());
        TravelPlan plan;

        if (existingOpt.isPresent()) {
            plan = existingOpt.get();
            plan.setOriginCity(dto.originCity());
            plan.setOriginArea(dto.originArea());
            plan.setGoogleMapsLink(dto.googleMapsLink());
            plan.setTravelMode(dto.travelMode());
            plan.setDepartureDate(dto.departureDate());
            plan.setDepartureTime(dto.departureTime());
            plan.setExpectedArrivalDate(dto.expectedArrivalDate());
            plan.setExpectedArrivalTime(dto.expectedArrivalTime());
            plan.setReturnDate(dto.returnDate());
            plan.setReturnTime(dto.returnTime());
            plan.setPeopleCount(dto.peopleCount());
            plan.setLuggageCount(dto.luggageCount());
            plan.setTravelNote(dto.travelNote());
        } else {
            plan = travelPlanMapper.toEntity(dto);
            if (plan.getId() == null) {
                plan.setId(UUID.randomUUID().toString());
            }
        }

        TravelPlan saved = travelPlanRepository.save(plan);

        // Update Participant status
        String status = "travel_plan_submitted";
        if ("not_decided".equalsIgnoreCase(saved.getTravelMode())) {
            status = "travel_not_decided";
        }

        // Add a new status update
        StatusUpdate update = StatusUpdate.builder()
                .id(UUID.randomUUID().toString())
                .eventId(saved.getEventId())
                .participantId(participant.getId())
                .status(status)
                .markedBy(participant.getFullName())
                .note("Submitted travel plan with mode: " + saved.getTravelMode())
                .createdAt(LocalDateTime.now())
                .build();
        statusUpdateRepository.save(update);

        return travelPlanMapper.toDto(saved);
    }
}
