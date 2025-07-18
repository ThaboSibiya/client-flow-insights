
-- Create industry templates table to store template metadata
CREATE TABLE public.industry_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create template fields table to define custom fields for each template
CREATE TABLE public.template_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.industry_templates(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL, -- 'text', 'email', 'phone', 'number', 'date', 'select', 'textarea', 'checkbox'
  field_options JSONB, -- For dropdown options, validation rules, etc.
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create customer custom data table to store actual values
CREATE TABLE public.customer_custom_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  field_id UUID REFERENCES public.template_fields(id) ON DELETE CASCADE,
  field_value TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create customer templates table to track which templates are applied to customers
CREATE TABLE public.customer_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.industry_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for industry templates (read-only for authenticated users)
ALTER TABLE public.industry_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Industry templates are viewable by authenticated users" ON public.industry_templates
  FOR SELECT USING (true);

-- Add RLS policies for template fields (read-only for authenticated users)
ALTER TABLE public.template_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Template fields are viewable by authenticated users" ON public.template_fields
  FOR SELECT USING (true);

-- Add RLS policies for customer custom data (users can only access their own data)
ALTER TABLE public.customer_custom_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their customer custom data" ON public.customer_custom_data
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their customer custom data" ON public.customer_custom_data
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their customer custom data" ON public.customer_custom_data
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their customer custom data" ON public.customer_custom_data
  FOR DELETE USING (user_id = auth.uid());

-- Add RLS policies for customer templates (users can only access their own data)
ALTER TABLE public.customer_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their customer templates" ON public.customer_templates
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their customer templates" ON public.customer_templates
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their customer templates" ON public.customer_templates
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their customer templates" ON public.customer_templates
  FOR DELETE USING (user_id = auth.uid());

-- Insert sample industry templates for Phase 1 MVP
INSERT INTO public.industry_templates (name, industry, description) VALUES
('Printer Service Provider', 'printer_services', 'Template for businesses providing printer maintenance, repair, and supplies'),
('Insurance Broker', 'insurance', 'Template for insurance agents and brokers managing client policies and claims'),
('Real Estate Agent', 'real_estate', 'Template for real estate professionals managing property listings and client transactions'),
('Automotive Service', 'automotive', 'Template for auto repair shops and service centers'),
('IT Support Provider', 'it_services', 'Template for IT support and managed service providers');

-- Insert sample template fields for Printer Service Provider
INSERT INTO public.template_fields (template_id, field_name, field_label, field_type, is_required, display_order) 
SELECT id, 'printer_brand', 'Printer Brand', 'select', true, 1 FROM public.industry_templates WHERE industry = 'printer_services';

INSERT INTO public.template_fields (template_id, field_name, field_label, field_type, field_options, display_order) 
SELECT id, 'printer_brand', 'Printer Brand', 'select', '{"options": ["HP", "Canon", "Epson", "Brother", "Xerox", "Lexmark", "Other"]}', 1 FROM public.industry_templates WHERE industry = 'printer_services';

INSERT INTO public.template_fields (template_id, field_name, field_label, field_type, display_order) 
SELECT id, 'printer_model', 'Printer Model', 'text', 2 FROM public.industry_templates WHERE industry = 'printer_services';

INSERT INTO public.template_fields (template_id, field_name, field_label, field_type, display_order) 
SELECT id, 'serial_number', 'Serial Number', 'text', 3 FROM public.industry_templates WHERE industry = 'printer_services';

INSERT INTO public.template_fields (template_id, field_name, field_label, field_type, display_order) 
SELECT id, 'service_contract', 'Service Contract Type', 'select', 4 FROM public.industry_templates WHERE industry = 'printer_services';

INSERT INTO public.template_fields (template_id, field_name, field_label, field_type, field_options, display_order) 
SELECT id, 'service_contract', 'Service Contract Type', 'select', '{"options": ["Monthly", "Quarterly", "Annual", "Per-incident", "Warranty"]}', 4 FROM public.industry_templates WHERE industry = 'printer_services';

INSERT INTO public.template_fields (template_id, field_name, field_label, field_type, display_order) 
SELECT id, 'last_service_date', 'Last Service Date', 'date', 5 FROM public.industry_templates WHERE industry = 'printer_services';

-- Insert sample template fields for Insurance Broker
INSERT INTO public.template_fields (template_id, field_name, field_label, field_type, field_options, is_required, display_order) 
SELECT id, 'insurance_type', 'Insurance Type', 'select', '{"options": ["Auto", "Home", "Life", "Health", "Business", "Travel"]}', true, 1 FROM public.industry_templates WHERE industry = 'insurance';

INSERT INTO public.template_fields (template_id, field_name, field_label, field_type, display_order) 
SELECT id, 'policy_number', 'Policy Number', 'text', 2 FROM public.industry_templates WHERE industry = 'insurance';

INSERT INTO public.template_fields (template_id, field_name, field_label, field_type, display_order) 
SELECT id, 'premium_amount', 'Monthly Premium', 'number', 3 FROM public.industry_templates WHERE industry = 'insurance';

INSERT INTO public.template_fields (template_id, field_name, field_label, field_type, display_order) 
SELECT id, 'renewal_date', 'Renewal Date', 'date', 4 FROM public.industry_templates WHERE industry = 'insurance';

INSERT INTO public.template_fields (template_id, field_name, field_label, field_type, display_order) 
SELECT id, 'claims_history', 'Claims History', 'textarea', 5 FROM public.industry_templates WHERE industry = 'insurance';
