package com.meetflow.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "travel_plans")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TravelPlan {
    @Id
    private String id;

    @Column(name = "event_id", nullable = false)
    private String eventId;

    @Column(name = "participant_id", nullable = false, unique = true)
    private String participantId;

    @Column(name = "origin_city", nullable = false)
    private String originCity;

    @Column(name = "origin_area")
    private String originArea;

    @Column(name = "google_maps_link")
    private String googleMapsLink;

    @Column(name = "travel_mode", nullable = false)
    private String travelMode;

    @Column(name = "departure_date")
    private String departureDate;

    @Column(name = "departure_time")
    private String departureTime;

    @Column(name = "expected_arrival_date")
    private String expectedArrivalDate;

    @Column(name = "expected_arrival_time")
    private String expectedArrivalTime;

    @Column(name = "return_date")
    private String returnDate;

    @Column(name = "return_time")
    private String returnTime;

    @Column(name = "people_count", nullable = false)
    private int peopleCount = 1;

    @Column(name = "luggage_count")
    private int luggageCount = 0;

    @Column(name = "travel_note")
    private String travelNote;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = java.util.UUID.randomUUID().toString();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
