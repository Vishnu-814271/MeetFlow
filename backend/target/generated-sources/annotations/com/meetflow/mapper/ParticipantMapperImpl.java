package com.meetflow.mapper;

import com.meetflow.dto.ParticipantDto;
import com.meetflow.model.Participant;
import java.time.LocalDateTime;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-18T17:34:03+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class ParticipantMapperImpl implements ParticipantMapper {

    @Override
    public ParticipantDto toDto(Participant participant) {
        if ( participant == null ) {
            return null;
        }

        String id = null;
        String eventId = null;
        String fullName = null;
        String mobileNumber = null;
        String email = null;
        String batchOrGroup = null;
        String currentCity = null;
        String attendanceStatus = null;
        String profileStatus = null;
        boolean showName = false;
        boolean showPhone = false;
        boolean showEmail = false;
        boolean showTravelDetails = false;
        boolean allowContact = false;
        LocalDateTime createdAt = null;
        LocalDateTime updatedAt = null;

        id = participant.getId();
        eventId = participant.getEventId();
        fullName = participant.getFullName();
        mobileNumber = participant.getMobileNumber();
        email = participant.getEmail();
        batchOrGroup = participant.getBatchOrGroup();
        currentCity = participant.getCurrentCity();
        attendanceStatus = participant.getAttendanceStatus();
        profileStatus = participant.getProfileStatus();
        showName = participant.isShowName();
        showPhone = participant.isShowPhone();
        showEmail = participant.isShowEmail();
        showTravelDetails = participant.isShowTravelDetails();
        allowContact = participant.isAllowContact();
        createdAt = participant.getCreatedAt();
        updatedAt = participant.getUpdatedAt();

        ParticipantDto participantDto = new ParticipantDto( id, eventId, fullName, mobileNumber, email, batchOrGroup, currentCity, attendanceStatus, profileStatus, showName, showPhone, showEmail, showTravelDetails, allowContact, createdAt, updatedAt );

        return participantDto;
    }

    @Override
    public Participant toEntity(ParticipantDto dto) {
        if ( dto == null ) {
            return null;
        }

        Participant.ParticipantBuilder participant = Participant.builder();

        participant.id( dto.id() );
        participant.eventId( dto.eventId() );
        participant.fullName( dto.fullName() );
        participant.mobileNumber( dto.mobileNumber() );
        participant.email( dto.email() );
        participant.batchOrGroup( dto.batchOrGroup() );
        participant.currentCity( dto.currentCity() );
        participant.attendanceStatus( dto.attendanceStatus() );
        participant.profileStatus( dto.profileStatus() );
        participant.showName( dto.showName() );
        participant.showPhone( dto.showPhone() );
        participant.showEmail( dto.showEmail() );
        participant.showTravelDetails( dto.showTravelDetails() );
        participant.allowContact( dto.allowContact() );
        participant.createdAt( dto.createdAt() );
        participant.updatedAt( dto.updatedAt() );

        return participant.build();
    }
}
