package com.meetflow.service;

import com.meetflow.dto.StatusUpdateDto;
import com.meetflow.exception.ResourceNotFoundException;
import com.meetflow.mapper.StatusUpdateMapper;
import com.meetflow.model.AuditLog;
import com.meetflow.model.Participant;
import com.meetflow.model.StatusUpdate;
import com.meetflow.repository.AuditLogRepository;
import com.meetflow.repository.ParticipantRepository;
import com.meetflow.repository.StatusUpdateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatusUpdateService {
    private final StatusUpdateRepository statusUpdateRepository;
    private final ParticipantRepository participantRepository;
    private final AuditLogRepository auditLogRepository;
    private final StatusUpdateMapper statusUpdateMapper;

    @Transactional(readOnly = true)
    public List<StatusUpdateDto> getUpdatesByEventId(String eventId) {
        return statusUpdateRepository.findByEventIdOrderByCreatedAtDesc(eventId).stream()
                .map(statusUpdateMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<StatusUpdateDto> getUpdatesByParticipantId(String participantId) {
        return statusUpdateRepository.findByParticipantIdOrderByCreatedAtDesc(participantId).stream()
                .map(statusUpdateMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public StatusUpdateDto saveStatusUpdate(StatusUpdateDto dto) {
        Participant participant = participantRepository.findById(dto.participantId())
                .orElseThrow(() -> new ResourceNotFoundException("Participant not found: " + dto.participantId()));

        StatusUpdate update = statusUpdateMapper.toEntity(dto);
        if (update.getId() == null) {
            update.setId(UUID.randomUUID().toString());
        }
        StatusUpdate saved = statusUpdateRepository.save(update);

        // Audit log status change
        AuditLog log = AuditLog.builder()
                .id(UUID.randomUUID().toString())
                .eventId(saved.getEventId())
                .actorParticipantId(saved.getParticipantId())
                .actionType("STATUS_CHANGE")
                .entityType("STATUS")
                .entityId(saved.getId())
                .oldValue(dto.note())
                .newValue(dto.status())
                .createdAt(LocalDateTime.now())
                .build();
        auditLogRepository.save(log);

        return statusUpdateMapper.toDto(saved);
    }
}
