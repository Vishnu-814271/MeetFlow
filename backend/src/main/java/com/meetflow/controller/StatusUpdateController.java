package com.meetflow.controller;

import com.meetflow.dto.StatusUpdateDto;
import com.meetflow.service.StatusUpdateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class StatusUpdateController {
    private final StatusUpdateService statusUpdateService;

    @GetMapping("/api/events/{eventId}/status-updates")
    public ResponseEntity<List<StatusUpdateDto>> getUpdates(@PathVariable String eventId) {
        return ResponseEntity.ok(statusUpdateService.getUpdatesByEventId(eventId));
    }

    @GetMapping("/api/status-updates/participant/{participantId}")
    public ResponseEntity<List<StatusUpdateDto>> getUpdatesByParticipant(@PathVariable String participantId) {
        return ResponseEntity.ok(statusUpdateService.getUpdatesByParticipantId(participantId));
    }

    @PostMapping("/api/status-updates")
    public ResponseEntity<StatusUpdateDto> saveStatusUpdate(@RequestBody StatusUpdateDto dto) {
        return ResponseEntity.ok(statusUpdateService.saveStatusUpdate(dto));
    }
}
