package com.meetflow.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Tracks departure reminder notification sends per travel plan.
 * Acts as a deduplication guard — once a row exists for a travel_plan_id,
 * the scheduler will skip it on all subsequent fires.
 */
@Entity
@Table(name = "notification_logs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationLog {

    @Id
    private String id;

    @Column(name = "travel_plan_id", nullable = false, unique = true)
    private String travelPlanId;

    @Column(name = "participant_id", nullable = false)
    private String participantId;

    @Column(name = "email_sent", nullable = false)
    private boolean emailSent = false;

    @Column(name = "whatsapp_sent", nullable = false)
    private boolean whatsappSent = false;

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;
}
