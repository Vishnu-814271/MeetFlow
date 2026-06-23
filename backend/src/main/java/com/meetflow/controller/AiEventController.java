package com.meetflow.controller;

import com.meetflow.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class AiEventController {

    private final GeminiService geminiService;

    public record AiEventRequest(String prompt) {}

    @PostMapping(value = "/ai-generate", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> generateEventConfig(@RequestBody AiEventRequest request) {
        if (request.prompt() == null || request.prompt().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("{\"error\": \"Prompt cannot be empty.\"}");
        }
        String configJson = geminiService.generateEventConfig(request.prompt());
        return ResponseEntity.ok(configJson);
    }
}
