package com.meetflow.controller;

import com.meetflow.dto.EventDto;
import com.meetflow.dto.CreateEventRequest;
import com.meetflow.dto.CreateEventResponse;
import com.meetflow.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {
    private final EventService eventService;

    @GetMapping("/{slug}")
    public ResponseEntity<EventDto> getEventBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(eventService.getEventBySlug(slug));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<EventDto> getEventByCode(@PathVariable String code) {
        return ResponseEntity.ok(eventService.getEventByCode(code));
    }

    @PostMapping
    public ResponseEntity<EventDto> createEvent(@RequestBody EventDto eventDto) {
        return ResponseEntity.ok(eventService.createEvent(eventDto));
    }

    @PostMapping("/with-organizer")
    public ResponseEntity<CreateEventResponse> createEventWithOrganizer(@RequestBody CreateEventRequest request) {
        return ResponseEntity.ok(eventService.createEventWithOrganizer(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventDto> updateEvent(@PathVariable String id, @RequestBody EventDto eventDto) {
        return ResponseEntity.ok(eventService.updateEvent(id, eventDto));
    }
}

