package com.meetflow.mapper;

import com.meetflow.dto.StatusUpdateDto;
import com.meetflow.model.StatusUpdate;
import java.time.LocalDateTime;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-18T17:34:03+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class StatusUpdateMapperImpl implements StatusUpdateMapper {

    @Override
    public StatusUpdateDto toDto(StatusUpdate statusUpdate) {
        if ( statusUpdate == null ) {
            return null;
        }

        String id = null;
        String eventId = null;
        String participantId = null;
        String status = null;
        String markedBy = null;
        String note = null;
        LocalDateTime createdAt = null;

        id = statusUpdate.getId();
        eventId = statusUpdate.getEventId();
        participantId = statusUpdate.getParticipantId();
        status = statusUpdate.getStatus();
        markedBy = statusUpdate.getMarkedBy();
        note = statusUpdate.getNote();
        createdAt = statusUpdate.getCreatedAt();

        StatusUpdateDto statusUpdateDto = new StatusUpdateDto( id, eventId, participantId, status, markedBy, note, createdAt );

        return statusUpdateDto;
    }

    @Override
    public StatusUpdate toEntity(StatusUpdateDto dto) {
        if ( dto == null ) {
            return null;
        }

        StatusUpdate.StatusUpdateBuilder statusUpdate = StatusUpdate.builder();

        statusUpdate.id( dto.id() );
        statusUpdate.eventId( dto.eventId() );
        statusUpdate.participantId( dto.participantId() );
        statusUpdate.status( dto.status() );
        statusUpdate.markedBy( dto.markedBy() );
        statusUpdate.note( dto.note() );
        statusUpdate.createdAt( dto.createdAt() );

        return statusUpdate.build();
    }
}
