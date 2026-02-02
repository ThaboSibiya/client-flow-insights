-- Create enum for integration types
CREATE TYPE public.integration_platform AS ENUM ('zapier', 'make', 'n8n', 'custom');
CREATE TYPE public.sync_direction AS ENUM ('push', 'pull', 'bidirectional');
CREATE TYPE public.sync_frequency AS ENUM ('real-time', 'hourly', 'daily', 'manual');
CREATE TYPE public.integration_status AS ENUM ('active', 'inactive', 'error', 'syncing');

-- Webhook Connections table (Zapier/Make/N8N)
CREATE TABLE public.webhook_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platform integration_platform NOT NULL DEFAULT 'zapier',
  webhook_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  trigger_count INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  connected_apps TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- API Triggers table (Custom endpoints)
CREATE TABLE public.api_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  endpoint_key TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  method TEXT NOT NULL DEFAULT 'POST',
  auth_type TEXT NOT NULL DEFAULT 'bearer',
  description TEXT,
  sample_payload JSONB,
  is_active BOOLEAN DEFAULT true,
  trigger_count INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Data Sync Rules table
CREATE TABLE public.data_sync_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  source_system TEXT NOT NULL,
  target_system TEXT NOT NULL,
  data_type TEXT NOT NULL,
  sync_direction sync_direction NOT NULL DEFAULT 'bidirectional',
  frequency sync_frequency NOT NULL DEFAULT 'real-time',
  is_active BOOLEAN DEFAULT true,
  status integration_status DEFAULT 'active',
  sync_count INTEGER DEFAULT 0,
  last_sync_at TIMESTAMPTZ,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Webhook Logs table (for tracking webhook deliveries)
CREATE TABLE public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES public.webhook_connections(id) ON DELETE SET NULL,
  trigger_id UUID REFERENCES public.api_triggers(id) ON DELETE SET NULL,
  request_method TEXT,
  request_payload JSONB,
  response_status INTEGER,
  response_body TEXT,
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webhook_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sync_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for webhook_connections
CREATE POLICY "Users can view their own webhook connections"
ON public.webhook_connections FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own webhook connections"
ON public.webhook_connections FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own webhook connections"
ON public.webhook_connections FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own webhook connections"
ON public.webhook_connections FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for api_triggers
CREATE POLICY "Users can view their own API triggers"
ON public.api_triggers FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own API triggers"
ON public.api_triggers FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API triggers"
ON public.api_triggers FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API triggers"
ON public.api_triggers FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for data_sync_rules
CREATE POLICY "Users can view their own sync rules"
ON public.data_sync_rules FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sync rules"
ON public.data_sync_rules FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sync rules"
ON public.data_sync_rules FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sync rules"
ON public.data_sync_rules FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for webhook_logs
CREATE POLICY "Users can view their own webhook logs"
ON public.webhook_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own webhook logs"
ON public.webhook_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_webhook_connections_user_id ON public.webhook_connections(user_id);
CREATE INDEX idx_api_triggers_user_id ON public.api_triggers(user_id);
CREATE INDEX idx_api_triggers_endpoint_key ON public.api_triggers(endpoint_key);
CREATE INDEX idx_data_sync_rules_user_id ON public.data_sync_rules(user_id);
CREATE INDEX idx_webhook_logs_user_id ON public.webhook_logs(user_id);
CREATE INDEX idx_webhook_logs_created_at ON public.webhook_logs(created_at DESC);

-- Update trigger for updated_at
CREATE TRIGGER update_webhook_connections_updated_at
  BEFORE UPDATE ON public.webhook_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_api_triggers_updated_at
  BEFORE UPDATE ON public.api_triggers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_data_sync_rules_updated_at
  BEFORE UPDATE ON public.data_sync_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();