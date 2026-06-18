package com.meetflow.mapper;

import com.meetflow.dto.CarpoolGroupDto;
import com.meetflow.model.CarpoolGroup;
import java.time.LocalDateTime;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-18T17:34:03+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class CarpoolGroupMapperImpl implements CarpoolGroupMapper {

    @Override
    public CarpoolGroupDto toDto(CarpoolGroup carpoolGroup) {
        if ( carpoolGroup == null ) {
            return null;
        }

        String id = null;
        String eventId = null;
        String title = null;
        String originCity = null;
        String originArea = null;
        String driverParticipantId = null;
        String vehicleType = null;
        String departureDate = null;
        String departureTime = null;
        int seatsAvailable = 0;
        String pickupNotes = null;
        String status = null;
        String createdBy = null;
        LocalDateTime createdAt = null;
        LocalDateTime updatedAt = null;

        id = carpoolGroup.getId();
        eventId = carpoolGroup.getEventId();
        title = carpoolGroup.getTitle();
        originCity = carpoolGroup.getOriginCity();
        originArea = carpoolGroup.getOriginArea();
        driverParticipantId = carpoolGroup.getDriverParticipantId();
        vehicleType = carpoolGroup.getVehicleType();
        departureDate = carpoolGroup.getDepartureDate();
        departureTime = carpoolGroup.getDepartureTime();
        seatsAvailable = carpoolGroup.getSeatsAvailable();
        pickupNotes = carpoolGroup.getPickupNotes();
        status = carpoolGroup.getStatus();
        createdBy = carpoolGroup.getCreatedBy();
        createdAt = carpoolGroup.getCreatedAt();
        updatedAt = carpoolGroup.getUpdatedAt();

        CarpoolGroupDto carpoolGroupDto = new CarpoolGroupDto( id, eventId, title, originCity, originArea, driverParticipantId, vehicleType, departureDate, departureTime, seatsAvailable, pickupNotes, status, createdBy, createdAt, updatedAt );

        return carpoolGroupDto;
    }

    @Override
    public CarpoolGroup toEntity(CarpoolGroupDto dto) {
        if ( dto == null ) {
            return null;
        }

        CarpoolGroup.CarpoolGroupBuilder carpoolGroup = CarpoolGroup.builder();

        carpoolGroup.id( dto.id() );
        carpoolGroup.eventId( dto.eventId() );
        carpoolGroup.title( dto.title() );
        carpoolGroup.originCity( dto.originCity() );
        carpoolGroup.originArea( dto.originArea() );
        carpoolGroup.driverParticipantId( dto.driverParticipantId() );
        carpoolGroup.vehicleType( dto.vehicleType() );
        carpoolGroup.departureDate( dto.departureDate() );
        carpoolGroup.departureTime( dto.departureTime() );
        carpoolGroup.seatsAvailable( dto.seatsAvailable() );
        carpoolGroup.pickupNotes( dto.pickupNotes() );
        carpoolGroup.status( dto.status() );
        carpoolGroup.createdBy( dto.createdBy() );
        carpoolGroup.createdAt( dto.createdAt() );
        carpoolGroup.updatedAt( dto.updatedAt() );

        return carpoolGroup.build();
    }
}
