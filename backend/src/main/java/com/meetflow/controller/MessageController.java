package com.meetflow.controller;

import com.meetflow.dto.MessageDto;
import com.meetflow.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class MessageController {
    private final MessageService messageService;

    @GetMapping("/api/events/{eventId}/messages")
    public ResponseEntity<List<MessageDto>> getMessages(@PathVariable String eventId) {
        return ResponseEntity.ok(messageService.getActiveMessagesByEventId(eventId));
    }

    @PostMapping("/api/messages")
    public ResponseEntity<MessageDto> createMessage(@RequestBody MessageDto dto) {
        return ResponseEntity.ok(messageService.createMessage(dto));
    }

    @DeleteMapping("/api/messages/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable String id) {
        messageService.deleteMessage(id);
        return ResponseEntity.noContent().build();
    }
}
