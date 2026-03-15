
-- Import history table for tracking past imports with undo capability
CREATE TABLE public.import_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL, -- 'customers', 'tickets', 'invoices'
  source_file TEXT, -- original filename
  source_crm TEXT DEFAULT 'csv', -- 'csv', 'hubspot_api', etc.
  total_rows INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  skipped_duplicates INTEGER NOT NULL DEFAULT 0,
  imported_record_ids JSONB DEFAULT '[]'::jsonb, -- array of imported record IDs for undo
  field_mappings JSONB DEFAULT '{}'::jsonb,
  errors JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'completed', -- 'completed', 'undone', 'in_progress'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.import_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own import history
CREATE POLICY "Users can view own import history"
  ON public.import_history FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own import history"
  ON public.import_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own import history"
  ON public.import_history FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Index for quick lookup
CREATE INDEX idx_import_history_user_workspace ON public.import_history(user_id, workspace_id);

-- Auto-update updated_at
CREATE TRIGGER update_import_history_updated_at
  BEFORE UPDATE ON public.import_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
