package com.meetflow.dto;

import java.util.List;
import java.util.Map;

public record DashboardDto(
    Map<String, Long> attendanceSummary,
    Map<String, Long> citySummary,
    Map<String, Long> travelModeSummary,
    Map<String, List<String>> arrivalTimeline,
    List<PendingParticipantDto> pendingResponses
) {}
