
-- Add new columns to customers table for proper data structure
ALTER TABLE public.customers 
ADD COLUMN address text,
ADD COLUMN contact_person text,
ADD COLUMN company_address text;

-- Create equipment table for printer/equipment details
CREATE TABLE public.customer_equipment (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id uuid NOT NULL,
  user_id uuid NOT NULL,
  equipment_type text NOT NULL DEFAULT 'printer',
  brand text,
  model text,
  serial_number text,
  purchase_date date,
  warranty_expiry date,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT fk_customer_equipment_customer 
    FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE
);

-- Add RLS policies for customer_equipment
ALTER TABLE public.customer_equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their customer equipment" 
  ON public.customer_equipment 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their customer equipment" 
  ON public.customer_equipment 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their customer equipment" 
  ON public.customer_equipment 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their customer equipment" 
  ON public.customer_equipment 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Create index for better performance
CREATE INDEX idx_customer_equipment_customer_id ON public.customer_equipment(customer_id);
CREATE INDEX idx_customer_equipment_user_id ON public.customer_equipment(user_id);
