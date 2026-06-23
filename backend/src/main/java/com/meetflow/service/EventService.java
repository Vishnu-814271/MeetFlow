package com.meetflow.service;

import com.meetflow.dto.EventDto;
import com.meetflow.dto.CreateEventRequest;
import com.meetflow.dto.CreateEventResponse;
import com.meetflow.dto.ParticipantDto;
import com.meetflow.exception.ResourceNotFoundException;
import com.meetflow.mapper.EventMapper;
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
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventService {
    private final EventRepository eventRepository;
    private final ParticipantRepository participantRepository;
    private final StatusUpdateRepository statusUpdateRepository;
    private final AuditLogRepository auditLogRepository;
    private final EventMapper eventMapper;
    private final ParticipantMapper participantMapper;

    @Transactional(readOnly = true)
    public EventDto getEventBySlug(String slug) {
        Event event = eventRepository.findByEventSlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with slug: " + slug));
        return eventMapper.toDto(event);
    }

    @Transactional(readOnly = true)
    public EventDto getEventByCode(String code) {
        Event event = eventRepository.findByEventCode(code.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with code: " + code));
        return eventMapper.toDto(event);
    }

    @Transactional
    public EventDto createEvent(EventDto eventDto) {
        Event event = eventMapper.toEntity(eventDto);
        
        // Generate automatic code
        if (event.getEventCode() == null || event.getEventCode().isBlank()) {
            String code;
            do {
                code = generateRandomCode(6);
            } while (eventRepository.findByEventCode(code).isPresent());
            event.setEventCode(code);
        }
        
        // Generate automatic slug
        if (event.getEventSlug() == null || event.getEventSlug().isBlank()) {
            String slugBase = slugify(event.getEventName());
            String slug = slugBase;
            int counter = 1;
            while (eventRepository.findByEventSlug(slug).isPresent()) {
                slug = slugBase + "-" + counter;
                counter++;
            }
            event.setEventSlug(slug);
        }
        
        Event saved = eventRepository.save(event);
        return eventMapper.toDto(saved);
    }

    @Transactional
    public CreateEventResponse createEventWithOrganizer(CreateEventRequest request) {
        EventDto eventDto = request.event();
        ParticipantDto organizerDto = request.organizer();
        
        Event event = eventMapper.toEntity(eventDto);
        
        // Generate automatic code
        String code;
        do {
            code = generateRandomCode(6);
        } while (eventRepository.findByEventCode(code).isPresent());
        event.setEventCode(code);
        
        // Generate automatic slug
        String slugBase = slugify(event.getEventName());
        String slug = slugBase;
        int counter = 1;
        while (eventRepository.findByEventSlug(slug).isPresent()) {
            slug = slugBase + "-" + counter;
            counter++;
        }
        event.setEventSlug(slug);
        
        // Generate random UUID for organizer participant
        String organizerId = UUID.randomUUID().toString();
        event.setCreatedBy(organizerId);
        
        // Save Event
        Event savedEvent = eventRepository.save(event);
        
        // Create Organizer Participant
        Participant organizer = Participant.builder()
                .id(organizerId)
                .eventId(savedEvent.getId())
                .fullName(organizerDto.fullName())
                .mobileNumber(organizerDto.mobileNumber())
                .email(organizerDto.email())
                .batchOrGroup(organizerDto.batchOrGroup())
                .currentCity(organizerDto.currentCity())
                .attendanceStatus("confirmed")
                .profileStatus("completed")
                .showName(true)
                .showPhone(true)
                .showEmail(true)
                .showTravelDetails(true)
                .allowContact(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        Participant savedOrganizer = participantRepository.save(organizer);
        
        // Audit log
        AuditLog log = AuditLog.builder()
                .id(UUID.randomUUID().toString())
                .eventId(savedEvent.getId())
                .actorParticipantId(organizerId)
                .actionType("REGISTER")
                .entityType("PARTICIPANT")
                .entityId(organizerId)
                .newValue(organizer.getFullName())
                .createdAt(LocalDateTime.now())
                .build();
        auditLogRepository.save(log);

        // Status update
        StatusUpdate update = StatusUpdate.builder()
                .id(UUID.randomUUID().toString())
                .eventId(savedEvent.getId())
                .participantId(organizerId)
                .status("registered")
                .markedBy(organizer.getFullName())
                .note("Organizer registered and event created.")
                .createdAt(LocalDateTime.now())
                .build();
        statusUpdateRepository.save(update);
        
        return new CreateEventResponse(eventMapper.toDto(savedEvent), participantMapper.toDto(savedOrganizer));
    }

    @Transactional
    public EventDto updateEvent(String id, EventDto eventDto) {
        Event existing = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
        existing.setEventName(eventDto.eventName());
        existing.setEventType(eventDto.eventType());
        existing.setDescription(eventDto.description());
        existing.setVenueName(eventDto.venueName());
        existing.setVenueAddress(eventDto.venueAddress());
        existing.setVenueGoogleMapUrl(eventDto.venueGoogleMapUrl());
        existing.setStartDatetime(eventDto.startDatetime());
        existing.setEndDatetime(eventDto.endDatetime());
        Event saved = eventRepository.save(existing);
        return eventMapper.toDto(saved);
    }

    private String generateRandomCode(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random rnd = new Random();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }

    private String slugify(String input) {
        if (input == null || input.isBlank()) {
            return "event-" + UUID.randomUUID().toString().substring(0, 8);
        }
        return input.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }
}

