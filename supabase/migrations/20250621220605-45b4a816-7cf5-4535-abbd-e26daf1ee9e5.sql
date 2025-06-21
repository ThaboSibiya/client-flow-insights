
-- Create scheduled_calls table for storing follow-up call schedules
CREATE TABLE public.scheduled_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  call_type TEXT NOT NULL CHECK (call_type IN ('welcome', 'check_in', 'closing', 'feedback')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'missed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.scheduled_calls ENABLE ROW LEVEL SECURITY;

-- Create policies for scheduled_calls
CREATE POLICY "Users can view their own scheduled calls" 
  ON public.scheduled_calls 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.customers 
    WHERE customers.id = scheduled_calls.customer_id 
    AND customers.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own scheduled calls" 
  ON public.scheduled_calls 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.customers 
    WHERE customers.id = scheduled_calls.customer_id 
    AND customers.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own scheduled calls" 
  ON public.scheduled_calls 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.customers 
    WHERE customers.id = scheduled_calls.customer_id 
    AND customers.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own scheduled calls" 
  ON public.scheduled_calls 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.customers 
    WHERE customers.id = scheduled_calls.customer_id 
    AND customers.user_id = auth.uid()
  ));
