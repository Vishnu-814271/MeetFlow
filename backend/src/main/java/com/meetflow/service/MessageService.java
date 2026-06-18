package com.meetflow.service;

import com.meetflow.dto.MessageDto;
import com.meetflow.exception.ResourceNotFoundException;
import com.meetflow.mapper.MessageMapper;
import com.meetflow.model.Message;
import com.meetflow.model.Participant;
import com.meetflow.repository.MessageRepository;
import com.meetflow.repository.ParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final ParticipantRepository participantRepository;
    private final MessageMapper messageMapper;

    @Transactional(readOnly = true)
    public List<MessageDto> getActiveMessagesByEventId(String eventId) {
        return messageRepository.findByEventIdAndIsDeletedFalseOrderByCreatedAtDesc(eventId).stream()
                .map(messageMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageDto createMessage(MessageDto dto) {
        Participant participant = participantRepository.findById(dto.postedBy())
                .orElseThrow(() -> new ResourceNotFoundException("Poster participant not found: " + dto.postedBy()));

        Message message = messageMapper.toEntity(dto);
        if (message.getId() == null) {
            message.setId(UUID.randomUUID().toString());
        }
        // Force fields
        message.setDeleted(false);
        if (dto.category().equalsIgnoreCase("announcement")) {
            message.setPinned(true); // Announcements are default pinned
        }
        Message saved = messageRepository.save(message);
        return messageMapper.toDto(saved);
    }

    @Transactional
    public void deleteMessage(String id) {
        Message message = messageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found: " + id));
        message.setDeleted(true);
        messageRepository.save(message);
    }
}
