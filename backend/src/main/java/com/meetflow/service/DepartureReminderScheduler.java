package com.meetflow.service;

import com.meetflow.model.Event;
import com.meetflow.model.NotificationLog;
import com.meetflow.model.Participant;
import com.meetflow.model.TravelPlan;
import com.meetflow.repository.EventRepository;
import com.meetflow.repository.NotificationLogRepository;
import com.meetflow.repository.ParticipantRepository;
import com.meetflow.repository.TravelPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Scheduled task that runs every 60 seconds and sends WhatsApp departure
 * reminder messages to participants whose departure is exactly 30 minutes away.
 *
 * Deduplication is handled via the notification_logs table — each travel_plan_id
 * is only notified once, regardless of how many times the scheduler fires.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DepartureReminderScheduler {

    private final TravelPlanRepository travelPlanRepository;
    private final ParticipantRepository participantRepository;
    private final EventRepository eventRepository;
    private final NotificationLogRepository notificationLogRepository;
    private final NotificationService notificationService;

    @Value("${meetflow.notifications.enabled:false}")
    private boolean notificationsEnabled;

    // Runs every 60 seconds
    @Scheduled(fixedRate = 60_000)
    public void checkAndSendDepartureReminders() {
        if (!notificationsEnabled) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        log.debug("[Scheduler] Departure reminder check at {}", now);

        // Compute the target departure window: now + 30 min ± 30 seconds
        LocalDateTime windowStart = now.plusMinutes(30).minusSeconds(30);
        LocalDateTime windowEnd   = now.plusMinutes(30).plusSeconds(30);

        List<TravelPlan> allPlans = travelPlanRepository.findAll();

        for (TravelPlan plan : allPlans) {
            // Skip if already notified
            if (notificationLogRepository.existsByTravelPlanId(plan.getId())) {
                continue;
            }

            // Parse departure date+time
            LocalDateTime departure = parseDeparture(plan.getDepartureDate(), plan.getDepartureTime());
            if (departure == null) {
                continue; // unparseable — skip
            }

            // Check if departure falls in the 30-minute reminder window
            if (departure.isAfter(windowStart) && departure.isBefore(windowEnd)) {
                log.info("[Scheduler] Departure match — plan={} participant={} departure={}",
                        plan.getId(), plan.getParticipantId(), departure);

                sendReminderForPlan(plan);
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────────

    private void sendReminderForPlan(TravelPlan plan) {
        Optional<Participant> participantOpt = participantRepository.findById(plan.getParticipantId());
        if (participantOpt.isEmpty()) {
            log.warn("[Scheduler] Participant not found for plan={}", plan.getId());
            return;
        }

        Optional<Event> eventOpt = eventRepository.findById(plan.getEventId());
        if (eventOpt.isEmpty()) {
            log.warn("[Scheduler] Event not found for plan={}", plan.getId());
            return;
        }

        Participant participant = participantOpt.get();
        Event event = eventOpt.get();

        // Skip participants who have opted out of attendance
        if ("not_attending".equalsIgnoreCase(participant.getAttendanceStatus())) {
            log.debug("[Scheduler] Skipping not_attending participant={}", participant.getId());
            return;
        }

        boolean whatsappSent = notificationService.sendWhatsAppReminder(participant, plan, event);

        // Save notification log regardless of success to prevent retry storms
        NotificationLog logEntry = NotificationLog.builder()
                .id(UUID.randomUUID().toString())
                .travelPlanId(plan.getId())
                .participantId(participant.getId())
                .whatsappSent(whatsappSent)
                .emailSent(false)
                .sentAt(LocalDateTime.now())
                .build();

        notificationLogRepository.save(logEntry);
        log.info("[Scheduler] Notification logged — plan={} whatsapp={}", plan.getId(), whatsappSent);
    }

    /**
     * Parses the string departureDate (e.g. "2026-07-11") and departureTime
     * (e.g. "09:30", "9:30 AM") into a LocalDateTime.
     * Returns null if parsing fails so the plan is safely skipped.
     */
    private LocalDateTime parseDeparture(String dateStr, String timeStr) {
        if (dateStr == null || dateStr.isBlank() || timeStr == null || timeStr.isBlank()) {
            return null;
        }

        // Parse date
        LocalDate date;
        try {
            date = LocalDate.parse(dateStr.trim(), DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (DateTimeParseException e) {
            log.debug("[Scheduler] Cannot parse departureDate='{}': {}", dateStr, e.getMessage());
            return null;
        }

        // Parse time — try 24h first, then 12h AM/PM
        LocalTime time = null;
        String[] timeFormats = { "HH:mm", "H:mm", "hh:mm a", "h:mm a", "hh:mma", "h:mma" };
        for (String fmt : timeFormats) {
            try {
                time = LocalTime.parse(timeStr.trim().toUpperCase(), DateTimeFormatter.ofPattern(fmt));
                break;
            } catch (DateTimeParseException ignored) {
                // try next format
            }
        }

        if (time == null) {
            log.debug("[Scheduler] Cannot parse departureTime='{}' with any known format", timeStr);
            return null;
        }

        return LocalDateTime.of(date, time);
    }
}
