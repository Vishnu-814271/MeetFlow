package com.meetflow.dto;

import java.time.LocalDateTime;

public record MessageDto(
    String id,
    String eventId,
    String postedBy,
    String messageText,
    String category,
    String visibilityType,
    String targetCity,
    String targetCarpoolGroupId,
    boolean isPinned,
    boolean isDeleted,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
