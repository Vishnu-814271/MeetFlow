package com.meetflow.dto;

public record CreateEventResponse(
    EventDto event,
    ParticipantDto organizer
) {}
