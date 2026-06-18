package com.meetflow.mapper;

import com.meetflow.dto.StatusUpdateDto;
import com.meetflow.model.StatusUpdate;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface StatusUpdateMapper {
    StatusUpdateDto toDto(StatusUpdate statusUpdate);
    StatusUpdate toEntity(StatusUpdateDto dto);
}
