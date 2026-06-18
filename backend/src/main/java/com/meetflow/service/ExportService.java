package com.meetflow.service;

import com.meetflow.model.CarpoolGroup;
import com.meetflow.model.CarpoolMember;
import com.meetflow.model.Participant;
import com.meetflow.model.TravelPlan;
import com.meetflow.repository.CarpoolGroupRepository;
import com.meetflow.repository.CarpoolMemberRepository;
import com.meetflow.repository.ParticipantRepository;
import com.meetflow.repository.TravelPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExportService {
    private final ParticipantRepository participantRepository;
    private final TravelPlanRepository travelPlanRepository;
    private final CarpoolGroupRepository carpoolGroupRepository;
    private final CarpoolMemberRepository carpoolMemberRepository;

    @Transactional(readOnly = true)
    public String exportParticipantsCsv(String eventId) {
        List<Participant> participants = participantRepository.findByEventId(eventId);
        StringBuilder sb = new StringBuilder();
        sb.append("Full Name,Mobile Number,Email,Batch/Group,Current City,Attendance Status,Profile Status,Allow Contact\n");

        for (Participant p : participants) {
            String name = p.getFullName(); // Always visible unless system specifies otherwise, but showName is true
            String phone = p.isShowPhone() ? p.getMobileNumber() : "[Hidden]";
            String email = p.isShowEmail() && p.getEmail() != null ? p.getEmail() : "[Hidden]";
            
            sb.append(escapeCsv(name)).append(",")
              .append(escapeCsv(phone)).append(",")
              .append(escapeCsv(email)).append(",")
              .append(escapeCsv(p.getBatchOrGroup())).append(",")
              .append(escapeCsv(p.getCurrentCity())).append(",")
              .append(escapeCsv(p.getAttendanceStatus())).append(",")
              .append(escapeCsv(p.getProfileStatus())).append(",")
              .append(p.isAllowContact() ? "Yes" : "No").append("\n");
        }
        return sb.toString();
    }

    @Transactional(readOnly = true)
    public String exportTravelSummaryCsv(String eventId) {
        List<Participant> participants = participantRepository.findByEventId(eventId);
        Map<String, Participant> pMap = participants.stream()
                .collect(Collectors.toMap(Participant::getId, p -> p));

        List<TravelPlan> plans = travelPlanRepository.findByEventId(eventId);
        StringBuilder sb = new StringBuilder();
        sb.append("Participant Name,Origin City,Origin Area,Travel Mode,Departure,Arrival,Return,Co-travellers,Notes\n");

        for (TravelPlan tp : plans) {
            Participant p = pMap.get(tp.getParticipantId());
            if (p == null || "not_attending".equalsIgnoreCase(p.getAttendanceStatus())) continue;

            String name = p.getFullName();
            String city = p.isShowTravelDetails() ? tp.getOriginCity() : "[Hidden]";
            String area = p.isShowTravelDetails() ? tp.getOriginArea() : "[Hidden]";
            String mode = p.isShowTravelDetails() ? tp.getTravelMode() : "[Hidden]";
            String departure = p.isShowTravelDetails() ? (tp.getDepartureDate() + " " + tp.getDepartureTime()) : "[Hidden]";
            String arrival = p.isShowTravelDetails() ? (tp.getExpectedArrivalDate() + " " + tp.getExpectedArrivalTime()) : "[Hidden]";
            String retVal = p.isShowTravelDetails() ? (tp.getReturnDate() + " " + tp.getReturnTime()) : "[Hidden]";
            String count = p.isShowTravelDetails() ? String.valueOf(tp.getPeopleCount()) : "[Hidden]";
            String note = p.isShowTravelDetails() ? tp.getTravelNote() : "[Hidden]";

            sb.append(escapeCsv(name)).append(",")
              .append(escapeCsv(city)).append(",")
              .append(escapeCsv(area)).append(",")
              .append(escapeCsv(mode)).append(",")
              .append(escapeCsv(departure)).append(",")
              .append(escapeCsv(arrival)).append(",")
              .append(escapeCsv(retVal)).append(",")
              .append(escapeCsv(count)).append(",")
              .append(escapeCsv(note)).append("\n");
        }
        return sb.toString();
    }

    @Transactional(readOnly = true)
    public String exportCarpoolsCsv(String eventId) {
        List<CarpoolGroup> groups = carpoolGroupRepository.findByEventId(eventId);
        List<Participant> participants = participantRepository.findByEventId(eventId);
        Map<String, Participant> pMap = participants.stream()
                .collect(Collectors.toMap(Participant::getId, p -> p));

        StringBuilder sb = new StringBuilder();
        sb.append("Group Title,Origin City,Origin Area,Driver Name,Driver Contact,Vehicle,Departure,Seats Available,Seats Taken,Status,Notes\n");

        for (CarpoolGroup cg : groups) {
            Participant driver = pMap.get(cg.getDriverParticipantId());
            String driverName = driver != null ? driver.getFullName() : "Unknown";
            String driverContact = driver != null && driver.isShowPhone() ? driver.getMobileNumber() : "[Hidden]";

            List<CarpoolMember> members = carpoolMemberRepository.findByCarpoolGroupIdAndStatus(cg.getId(), "active");
            long taken = members.stream().filter(m -> "passenger".equalsIgnoreCase(m.getRole())).count();

            sb.append(escapeCsv(cg.getTitle())).append(",")
              .append(escapeCsv(cg.getOriginCity())).append(",")
              .append(escapeCsv(cg.getOriginArea())).append(",")
              .append(escapeCsv(driverName)).append(",")
              .append(escapeCsv(driverContact)).append(",")
              .append(escapeCsv(cg.getVehicleType())).append(",")
              .append(escapeCsv(cg.getDepartureDate() + " " + cg.getDepartureTime())).append(",")
              .append(cg.getSeatsAvailable()).append(",")
              .append(taken).append(",")
              .append(escapeCsv(cg.getStatus())).append(",")
              .append(escapeCsv(cg.getPickupNotes())).append("\n");
        }
        return sb.toString();
    }

    private String escapeCsv(String val) {
        if (val == null) return "";
        String clean = val.replace("\"", "\"\"");
        if (clean.contains(",") || clean.contains("\n") || clean.contains("\"")) {
            return "\"" + clean + "\"";
        }
        return clean;
    }
}
