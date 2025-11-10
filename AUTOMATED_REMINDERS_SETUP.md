# Automated Reminder Scheduler Setup

This document explains how to set up the automated reminder scheduler that runs daily.

## Prerequisites

The `finance-auto-reminder-scheduler` edge function has been created and will be automatically deployed.

## Setting Up the Cron Job

To enable automated reminders, you need to set up a cron job in your Supabase database. This job will run daily at midnight (00:00) to check for overdue invoices and send reminders.

### Step 1: Enable Required Extensions

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### Step 2: Create the Cron Job

Run this SQL to schedule the automated reminder function to run daily at midnight:

```sql
-- Schedule the automated reminder function to run daily at midnight
SELECT cron.schedule(
  'daily-finance-reminder-scheduler',
  '0 0 * * *', -- Every day at midnight (00:00)
  $$
  SELECT
    net.http_post(
        url:='https://oquiaxbnkdnpixqhqdfq.supabase.co/functions/v1/finance-auto-reminder-scheduler',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xdWlheGJua2RucGl4cWhxZGZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NTcyOTYsImV4cCI6MjA2MjEzMzI5Nn0.K6OhS4jbjR-2MnMGPKym6VynV3zFI0bC0QbVMURLwg4"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
```

### Step 3: Verify the Cron Job

Check that the cron job was created successfully:

```sql
SELECT * FROM cron.job WHERE jobname = 'daily-finance-reminder-scheduler';
```

### Managing the Cron Job

**To disable the automated reminders:**
```sql
SELECT cron.unschedule('daily-finance-reminder-scheduler');
```

**To re-enable (run the schedule command from Step 2 again)**

**To view cron job history:**
```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-finance-reminder-scheduler')
ORDER BY start_time DESC 
LIMIT 10;
```

## Testing the Automation

You can test the automation manually from the Finance page:

1. Go to Finance > Send Reminders tab
2. Scroll to "Automated Reminder Settings"
3. Click "Test Now" button

This will run the scheduler immediately and show you the results.

## How It Works

The automated scheduler:

1. Runs daily at midnight
2. Checks all overdue invoices
3. Calculates days overdue for each invoice
4. Sends reminders based on configured intervals:
   - **7 days overdue**: First friendly reminder
   - **14 days overdue**: Overdue payment notice  
   - **30+ days overdue**: Final notice before collection
5. Ensures only one reminder per stage is sent within a 7-day period
6. Logs all sent reminders in the `reminder_history` table

## Customizing Intervals

Users can customize the reminder intervals from the Finance page under "Automated Reminder Settings".

## Troubleshooting

If reminders are not being sent:

1. Check that the cron job is running:
   ```sql
   SELECT * FROM cron.job_run_details 
   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-finance-reminder-scheduler')
   ORDER BY start_time DESC LIMIT 5;
   ```

2. Check for errors in the edge function logs at:
   https://supabase.com/dashboard/project/oquiaxbnkdnpixqhqdfq/functions/finance-auto-reminder-scheduler/logs

3. Verify the RESEND_API_KEY secret is set correctly

4. Test manually using the "Test Now" button in the UI
