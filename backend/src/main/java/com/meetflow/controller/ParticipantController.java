package com.meetflow.controller;

import com.meetflow.dto.ParticipantDto;
import com.meetflow.service.ParticipantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ParticipantController {
    private final ParticipantService participantService;

    @GetMapping("/api/events/{eventId}/participants")
    public ResponseEntity<List<ParticipantDto>> getParticipants(@PathVariable String eventId) {
        return ResponseEntity.ok(participantService.getParticipantsByEventId(eventId));
    }

    @GetMapping("/api/participants/{id}")
    public ResponseEntity<ParticipantDto> getParticipantById(@PathVariable String id) {
        return ResponseEntity.ok(participantService.getParticipantById(id));
    }

    @PostMapping("/api/participants")
    public ResponseEntity<ParticipantDto> createParticipant(@RequestBody ParticipantDto dto) {
        return ResponseEntity.ok(participantService.createParticipant(dto));
    }

    @PutMapping("/api/participants/{id}")
    public ResponseEntity<ParticipantDto> updateParticipant(@PathVariable String id, @RequestBody ParticipantDto dto) {
        return ResponseEntity.ok(participantService.updateParticipant(id, dto));
    }

    @PostMapping("/api/participants/verify")
    public ResponseEntity<ParticipantDto> verifyParticipant(@RequestBody Map<String, String> payload) {
        String eventCode = payload.get("eventCode");
        String mobileNumber = payload.get("mobileNumber");
        return ResponseEntity.ok(participantService.verifyParticipant(eventCode, mobileNumber));
    }
}
