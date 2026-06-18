CREATE TABLE events (
    id VARCHAR(36) PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    event_slug VARCHAR(255) NOT NULL UNIQUE,
    event_code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    venue_name VARCHAR(255),
    venue_address TEXT,
    venue_google_map_url TEXT,
    start_datetime TIMESTAMP,
    end_datetime TIMESTAMP,
    created_by VARCHAR(36),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE participants (
    id VARCHAR(36) PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    batch_or_group VARCHAR(255),
    current_city VARCHAR(255),
    attendance_status VARCHAR(50) NOT NULL,
    profile_status VARCHAR(50) NOT NULL,
    show_name BOOLEAN NOT NULL DEFAULT TRUE,
    show_phone BOOLEAN NOT NULL DEFAULT FALSE,
    show_email BOOLEAN NOT NULL DEFAULT FALSE,
    show_travel_details BOOLEAN NOT NULL DEFAULT TRUE,
    allow_contact BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (event_id) REFERENCES events(id)
);

CREATE TABLE travel_plans (
    id VARCHAR(36) PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL,
    participant_id VARCHAR(36) NOT NULL UNIQUE,
    origin_city VARCHAR(255) NOT NULL,
    origin_area VARCHAR(255),
    google_maps_link TEXT,
    travel_mode VARCHAR(50) NOT NULL,
    departure_date VARCHAR(50),
    departure_time VARCHAR(50),
    expected_arrival_date VARCHAR(50),
    expected_arrival_time VARCHAR(50),
    return_date VARCHAR(50),
    return_time VARCHAR(50),
    people_count INTEGER NOT NULL DEFAULT 1,
    luggage_count INTEGER DEFAULT 0,
    travel_note TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
);

CREATE TABLE carpool_groups (
    id VARCHAR(36) PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    origin_city VARCHAR(255) NOT NULL,
    origin_area VARCHAR(255),
    driver_participant_id VARCHAR(36) NOT NULL,
    vehicle_type VARCHAR(255),
    departure_date VARCHAR(50) NOT NULL,
    departure_time VARCHAR(50) NOT NULL,
    seats_available INTEGER NOT NULL,
    pickup_notes TEXT,
    status VARCHAR(50) NOT NULL,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (driver_participant_id) REFERENCES participants(id) ON DELETE CASCADE
);

CREATE TABLE carpool_members (
    id VARCHAR(36) PRIMARY KEY,
    carpool_group_id VARCHAR(36) NOT NULL,
    participant_id VARCHAR(36) NOT NULL,
    role VARCHAR(50) NOT NULL,
    joined_at TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL,
    FOREIGN KEY (carpool_group_id) REFERENCES carpool_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
    UNIQUE(carpool_group_id, participant_id)
);

CREATE TABLE messages (
    id VARCHAR(36) PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL,
    posted_by VARCHAR(36) NOT NULL,
    message_text TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    visibility_type VARCHAR(50) NOT NULL,
    target_city VARCHAR(255),
    target_carpool_group_id VARCHAR(36),
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (posted_by) REFERENCES participants(id) ON DELETE CASCADE
);

CREATE TABLE status_updates (
    id VARCHAR(36) PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL,
    participant_id VARCHAR(36) NOT NULL,
    status VARCHAR(50) NOT NULL,
    marked_by VARCHAR(255) NOT NULL,
    note TEXT,
    created_at TIMESTAMP NOT NULL,
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
);

CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL,
    actor_participant_id VARCHAR(36),
    action_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(36) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMP NOT NULL,
    FOREIGN KEY (event_id) REFERENCES events(id)
);
