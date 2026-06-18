package com.meetflow.dto;

import java.time.LocalDateTime;

public record AuditLogDto(
    String id,
    String eventId,
    String actorParticipantId,
    String actionType,
    String entityType,
    String entityId,
    String oldValue,
    String newValue,
    LocalDateTime createdAt
) {}
