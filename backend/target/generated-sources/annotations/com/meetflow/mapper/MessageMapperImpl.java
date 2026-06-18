package com.meetflow.mapper;

import com.meetflow.dto.MessageDto;
import com.meetflow.model.Message;
import java.time.LocalDateTime;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-18T17:34:03+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class MessageMapperImpl implements MessageMapper {

    @Override
    public MessageDto toDto(Message message) {
        if ( message == null ) {
            return null;
        }

        String id = null;
        String eventId = null;
        String postedBy = null;
        String messageText = null;
        String category = null;
        String visibilityType = null;
        String targetCity = null;
        String targetCarpoolGroupId = null;
        LocalDateTime createdAt = null;
        LocalDateTime updatedAt = null;

        id = message.getId();
        eventId = message.getEventId();
        postedBy = message.getPostedBy();
        messageText = message.getMessageText();
        category = message.getCategory();
        visibilityType = message.getVisibilityType();
        targetCity = message.getTargetCity();
        targetCarpoolGroupId = message.getTargetCarpoolGroupId();
        createdAt = message.getCreatedAt();
        updatedAt = message.getUpdatedAt();

        boolean isPinned = false;
        boolean isDeleted = false;

        MessageDto messageDto = new MessageDto( id, eventId, postedBy, messageText, category, visibilityType, targetCity, targetCarpoolGroupId, isPinned, isDeleted, createdAt, updatedAt );

        return messageDto;
    }

    @Override
    public Message toEntity(MessageDto dto) {
        if ( dto == null ) {
            return null;
        }

        Message.MessageBuilder message = Message.builder();

        message.id( dto.id() );
        message.eventId( dto.eventId() );
        message.postedBy( dto.postedBy() );
        message.messageText( dto.messageText() );
        message.category( dto.category() );
        message.visibilityType( dto.visibilityType() );
        message.targetCity( dto.targetCity() );
        message.targetCarpoolGroupId( dto.targetCarpoolGroupId() );
        message.isPinned( dto.isPinned() );
        message.isDeleted( dto.isDeleted() );
        message.createdAt( dto.createdAt() );
        message.updatedAt( dto.updatedAt() );

        return message.build();
    }
}
