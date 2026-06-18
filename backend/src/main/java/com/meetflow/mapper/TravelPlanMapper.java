package com.meetflow.mapper;

import com.meetflow.dto.TravelPlanDto;
import com.meetflow.model.TravelPlan;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TravelPlanMapper {
    TravelPlanDto toDto(TravelPlan travelPlan);
    TravelPlan toEntity(TravelPlanDto dto);
}
