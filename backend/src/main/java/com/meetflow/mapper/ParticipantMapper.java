package com.meetflow.mapper;

import com.meetflow.dto.ParticipantDto;
import com.meetflow.model.Participant;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ParticipantMapper {
    ParticipantDto toDto(Participant participant);
    Participant toEntity(ParticipantDto dto);
}
