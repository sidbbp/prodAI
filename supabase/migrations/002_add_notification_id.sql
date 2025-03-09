-- Add notification_id column to reminders table
ALTER TABLE reminders ADD COLUMN notification_id TEXT;

-- Update types
ALTER TABLE reminders ALTER COLUMN notification_method SET DEFAULT ARRAY['push']; 