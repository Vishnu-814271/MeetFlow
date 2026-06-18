DELETE FROM messages;
DELETE FROM status_updates;
DELETE FROM audit_logs;
DELETE FROM carpool_members;
DELETE FROM carpool_groups;
DELETE FROM travel_plans;
DELETE FROM participants;
UPDATE events SET created_by = NULL;
