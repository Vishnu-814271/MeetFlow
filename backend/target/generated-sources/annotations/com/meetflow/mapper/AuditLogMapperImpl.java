package com.meetflow.mapper;

import com.meetflow.dto.AuditLogDto;
import com.meetflow.model.AuditLog;
import java.time.LocalDateTime;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-18T17:34:03+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class AuditLogMapperImpl implements AuditLogMapper {

    @Override
    public AuditLogDto toDto(AuditLog auditLog) {
        if ( auditLog == null ) {
            return null;
        }

        String id = null;
        String eventId = null;
        String actorParticipantId = null;
        String actionType = null;
        String entityType = null;
        String entityId = null;
        String oldValue = null;
        String newValue = null;
        LocalDateTime createdAt = null;

        id = auditLog.getId();
        eventId = auditLog.getEventId();
        actorParticipantId = auditLog.getActorParticipantId();
        actionType = auditLog.getActionType();
        entityType = auditLog.getEntityType();
        entityId = auditLog.getEntityId();
        oldValue = auditLog.getOldValue();
        newValue = auditLog.getNewValue();
        createdAt = auditLog.getCreatedAt();

        AuditLogDto auditLogDto = new AuditLogDto( id, eventId, actorParticipantId, actionType, entityType, entityId, oldValue, newValue, createdAt );

        return auditLogDto;
    }

    @Override
    public AuditLog toEntity(AuditLogDto dto) {
        if ( dto == null ) {
            return null;
        }

        AuditLog.AuditLogBuilder auditLog = AuditLog.builder();

        auditLog.id( dto.id() );
        auditLog.eventId( dto.eventId() );
        auditLog.actorParticipantId( dto.actorParticipantId() );
        auditLog.actionType( dto.actionType() );
        auditLog.entityType( dto.entityType() );
        auditLog.entityId( dto.entityId() );
        auditLog.oldValue( dto.oldValue() );
        auditLog.newValue( dto.newValue() );
        auditLog.createdAt( dto.createdAt() );

        return auditLog.build();
    }
}
