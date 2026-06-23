package com.meetflow.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Event {
    @Id
    private String id;

    @Column(name = "event_name", nullable = false)
    private String eventName;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @Column(name = "organization_id")
    private String organizationId;

    @Column(name = "features_config")
    private String featuresConfig;

    @Column(name = "registration_schema")
    private String registrationSchema;

    @Column(name = "roles_schema")
    private String rolesSchema;

    @Column(name = "dashboard_schema")
    private String dashboardSchema;

    @Column(name = "event_slug", nullable = false, unique = true)
    private String eventSlug;

    @Column(name = "event_code", nullable = false, unique = true)
    private String eventCode;

    private String description;

    @Column(name = "venue_name")
    private String venueName;

    @Column(name = "venue_address")
    private String venueAddress;

    @Column(name = "venue_google_map_url")
    private String venueGoogleMapUrl;

    @Column(name = "start_datetime")
    private LocalDateTime startDatetime;

    @Column(name = "end_datetime")
    private LocalDateTime endDatetime;

    @Column(name = "created_by")
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
        if (eventType == null) {
            eventType = "ALUMNI";
        }
        if (featuresConfig == null) {
            featuresConfig = "{\"travel\":true,\"carpool\":true,\"announcements\":true,\"chat\":true,\"gallery\":true,\"polls\":true,\"attendance\":true}";
        }
        if (registrationSchema == null) {
            registrationSchema = "[{\"name\":\"batchOrGroup\",\"label\":\"Batch / Group\",\"type\":\"text\",\"placeholder\":\"e.g. Batch of 2018\",\"required\":false}]";
        }
        if (rolesSchema == null) {
            rolesSchema = "[\"organizer\",\"participant\",\"driver\"]";
        }
        if (dashboardSchema == null) {
            dashboardSchema = "[\"total_registered\",\"confirmed\",\"maybe\",\"not_attending\",\"pending_responses\",\"reached_venue\",\"en_route\"]";
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
