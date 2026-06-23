package com.meetflow.dto;

import java.time.LocalDateTime;

public record OrganizationDto(
    String id,
    String name,
    String orgType,
    String slug,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
