package com.meetflow.service;

import com.meetflow.dto.DashboardDto;
import com.meetflow.dto.PendingParticipantDto;
import com.meetflow.model.Participant;
import com.meetflow.model.StatusUpdate;
import com.meetflow.model.TravelPlan;
import com.meetflow.repository.ParticipantRepository;
import com.meetflow.repository.StatusUpdateRepository;
import com.meetflow.repository.TravelPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final ParticipantRepository participantRepository;
    private final TravelPlanRepository travelPlanRepository;
    private final StatusUpdateRepository statusUpdateRepository;

    @Transactional(readOnly = true)
    public DashboardDto getDashboardData(String eventId) {
        List<Participant> participants = participantRepository.findByEventId(eventId);
        List<TravelPlan> travelPlans = travelPlanRepository.findByEventId(eventId);
        List<StatusUpdate> updates = statusUpdateRepository.findByEventId(eventId);

        // 1. Determine latest status for each participant
        Map<String, String> latestStatusMap = new HashMap<>();
        updates.stream()
                .sorted(Comparator.comparing(StatusUpdate::getCreatedAt))
                .forEach(u -> latestStatusMap.put(u.getParticipantId(), u.getStatus()));

        long confirmedCount = 0;
        long maybeCount = 0;
        long notAttendingCount = 0;
        long notRespondedCount = 0;
        long reachedVenueCount = 0;
        long enRouteCount = 0;

        Map<String, Long> cityCounts = new HashMap<>();

        for (Participant p : participants) {
            String att = p.getAttendanceStatus().toLowerCase();
            switch (att) {
                case "confirmed" -> confirmedCount++;
                case "maybe" -> maybeCount++;
                case "not_attending" -> notAttendingCount++;
                case "not_responded" -> notRespondedCount++;
            }

            // Latest status check
            String status = latestStatusMap.get(p.getId());
            if (status == null) {
                status = att.equals("not_attending") ? "not_coming" : "registered";
            }

            if ("reached_venue".equalsIgnoreCase(status)) {
                reachedVenueCount++;
            } else if ("en_route".equalsIgnoreCase(status)) {
                enRouteCount++;
            }

            // City counting
            if (p.getCurrentCity() != null && !p.getCurrentCity().isBlank() && !att.equals("not_attending")) {
                cityCounts.put(p.getCurrentCity(), cityCounts.getOrDefault(p.getCurrentCity(), 0L) + 1);
            }
        }

        Map<String, Long> attendanceSummary = new HashMap<>();
        attendanceSummary.put("totalRegistered", (long) participants.size());
        attendanceSummary.put("confirmed", confirmedCount);
        attendanceSummary.put("maybe", maybeCount);
        attendanceSummary.put("notAttending", notAttendingCount);
        attendanceSummary.put("notResponded", notRespondedCount);
        attendanceSummary.put("reachedVenue", reachedVenueCount);
        attendanceSummary.put("enRoute", enRouteCount);

        // 2. Travel Mode counting
        Map<String, Long> travelModeSummary = new HashMap<>();
        for (TravelPlan tp : travelPlans) {
            travelModeSummary.put(tp.getTravelMode(), travelModeSummary.getOrDefault(tp.getTravelMode(), 0L) + 1);
        }

        // 3. Arrival Timeline
        // Grouped by:
        // July 10 evening, July 10 night, July 11 early morning, July 11 morning, July 11 afternoon, Other/Not Scheduled
        Map<String, List<String>> arrivalTimeline = new LinkedHashMap<>();
        arrivalTimeline.put("July 10 evening", new ArrayList<>());
        arrivalTimeline.put("July 10 night", new ArrayList<>());
        arrivalTimeline.put("July 11 early morning", new ArrayList<>());
        arrivalTimeline.put("July 11 morning", new ArrayList<>());
        arrivalTimeline.put("July 11 afternoon", new ArrayList<>());
        arrivalTimeline.put("Other / Not Scheduled", new ArrayList<>());

        Map<String, String> participantNames = participants.stream()
                .collect(Collectors.toMap(Participant::getId, Participant::getFullName));

        for (TravelPlan tp : travelPlans) {
            String pName = participantNames.get(tp.getParticipantId());
            if (pName == null) continue;

            String date = tp.getExpectedArrivalDate();
            String time = tp.getExpectedArrivalTime();

            if (date == null || date.isBlank()) {
                arrivalTimeline.get("Other / Not Scheduled").add(pName);
                continue;
            }

            String dateLower = date.toLowerCase();
            String timeLower = time != null ? time.toLowerCase() : "";

            if (dateLower.contains("10") || dateLower.contains("july 10") || dateLower.contains("10 july")) {
                if (timeLower.contains("pm")) {
                    // check if night or evening
                    // simple check: if it contains 9, 10, 11, or 12 -> night
                    if (timeLower.contains("9:") || timeLower.contains("10:") || timeLower.contains("11:") || timeLower.contains("12:")) {
                        arrivalTimeline.get("July 10 night").add(pName);
                    } else {
                        arrivalTimeline.get("July 10 evening").add(pName);
                    }
                } else {
                    arrivalTimeline.get("July 10 evening").add(pName); // default morning arrival on 10th falls here or other
                }
            } else if (dateLower.contains("11") || dateLower.contains("july 11") || dateLower.contains("11 july")) {
                if (timeLower.contains("am")) {
                    // early morning is before 6 AM
                    if (timeLower.contains("12:") || timeLower.contains("1:") || timeLower.contains("2:") || timeLower.contains("3:") || timeLower.contains("4:") || timeLower.contains("5:")) {
                        arrivalTimeline.get("July 11 early morning").add(pName);
                    } else {
                        arrivalTimeline.get("July 11 morning").add(pName);
                    }
                } else {
                    // PM is afternoon
                    arrivalTimeline.get("July 11 afternoon").add(pName);
                }
            } else {
                arrivalTimeline.get("Other / Not Scheduled").add(pName);
            }
        }

        // Remove empty keys from timeline to keep it clean, or keep all
        
        // 4. Pending responses (attending but travel plan incomplete or not responded)
        Set<String> finishedTravelPlans = travelPlans.stream()
                .map(TravelPlan::getParticipantId)
                .collect(Collectors.toSet());

        List<PendingParticipantDto> pendingResponses = new ArrayList<>();
        for (Participant p : participants) {
            boolean isAttending = "confirmed".equalsIgnoreCase(p.getAttendanceStatus()) || "maybe".equalsIgnoreCase(p.getAttendanceStatus());
            boolean hasNoTravel = !finishedTravelPlans.contains(p.getId());
            boolean notResponded = "not_responded".equalsIgnoreCase(p.getAttendanceStatus());

            if (notResponded || (isAttending && hasNoTravel)) {
                pendingResponses.add(new PendingParticipantDto(
                        p.getId(),
                        p.getFullName(),
                        p.getCurrentCity(),
                        p.isShowPhone() ? p.getMobileNumber() : "[Hidden]",
                        p.isShowEmail() ? p.getEmail() : "[Hidden]",
                        p.isShowPhone(),
                        p.isShowEmail()
                ));
            }
        }

        return new DashboardDto(
                attendanceSummary,
                cityCounts,
                travelModeSummary,
                arrivalTimeline,
                pendingResponses
        );
    }
}
