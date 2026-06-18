package com.meetflow.mapper;

import com.meetflow.dto.EventDto;
import com.meetflow.model.Event;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface EventMapper {
    EventDto toDto(Event event);
    Event toEntity(EventDto dto);
}
