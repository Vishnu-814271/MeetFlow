package com.meetflow.dto;

import java.time.LocalDateTime;

public record CarpoolMemberInfoDto(
    String participantId,
    String fullName,
    String mobileNumber,
    String email,
    String role,
    LocalDateTime joinedAt,
    String status,
    boolean showPhone,
    boolean showEmail
) {}
