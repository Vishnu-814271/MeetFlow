package com.meetflow.dto;

import java.time.LocalDateTime;

public record TravelPlanDto(
    String id,
    String eventId,
    String participantId,
    String originCity,
    String originArea,
    String googleMapsLink,
    String travelMode,
    String departureDate,
    String departureTime,
    String expectedArrivalDate,
    String expectedArrivalTime,
    String returnDate,
    String returnTime,
    int peopleCount,
    int luggageCount,
    String travelNote,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
