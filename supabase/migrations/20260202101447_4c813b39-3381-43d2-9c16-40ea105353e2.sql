-- Pipeline stage type enum
CREATE TYPE public.pipeline_type AS ENUM ('customer', 'ticket');

-- Pipeline stages table for persisting stage configurations
CREATE TABLE public.pipeline_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pipeline_type pipeline_type NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6B7280',
  position INTEGER NOT NULL DEFAULT 0,
  target INTEGER,
  automation_enabled BOOLEAN NOT NULL DEFAULT false,
  status_mapping TEXT, -- Maps to customer/ticket status
  description TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Stage automations table
CREATE TABLE public.stage_automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stage_id UUID NOT NULL REFERENCES public.pipeline_stages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL DEFAULT 'on_entry', -- on_entry, on_exit, time_based
  trigger_config JSONB DEFAULT '{}',
  actions JSONB NOT NULL DEFAULT '[]',
  conditions JSONB DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  execution_count INTEGER NOT NULL DEFAULT 0,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Pipeline activity log for tracking changes
CREATE TABLE public.pipeline_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pipeline_type pipeline_type NOT NULL,
  entity_id UUID NOT NULL, -- customer_id or ticket_id
  entity_type TEXT NOT NULL, -- 'customer' or 'ticket'
  from_stage_id UUID REFERENCES public.pipeline_stages(id) ON DELETE SET NULL,
  to_stage_id UUID REFERENCES public.pipeline_stages(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL, -- 'moved', 'created', 'updated', 'automation_triggered'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_activity ENABLE ROW LEVEL SECURITY;

-- RLS policies for pipeline_stages
CREATE POLICY "Users can view their own pipeline stages"
ON public.pipeline_stages FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pipeline stages"
ON public.pipeline_stages FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pipeline stages"
ON public.pipeline_stages FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pipeline stages"
ON public.pipeline_stages FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for stage_automations
CREATE POLICY "Users can view their own stage automations"
ON public.stage_automations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stage automations"
ON public.stage_automations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stage automations"
ON public.stage_automations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stage automations"
ON public.stage_automations FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for pipeline_activity
CREATE POLICY "Users can view their own pipeline activity"
ON public.pipeline_activity FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pipeline activity"
ON public.pipeline_activity FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_pipeline_stages_user_type ON public.pipeline_stages(user_id, pipeline_type);
CREATE INDEX idx_pipeline_stages_position ON public.pipeline_stages(position);
CREATE INDEX idx_stage_automations_stage ON public.stage_automations(stage_id);
CREATE INDEX idx_pipeline_activity_entity ON public.pipeline_activity(entity_id, entity_type);
CREATE INDEX idx_pipeline_activity_created ON public.pipeline_activity(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_pipeline_stages_updated_at
BEFORE UPDATE ON public.pipeline_stages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stage_automations_updated_at
BEFORE UPDATE ON public.stage_automations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();