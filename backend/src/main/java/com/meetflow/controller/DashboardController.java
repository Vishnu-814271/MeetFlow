package com.meetflow.controller;

import com.meetflow.dto.DashboardDto;
import com.meetflow.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events/{eventId}/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardDto> getDashboardData(@PathVariable String eventId) {
        return ResponseEntity.ok(dashboardService.getDashboardData(eventId));
    }
}
