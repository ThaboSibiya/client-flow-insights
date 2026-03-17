-- Add missing notification category columns to notification_preferences
ALTER TABLE public.notification_preferences
  ADD COLUMN IF NOT EXISTS customer_notifications boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS ticket_notifications boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS project_notifications boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS task_notifications boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS system_notifications boolean NOT NULL DEFAULT true;