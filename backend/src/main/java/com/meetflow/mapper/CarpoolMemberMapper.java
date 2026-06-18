package com.meetflow.mapper;

import com.meetflow.dto.CarpoolMemberDto;
import com.meetflow.model.CarpoolMember;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CarpoolMemberMapper {
    CarpoolMemberDto toDto(CarpoolMember carpoolMember);
    CarpoolMember toEntity(CarpoolMemberDto dto);
}
