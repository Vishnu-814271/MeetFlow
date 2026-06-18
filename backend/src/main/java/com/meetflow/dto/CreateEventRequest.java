package com.meetflow.dto;

public record CreateEventRequest(
    EventDto event,
    ParticipantDto organizer
) {}
