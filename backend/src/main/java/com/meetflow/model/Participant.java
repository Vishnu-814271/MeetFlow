package com.meetflow.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "participants")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Participant {
    @Id
    private String id;

    @Column(name = "event_id", nullable = false)
    private String eventId;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "mobile_number", nullable = false)
    private String mobileNumber;

    private String email;

    @Column(name = "batch_or_group")
    private String batchOrGroup;

    @Column(name = "current_city")
    private String currentCity;

    @Column(name = "attendance_status", nullable = false)
    private String attendanceStatus;

    @Column(name = "profile_status", nullable = false)
    private String profileStatus;

    @Column(name = "show_name", nullable = false)
    private boolean showName = true;

    @Column(name = "show_phone", nullable = false)
    private boolean showPhone = false;

    @Column(name = "show_email", nullable = false)
    private boolean showEmail = false;

    @Column(name = "show_travel_details", nullable = false)
    private boolean showTravelDetails = true;

    @Column(name = "allow_contact", nullable = false)
    private boolean allowContact = true;

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
