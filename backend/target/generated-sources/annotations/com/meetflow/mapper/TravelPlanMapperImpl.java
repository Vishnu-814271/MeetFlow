package com.meetflow.mapper;

import com.meetflow.dto.TravelPlanDto;
import com.meetflow.model.TravelPlan;
import java.time.LocalDateTime;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-18T17:34:03+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class TravelPlanMapperImpl implements TravelPlanMapper {

    @Override
    public TravelPlanDto toDto(TravelPlan travelPlan) {
        if ( travelPlan == null ) {
            return null;
        }

        String id = null;
        String eventId = null;
        String participantId = null;
        String originCity = null;
        String originArea = null;
        String googleMapsLink = null;
        String travelMode = null;
        String departureDate = null;
        String departureTime = null;
        String expectedArrivalDate = null;
        String expectedArrivalTime = null;
        String returnDate = null;
        String returnTime = null;
        int peopleCount = 0;
        int luggageCount = 0;
        String travelNote = null;
        LocalDateTime createdAt = null;
        LocalDateTime updatedAt = null;

        id = travelPlan.getId();
        eventId = travelPlan.getEventId();
        participantId = travelPlan.getParticipantId();
        originCity = travelPlan.getOriginCity();
        originArea = travelPlan.getOriginArea();
        googleMapsLink = travelPlan.getGoogleMapsLink();
        travelMode = travelPlan.getTravelMode();
        departureDate = travelPlan.getDepartureDate();
        departureTime = travelPlan.getDepartureTime();
        expectedArrivalDate = travelPlan.getExpectedArrivalDate();
        expectedArrivalTime = travelPlan.getExpectedArrivalTime();
        returnDate = travelPlan.getReturnDate();
        returnTime = travelPlan.getReturnTime();
        peopleCount = travelPlan.getPeopleCount();
        luggageCount = travelPlan.getLuggageCount();
        travelNote = travelPlan.getTravelNote();
        createdAt = travelPlan.getCreatedAt();
        updatedAt = travelPlan.getUpdatedAt();

        TravelPlanDto travelPlanDto = new TravelPlanDto( id, eventId, participantId, originCity, originArea, googleMapsLink, travelMode, departureDate, departureTime, expectedArrivalDate, expectedArrivalTime, returnDate, returnTime, peopleCount, luggageCount, travelNote, createdAt, updatedAt );

        return travelPlanDto;
    }

    @Override
    public TravelPlan toEntity(TravelPlanDto dto) {
        if ( dto == null ) {
            return null;
        }

        TravelPlan.TravelPlanBuilder travelPlan = TravelPlan.builder();

        travelPlan.id( dto.id() );
        travelPlan.eventId( dto.eventId() );
        travelPlan.participantId( dto.participantId() );
        travelPlan.originCity( dto.originCity() );
        travelPlan.originArea( dto.originArea() );
        travelPlan.googleMapsLink( dto.googleMapsLink() );
        travelPlan.travelMode( dto.travelMode() );
        travelPlan.departureDate( dto.departureDate() );
        travelPlan.departureTime( dto.departureTime() );
        travelPlan.expectedArrivalDate( dto.expectedArrivalDate() );
        travelPlan.expectedArrivalTime( dto.expectedArrivalTime() );
        travelPlan.returnDate( dto.returnDate() );
        travelPlan.returnTime( dto.returnTime() );
        travelPlan.peopleCount( dto.peopleCount() );
        travelPlan.luggageCount( dto.luggageCount() );
        travelPlan.travelNote( dto.travelNote() );
        travelPlan.createdAt( dto.createdAt() );
        travelPlan.updatedAt( dto.updatedAt() );

        return travelPlan.build();
    }
}
