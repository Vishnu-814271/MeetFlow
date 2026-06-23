CREATE TABLE organizations (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    org_type VARCHAR(50) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

ALTER TABLE events ADD COLUMN organization_id VARCHAR(36);
ALTER TABLE events ADD COLUMN features_config TEXT;
ALTER TABLE events ADD COLUMN registration_schema TEXT;
ALTER TABLE events ADD COLUMN roles_schema TEXT;
ALTER TABLE events ADD COLUMN dashboard_schema TEXT;

ALTER TABLE events ADD CONSTRAINT fk_events_organization FOREIGN KEY (organization_id) REFERENCES organizations(id);

ALTER TABLE participants ADD COLUMN custom_fields_data TEXT;
