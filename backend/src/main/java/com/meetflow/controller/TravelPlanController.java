package com.meetflow.controller;

import com.meetflow.dto.TravelPlanDto;
import com.meetflow.service.TravelPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class TravelPlanController {
    private final TravelPlanService travelPlanService;

    @GetMapping("/api/events/{eventId}/travel-plans")
    public ResponseEntity<List<TravelPlanDto>> getTravelPlans(@PathVariable String eventId) {
        return ResponseEntity.ok(travelPlanService.getTravelPlansByEventId(eventId));
    }

    @GetMapping("/api/travel-plans/participant/{participantId}")
    public ResponseEntity<TravelPlanDto> getTravelPlanByParticipant(@PathVariable String participantId) {
        return ResponseEntity.ok(travelPlanService.getTravelPlanByParticipantId(participantId));
    }

    @PostMapping("/api/travel-plans")
    public ResponseEntity<TravelPlanDto> saveTravelPlan(@RequestBody TravelPlanDto dto) {
        return ResponseEntity.ok(travelPlanService.saveTravelPlan(dto));
    }
}
