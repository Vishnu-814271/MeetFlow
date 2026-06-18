package com.meetflow.controller;

import com.meetflow.service.ExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events/{eventId}/export")
@RequiredArgsConstructor
public class ExportController {
    private final ExportService exportService;

    @GetMapping("/participants")
    public ResponseEntity<byte[]> exportParticipants(@PathVariable String eventId) {
        String csv = exportService.exportParticipantsCsv(eventId);
        byte[] data = csv.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return createCsvResponse(data, "participants.csv");
    }

    @GetMapping("/travel")
    public ResponseEntity<byte[]> exportTravel(@PathVariable String eventId) {
        String csv = exportService.exportTravelSummaryCsv(eventId);
        byte[] data = csv.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return createCsvResponse(data, "travel-summary.csv");
    }

    @GetMapping("/carpools")
    public ResponseEntity<byte[]> exportCarpools(@PathVariable String eventId) {
        String csv = exportService.exportCarpoolsCsv(eventId);
        byte[] data = csv.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return createCsvResponse(data, "carpool-groups.csv");
    }

    private ResponseEntity<byte[]> createCsvResponse(byte[] data, String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", filename);
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }
}
