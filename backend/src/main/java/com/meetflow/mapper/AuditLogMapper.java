package com.meetflow.mapper;

import com.meetflow.dto.AuditLogDto;
import com.meetflow.model.AuditLog;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AuditLogMapper {
    AuditLogDto toDto(AuditLog auditLog);
    AuditLog toEntity(AuditLogDto dto);
}
