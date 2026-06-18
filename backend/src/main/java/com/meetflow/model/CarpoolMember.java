package com.meetflow.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "carpool_members")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CarpoolMember {
    @Id
    private String id;

    @Column(name = "carpool_group_id", nullable = false)
    private String carpoolGroupId;

    @Column(name = "participant_id", nullable = false)
    private String participantId;

    @Column(nullable = false)
    private String role;

    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt;

    @Column(nullable = false)
    private String status;

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = java.util.UUID.randomUUID().toString();
        }
        if (joinedAt == null) {
            joinedAt = LocalDateTime.now();
        }
    }
}
