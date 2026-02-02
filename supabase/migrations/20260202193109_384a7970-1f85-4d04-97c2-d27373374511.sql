-- Create equipment service history table for tracking maintenance, repairs, and service logs
CREATE TABLE public.equipment_service_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES public.customer_equipment(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Service details
  service_type TEXT NOT NULL DEFAULT 'maintenance', -- maintenance, repair, inspection, installation, replacement
  service_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  performed_by TEXT, -- Technician name
  
  -- Service description
  description TEXT NOT NULL,
  resolution TEXT,
  parts_used TEXT[], -- Array of parts used
  
  -- Cost tracking
  labor_cost NUMERIC DEFAULT 0,
  parts_cost NUMERIC DEFAULT 0,
  total_cost NUMERIC GENERATED ALWAYS AS (labor_cost + parts_cost) STORED,
  
  -- Linked ticket (if service was performed via a ticket)
  ticket_id UUID,
  
  -- Status tracking
  status TEXT DEFAULT 'completed', -- scheduled, in_progress, completed, cancelled
  next_service_due DATE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.equipment_service_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their equipment service history"
ON public.equipment_service_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their equipment service history"
ON public.equipment_service_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their equipment service history"
ON public.equipment_service_history
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their equipment service history"
ON public.equipment_service_history
FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_equipment_service_history_equipment_id ON public.equipment_service_history(equipment_id);
CREATE INDEX idx_equipment_service_history_customer_id ON public.equipment_service_history(customer_id);
CREATE INDEX idx_equipment_service_history_service_date ON public.equipment_service_history(service_date DESC);

-- Add last_service_date column to customer_equipment for quick reference
ALTER TABLE public.customer_equipment 
ADD COLUMN IF NOT EXISTS last_service_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS next_service_due DATE,
ADD COLUMN IF NOT EXISTS total_services INTEGER DEFAULT 0;

-- Create trigger to update equipment service stats
CREATE OR REPLACE FUNCTION update_equipment_service_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.customer_equipment
    SET 
      last_service_date = NEW.service_date,
      next_service_due = NEW.next_service_due,
      total_services = total_services + 1,
      updated_at = now()
    WHERE id = NEW.equipment_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_service_history_insert
AFTER INSERT ON public.equipment_service_history
FOR EACH ROW
EXECUTE FUNCTION update_equipment_service_stats();