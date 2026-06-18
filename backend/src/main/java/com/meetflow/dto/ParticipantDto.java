package com.meetflow.dto;

import java.time.LocalDateTime;

public record ParticipantDto(
    String id,
    String eventId,
    String fullName,
    String mobileNumber,
    String email,
    String batchOrGroup,
    String currentCity,
    String attendanceStatus,
    String profileStatus,
    boolean showName,
    boolean showPhone,
    boolean showEmail,
    boolean showTravelDetails,
    boolean allowContact,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
