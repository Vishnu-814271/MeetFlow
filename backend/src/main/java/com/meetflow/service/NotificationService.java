package com.meetflow.service;

import com.meetflow.model.Event;
import com.meetflow.model.Participant;
import com.meetflow.model.TravelPlan;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Sends departure reminder notifications via WhatsApp (Twilio).
 *
 * Credentials are loaded from application-dev.yml under meetflow.notifications.twilio.*
 * The caller (DepartureReminderScheduler) is responsible for deduplication checks.
 */
@Slf4j
@Service
public class NotificationService {

    @Value("${meetflow.notifications.enabled:false}")
    private boolean notificationsEnabled;

    @Value("${meetflow.notifications.twilio.account-sid:}")
    private String twilioAccountSid;

    @Value("${meetflow.notifications.twilio.auth-token:}")
    private String twilioAuthToken;

    @Value("${meetflow.notifications.twilio.whatsapp-from:whatsapp:+14155238886}")
    private String whatsappFrom;

    /**
     * Sends a WhatsApp departure reminder to the participant.
     *
     * @return true if the message was dispatched successfully, false otherwise.
     */
    public boolean sendWhatsAppReminder(Participant participant, TravelPlan plan, Event event) {
        if (!notificationsEnabled) {
            log.info("[Notifications] Notifications are disabled. Skipping WhatsApp for participant={}",
                    participant.getId());
            return false;
        }

        String mobile = participant.getMobileNumber();
        if (mobile == null || mobile.isBlank()) {
            log.warn("[Notifications] Participant {} has no mobile number — skipping WhatsApp", participant.getId());
            return false;
        }

        // Normalise the number to E.164 with whatsapp: prefix
        String toNumber = normaliseToWhatsApp(mobile);

        String messageBody = buildWhatsAppMessage(participant, plan, event);

        try {
            Twilio.init(twilioAccountSid, twilioAuthToken);

            Message message = Message.creator(
                    new PhoneNumber(toNumber),
                    new PhoneNumber(whatsappFrom),
                    messageBody
            ).create();

            log.info("[Notifications] WhatsApp sent to {} — SID={}", toNumber, message.getSid());
            return true;

        } catch (Exception e) {
            log.error("[Notifications] WhatsApp send FAILED for participant={} number={} — {}",
                    participant.getId(), toNumber, e.getMessage(), e);
            return false;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Formats the departure reminder WhatsApp message body.
     */
    private String buildWhatsAppMessage(Participant participant, TravelPlan plan, Event event) {
        String firstName = participant.getFullName().split(" ")[0];
        String travelMode = capitalise(plan.getTravelMode());
        String originDisplay = plan.getOriginArea() != null && !plan.getOriginArea().isBlank()
                ? plan.getOriginCity() + ", " + plan.getOriginArea()
                : plan.getOriginCity();

        return String.format(
                "🚀 *MEET-FLOW Reminder*\n\n" +
                "Hi %s! Your departure for *%s* is in *30 minutes*.\n\n" +
                "📍 From: %s\n" +
                "🕒 At: %s on %s\n" +
                "🚗 Mode: %s\n" +
                "📌 Venue: %s\n\n" +
                "Safe travels! See you there 🙏\n" +
                "— MEET-FLOW",
                firstName,
                event.getEventName(),
                originDisplay,
                plan.getDepartureTime(),
                plan.getDepartureDate(),
                travelMode,
                event.getVenueName() != null ? event.getVenueName() : "Venue TBC"
        );
    }

    /**
     * Ensures the number has the "whatsapp:" prefix and is in E.164 format.
     * If the number does not start with +, we prepend + (assumes Indian numbers).
     */
    private String normaliseToWhatsApp(String rawNumber) {
        String stripped = rawNumber.trim().replaceAll("[\\s\\-()]", "");
        if (!stripped.startsWith("+")) {
            // Assume India +91 if no country code present
            if (stripped.startsWith("0")) {
                stripped = "+91" + stripped.substring(1);
            } else if (!stripped.startsWith("91")) {
                stripped = "+91" + stripped;
            } else {
                stripped = "+" + stripped;
            }
        }
        return "whatsapp:" + stripped;
    }

    private String capitalise(String s) {
        if (s == null || s.isBlank()) return "N/A";
        return Character.toUpperCase(s.charAt(0)) + s.substring(1).toLowerCase().replace("_", " ");
    }
}
