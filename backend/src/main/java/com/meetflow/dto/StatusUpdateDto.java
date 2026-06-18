package com.meetflow.dto;

import java.time.LocalDateTime;

public record StatusUpdateDto(
    String id,
    String eventId,
    String participantId,
    String status,
    String markedBy,
    String note,
    LocalDateTime createdAt
) {}
