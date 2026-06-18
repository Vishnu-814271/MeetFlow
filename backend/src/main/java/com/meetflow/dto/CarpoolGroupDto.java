package com.meetflow.dto;

import java.time.LocalDateTime;

public record CarpoolGroupDto(
    String id,
    String eventId,
    String title,
    String originCity,
    String originArea,
    String driverParticipantId,
    String vehicleType,
    String departureDate,
    String departureTime,
    int seatsAvailable,
    String pickupNotes,
    String status,
    String createdBy,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
