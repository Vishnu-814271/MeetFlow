-- Tracks which travel plans have had departure reminder notifications sent
-- to prevent duplicate WhatsApp/email sends on repeated scheduler fires.
CREATE TABLE notification_logs (
    id VARCHAR(36) PRIMARY KEY,
    travel_plan_id VARCHAR(36) NOT NULL UNIQUE,
    participant_id VARCHAR(36) NOT NULL,
    email_sent BOOLEAN NOT NULL DEFAULT FALSE,
    whatsapp_sent BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at TIMESTAMP NOT NULL,
    FOREIGN KEY (travel_plan_id) REFERENCES travel_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
);
