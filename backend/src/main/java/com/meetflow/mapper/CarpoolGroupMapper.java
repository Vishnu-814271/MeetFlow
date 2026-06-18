package com.meetflow.mapper;

import com.meetflow.dto.CarpoolGroupDto;
import com.meetflow.model.CarpoolGroup;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CarpoolGroupMapper {
    CarpoolGroupDto toDto(CarpoolGroup carpoolGroup);
    CarpoolGroup toEntity(CarpoolGroupDto dto);
}
