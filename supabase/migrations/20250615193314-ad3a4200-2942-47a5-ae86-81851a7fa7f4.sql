
-- Create table to store company-wide settings
CREATE TABLE public.company_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add comment on table
COMMENT ON TABLE public.company_settings IS 'Stores key-value pairs for company-wide application settings.';

-- Enable RLS
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read settings
CREATE POLICY "Allow authenticated read access to settings"
  ON public.company_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to create settings
CREATE POLICY "Allow authenticated insert access to settings"
  ON public.company_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update settings
CREATE POLICY "Allow authenticated update access to settings"
  ON public.company_settings
  FOR UPDATE
  TO authenticated
  USING (true);

