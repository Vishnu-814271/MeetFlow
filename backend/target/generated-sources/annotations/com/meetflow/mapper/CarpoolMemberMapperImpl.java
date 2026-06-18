package com.meetflow.mapper;

import com.meetflow.dto.CarpoolMemberDto;
import com.meetflow.model.CarpoolMember;
import java.time.LocalDateTime;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-18T17:34:03+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class CarpoolMemberMapperImpl implements CarpoolMemberMapper {

    @Override
    public CarpoolMemberDto toDto(CarpoolMember carpoolMember) {
        if ( carpoolMember == null ) {
            return null;
        }

        String id = null;
        String carpoolGroupId = null;
        String participantId = null;
        String role = null;
        LocalDateTime joinedAt = null;
        String status = null;

        id = carpoolMember.getId();
        carpoolGroupId = carpoolMember.getCarpoolGroupId();
        participantId = carpoolMember.getParticipantId();
        role = carpoolMember.getRole();
        joinedAt = carpoolMember.getJoinedAt();
        status = carpoolMember.getStatus();

        CarpoolMemberDto carpoolMemberDto = new CarpoolMemberDto( id, carpoolGroupId, participantId, role, joinedAt, status );

        return carpoolMemberDto;
    }

    @Override
    public CarpoolMember toEntity(CarpoolMemberDto dto) {
        if ( dto == null ) {
            return null;
        }

        CarpoolMember.CarpoolMemberBuilder carpoolMember = CarpoolMember.builder();

        carpoolMember.id( dto.id() );
        carpoolMember.carpoolGroupId( dto.carpoolGroupId() );
        carpoolMember.participantId( dto.participantId() );
        carpoolMember.role( dto.role() );
        carpoolMember.joinedAt( dto.joinedAt() );
        carpoolMember.status( dto.status() );

        return carpoolMember.build();
    }
}
