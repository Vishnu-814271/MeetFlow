package com.meetflow.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    @Id
    private String id;

    @Column(name = "event_id", nullable = false)
    private String eventId;

    @Column(name = "posted_by", nullable = false)
    private String postedBy;

    @Column(name = "message_text", nullable = false)
    private String messageText;

    @Column(nullable = false)
    private String category;

    @Column(name = "visibility_type", nullable = false)
    private String visibilityType;

    @Column(name = "target_city")
    private String targetCity;

    @Column(name = "target_carpool_group_id")
    private String targetCarpoolGroupId;

    @Column(name = "is_pinned", nullable = false)
    private boolean isPinned = false;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

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
