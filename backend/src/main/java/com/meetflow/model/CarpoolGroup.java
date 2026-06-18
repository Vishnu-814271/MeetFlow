package com.meetflow.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "carpool_groups")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CarpoolGroup {
    @Id
    private String id;

    @Column(name = "event_id", nullable = false)
    private String eventId;

    @Column(nullable = false)
    private String title;

    @Column(name = "origin_city", nullable = false)
    private String originCity;

    @Column(name = "origin_area")
    private String originArea;

    @Column(name = "driver_participant_id", nullable = false)
    private String driverParticipantId;

    @Column(name = "vehicle_type")
    private String vehicleType;

    @Column(name = "departure_date", nullable = false)
    private String departureDate;

    @Column(name = "departure_time", nullable = false)
    private String departureTime;

    @Column(name = "seats_available", nullable = false)
    private int seatsAvailable;

    @Column(name = "pickup_notes")
    private String pickupNotes;

    @Column(nullable = false)
    private String status;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

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
