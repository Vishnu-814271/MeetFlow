package com.meetflow.dto;

public record PendingParticipantDto(
    String id,
    String fullName,
    String currentCity,
    String mobileNumber,
    String email,
    boolean showPhone,
    boolean showEmail
) {}
