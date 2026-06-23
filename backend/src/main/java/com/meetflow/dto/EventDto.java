package com.meetflow.dto;

import java.time.LocalDateTime;

public record EventDto(
    String id,
    String eventName,
    String eventType,
    String eventSlug,
    String eventCode,
    String description,
    String venueName,
    String venueAddress,
    String venueGoogleMapUrl,
    LocalDateTime startDatetime,
    LocalDateTime endDatetime,
    String createdBy,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
