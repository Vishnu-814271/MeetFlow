package com.meetflow.controller;

import com.meetflow.dto.CarpoolGroupDetailsDto;
import com.meetflow.dto.CarpoolGroupDto;
import com.meetflow.service.CarpoolService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class CarpoolController {
    private final CarpoolService carpoolService;

    @GetMapping("/api/events/{eventId}/carpool-groups")
    public ResponseEntity<List<CarpoolGroupDetailsDto>> getCarpools(@PathVariable String eventId) {
        return ResponseEntity.ok(carpoolService.getCarpoolsByEventId(eventId));
    }

    @PostMapping("/api/carpool-groups")
    public ResponseEntity<CarpoolGroupDetailsDto> createCarpoolGroup(@RequestBody CarpoolGroupDto dto) {
        return ResponseEntity.ok(carpoolService.createCarpoolGroup(dto));
    }

    @PutMapping("/api/carpool-groups/{id}")
    public ResponseEntity<CarpoolGroupDetailsDto> updateCarpoolGroup(@PathVariable String id, @RequestBody CarpoolGroupDto dto) {
        return ResponseEntity.ok(carpoolService.updateCarpoolGroup(id, dto));
    }

    @PostMapping("/api/carpool-groups/{id}/join")
    public ResponseEntity<CarpoolGroupDetailsDto> joinCarpool(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String participantId = payload.get("participantId");
        return ResponseEntity.ok(carpoolService.joinCarpool(id, participantId));
    }

    @PostMapping("/api/carpool-groups/{id}/leave")
    public ResponseEntity<CarpoolGroupDetailsDto> leaveCarpool(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String participantId = payload.get("participantId");
        return ResponseEntity.ok(carpoolService.leaveCarpool(id, participantId));
    }

    @GetMapping("/api/events/{eventId}/carpool-suggestions")
    public ResponseEntity<List<CarpoolGroupDetailsDto>> getSuggestions(
            @PathVariable String eventId,
            @RequestParam String participantId) {
        return ResponseEntity.ok(carpoolService.getSuggestions(eventId, participantId));
    }
}
