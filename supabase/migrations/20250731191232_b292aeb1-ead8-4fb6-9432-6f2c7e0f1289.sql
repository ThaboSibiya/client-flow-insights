
-- Add missing columns to customer_equipment table
ALTER TABLE public.customer_equipment 
ADD COLUMN technical_issues text,
ADD COLUMN status text DEFAULT 'active';
