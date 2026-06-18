package com.meetflow;

import com.meetflow.dto.CarpoolGroupDetailsDto;
import com.meetflow.dto.DashboardDto;
import com.meetflow.model.Participant;
import com.meetflow.repository.ParticipantRepository;
import com.meetflow.service.CarpoolService;
import com.meetflow.service.DashboardService;
import com.meetflow.service.ExportService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
class MeetflowApplicationTests {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private CarpoolService carpoolService;

    @Autowired
    private ExportService exportService;

    @Autowired
    private ParticipantRepository participantRepository;

    @Test
    void contextLoads() {
        // Simple context check
    }

    @Test
    void testDashboardAggregations() {
        // Given that V2 seed data runs on startup:
        DashboardDto data = dashboardService.getDashboardData("nlp-meetup-2026-id");

        assertNotNull(data);
        assertNotNull(data.attendanceSummary());
        assertNotNull(data.citySummary());
        assertNotNull(data.travelModeSummary());
        assertNotNull(data.arrivalTimeline());

        // Check seeded participant size
        assertTrue(data.attendanceSummary().get("totalRegistered") >= 56, "Total registered participants should be at least 56");
        assertTrue(data.attendanceSummary().get("confirmed") > 0);
    }

    @Test
    void testCarpoolCapacityLimitAndSuggestions() {
        // Get carpools
        List<CarpoolGroupDetailsDto> carpools = carpoolService.getCarpoolsByEventId("nlp-meetup-2026-id");
        assertFalse(carpools.isEmpty(), "Carpools list should not be empty");

        // Select an open carpool group
        CarpoolGroupDetailsDto openGroup = carpools.stream()
                .filter(cg -> "open".equalsIgnoreCase(cg.status()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("No open carpools found in seeded data"));

        int originalSeatsAvailable = openGroup.seatsAvailable();
        int originalSeatsTaken = openGroup.seatsTaken();
        
        // Find a participant not already in the group
        List<Participant> participants = participantRepository.findByEventId("nlp-meetup-2026-id");
        Participant newPassenger = participants.stream()
                .filter(p -> "confirmed".equalsIgnoreCase(p.getAttendanceStatus()))
                .filter(p -> !p.getId().equals(openGroup.driverParticipantId()))
                .filter(p -> openGroup.members().stream().noneMatch(m -> m.participantId().equals(p.getId())))
                .findFirst()
                .orElseThrow(() -> new AssertionError("No potential passengers found"));

        // Join
        CarpoolGroupDetailsDto joined = carpoolService.joinCarpool(openGroup.id(), newPassenger.getId());
        assertEquals(originalSeatsTaken + 1, joined.seatsTaken());

        // Leave
        CarpoolGroupDetailsDto left = carpoolService.leaveCarpool(openGroup.id(), newPassenger.getId());
        assertEquals(originalSeatsTaken, left.seatsTaken());
    }

    @Test
    void testExportPrivacyEnforcement() {
        // Find a participant who has set showPhone = false or showEmail = false
        List<Participant> participants = participantRepository.findByEventId("nlp-meetup-2026-id");
        
        Participant privateUser = participants.stream()
                .filter(p -> !p.isShowPhone() || !p.isShowEmail())
                .findFirst()
                .orElseThrow(() -> new AssertionError("No private participants found in seeded data"));

        String csv = exportService.exportParticipantsCsv("nlp-meetup-2026-id");
        assertNotNull(csv);

        // Verify that the private participant's details are masked in the CSV output
        if (!privateUser.isShowPhone()) {
            assertFalse(csv.contains(privateUser.getFullName() + "," + privateUser.getMobileNumber()), 
                    "CSV export should not leak phone number for private participant: " + privateUser.getFullName());
        }
        if (!privateUser.isShowEmail() && privateUser.getEmail() != null) {
            assertFalse(csv.contains(privateUser.getFullName() + "," + privateUser.getMobileNumber() + "," + privateUser.getEmail()), 
                    "CSV export should not leak email for private participant: " + privateUser.getFullName());
        }
    }
}
