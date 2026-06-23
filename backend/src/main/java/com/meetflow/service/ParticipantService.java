package com.meetflow.service;

import com.meetflow.dto.ParticipantDto;
import com.meetflow.exception.ResourceNotFoundException;
import com.meetflow.mapper.ParticipantMapper;
import com.meetflow.model.AuditLog;
import com.meetflow.model.Event;
import com.meetflow.model.Participant;
import com.meetflow.model.StatusUpdate;
import com.meetflow.repository.AuditLogRepository;
import com.meetflow.repository.EventRepository;
import com.meetflow.repository.ParticipantRepository;
import com.meetflow.repository.StatusUpdateRepository;
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
public class ParticipantService {
    private final ParticipantRepository participantRepository;
    private final EventRepository eventRepository;
    private final StatusUpdateRepository statusUpdateRepository;
    private final AuditLogRepository auditLogRepository;
    private final ParticipantMapper participantMapper;

    @Transactional(readOnly = true)
    public List<ParticipantDto> getParticipantsByEventId(String eventId) {
        return participantRepository.findByEventId(eventId).stream()
                .map(participantMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ParticipantDto getParticipantById(String id) {
        Participant participant = participantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Participant not found with id: " + id));
        return participantMapper.toDto(participant);
    }

    @Transactional
    public ParticipantDto createParticipant(ParticipantDto dto) {
        // Verify event exists
        eventRepository.findById(dto.eventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + dto.eventId()));

        // Check if participant already exists by mobile number for this event
        Optional<Participant> existingOpt = participantRepository.findByEventIdAndMobileNumber(dto.eventId(), dto.mobileNumber());
        if (existingOpt.isPresent()) {
            // Instead of throwing, we can return the existing participant to prevent duplicates
            return participantMapper.toDto(existingOpt.get());
        }

        Participant participant = participantMapper.toEntity(dto);
        // Defaults
        if (participant.getId() == null) {
            participant.setId(UUID.randomUUID().toString());
        }
        participant.setProfileStatus("completed");
        Participant saved = participantRepository.save(participant);

        // Audit log creation
        AuditLog log = AuditLog.builder()
                .id(UUID.randomUUID().toString())
                .eventId(saved.getEventId())
                .actorParticipantId(saved.getId())
                .actionType("REGISTER")
                .entityType("PARTICIPANT")
                .entityId(saved.getId())
                .newValue(saved.getFullName())
                .createdAt(LocalDateTime.now())
                .build();
        auditLogRepository.save(log);

        // Status update registration
        StatusUpdate update = StatusUpdate.builder()
                .id(UUID.randomUUID().toString())
                .eventId(saved.getEventId())
                .participantId(saved.getId())
                .status(saved.getAttendanceStatus().equals("confirmed") ? "registered" : "not_coming")
                .markedBy(saved.getFullName())
                .note("Participant registered with attendance status: " + saved.getAttendanceStatus())
                .createdAt(LocalDateTime.now())
                .build();
        statusUpdateRepository.save(update);

        return participantMapper.toDto(saved);
    }

    @Transactional
    public ParticipantDto updateParticipant(String id, ParticipantDto dto) {
        Participant existing = participantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Participant not found with id: " + id));

        String oldVal = "Attendance: " + existing.getAttendanceStatus() + ", Name: " + existing.getFullName();
        
        // Update fields
        existing.setFullName(dto.fullName());
        existing.setMobileNumber(dto.mobileNumber());
        existing.setEmail(dto.email());
        existing.setBatchOrGroup(dto.batchOrGroup());
        existing.setCurrentCity(dto.currentCity());
        existing.setAttendanceStatus(dto.attendanceStatus());
        existing.setShowName(dto.showName());
        existing.setShowPhone(dto.showPhone());
        existing.setShowEmail(dto.showEmail());
        existing.setShowTravelDetails(dto.showTravelDetails());
        existing.setAllowContact(dto.allowContact());
        existing.setCustomFieldsData(dto.customFieldsData());

        Participant saved = participantRepository.save(existing);

        String newVal = "Attendance: " + saved.getAttendanceStatus() + ", Name: " + saved.getFullName();

        // Audit log update
        AuditLog log = AuditLog.builder()
                .id(UUID.randomUUID().toString())
                .eventId(saved.getEventId())
                .actorParticipantId(saved.getId())
                .actionType("UPDATE_PROFILE")
                .entityType("PARTICIPANT")
                .entityId(saved.getId())
                .oldValue(oldVal)
                .newValue(newVal)
                .createdAt(LocalDateTime.now())
                .build();
        auditLogRepository.save(log);

        return participantMapper.toDto(saved);
    }

    @Transactional(readOnly = true)
    public ParticipantDto verifyParticipant(String eventCode, String mobileNumber) {
        Event event = eventRepository.findByEventCode(eventCode)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid Event Code: " + eventCode));

        Participant participant = participantRepository.findByEventIdAndMobileNumber(event.getId(), mobileNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for this mobile number: " + mobileNumber));

        return participantMapper.toDto(participant);
    }
}
