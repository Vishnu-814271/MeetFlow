package com.meetflow.dto;

import java.time.LocalDateTime;

public record CarpoolMemberDto(
    String id,
    String carpoolGroupId,
    String participantId,
    String role,
    LocalDateTime joinedAt,
    String status
) {}
