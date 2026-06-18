package com.meetflow.dto;

import java.time.LocalDateTime;
import java.util.List;

public record CarpoolGroupDetailsDto(
    String id,
    String eventId,
    String title,
    String originCity,
    String originArea,
    String driverParticipantId,
    String driverName,
    String driverPhone,
    String vehicleType,
    String departureDate,
    String departureTime,
    int seatsAvailable,
    int seatsTaken,
    String pickupNotes,
    String status,
    String createdBy,
    List<CarpoolMemberInfoDto> members,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
