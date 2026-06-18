package com.meetflow.mapper;

import com.meetflow.dto.EventDto;
import com.meetflow.model.Event;
import java.time.LocalDateTime;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-18T17:34:03+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class EventMapperImpl implements EventMapper {

    @Override
    public EventDto toDto(Event event) {
        if ( event == null ) {
            return null;
        }

        String id = null;
        String eventName = null;
        String eventSlug = null;
        String eventCode = null;
        String description = null;
        String venueName = null;
        String venueAddress = null;
        String venueGoogleMapUrl = null;
        LocalDateTime startDatetime = null;
        LocalDateTime endDatetime = null;
        String createdBy = null;
        LocalDateTime createdAt = null;
        LocalDateTime updatedAt = null;

        id = event.getId();
        eventName = event.getEventName();
        eventSlug = event.getEventSlug();
        eventCode = event.getEventCode();
        description = event.getDescription();
        venueName = event.getVenueName();
        venueAddress = event.getVenueAddress();
        venueGoogleMapUrl = event.getVenueGoogleMapUrl();
        startDatetime = event.getStartDatetime();
        endDatetime = event.getEndDatetime();
        createdBy = event.getCreatedBy();
        createdAt = event.getCreatedAt();
        updatedAt = event.getUpdatedAt();

        EventDto eventDto = new EventDto( id, eventName, eventSlug, eventCode, description, venueName, venueAddress, venueGoogleMapUrl, startDatetime, endDatetime, createdBy, createdAt, updatedAt );

        return eventDto;
    }

    @Override
    public Event toEntity(EventDto dto) {
        if ( dto == null ) {
            return null;
        }

        Event.EventBuilder event = Event.builder();

        event.id( dto.id() );
        event.eventName( dto.eventName() );
        event.eventSlug( dto.eventSlug() );
        event.eventCode( dto.eventCode() );
        event.description( dto.description() );
        event.venueName( dto.venueName() );
        event.venueAddress( dto.venueAddress() );
        event.venueGoogleMapUrl( dto.venueGoogleMapUrl() );
        event.startDatetime( dto.startDatetime() );
        event.endDatetime( dto.endDatetime() );
        event.createdBy( dto.createdBy() );
        event.createdAt( dto.createdAt() );
        event.updatedAt( dto.updatedAt() );

        return event.build();
    }
}
