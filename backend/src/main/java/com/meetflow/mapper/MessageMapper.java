package com.meetflow.mapper;

import com.meetflow.dto.MessageDto;
import com.meetflow.model.Message;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MessageMapper {
    MessageDto toDto(Message message);
    Message toEntity(MessageDto dto);
}
