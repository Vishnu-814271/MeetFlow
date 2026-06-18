package com.meetflow.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "status_updates")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatusUpdate {
    @Id
    private String id;

    @Column(name = "event_id", nullable = false)
    private String eventId;

    @Column(name = "participant_id", nullable = false)
    private String participantId;

    @Column(nullable = false)
    private String status;

    @Column(name = "marked_by", nullable = false)
    private String markedBy;

    private String note;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = java.util.UUID.randomUUID().toString();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
