
-- Create industry templates table
CREATE TABLE public.industry_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    industry TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create template fields table
CREATE TABLE public.template_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES public.industry_templates(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    field_label TEXT NOT NULL,
    field_type TEXT NOT NULL CHECK (field_type IN ('text', 'email', 'phone', 'number', 'date', 'boolean', 'select', 'textarea')),
    field_options JSONB,
    is_required BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(template_id, field_name)
);

-- Create customer template associations table
CREATE TABLE public.customer_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.industry_templates(id) ON DELETE CASCADE,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_id UUID NOT NULL,
    UNIQUE(customer_id, template_id)
);

-- Create custom field data storage table
CREATE TABLE public.customer_custom_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    field_id UUID REFERENCES public.template_fields(id) ON DELETE CASCADE,
    field_value TEXT,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(customer_id, field_id)
);

-- Create indexes for performance
CREATE INDEX idx_customer_templates_customer_id ON public.customer_templates(customer_id);
CREATE INDEX idx_customer_custom_data_customer_id ON public.customer_custom_data(customer_id);
CREATE INDEX idx_template_fields_template_id ON public.template_fields(template_id);
CREATE INDEX idx_industry_templates_industry ON public.industry_templates(industry);
CREATE INDEX idx_industry_templates_active ON public.industry_templates(is_active) WHERE is_active = true;

-- Enable RLS on all new tables
ALTER TABLE public.industry_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_custom_data ENABLE ROW LEVEL SECURITY;

-- RLS policies for industry_templates (read-only for all authenticated users)
CREATE POLICY "Industry templates are viewable by authenticated users" 
ON public.industry_templates FOR SELECT 
TO authenticated 
USING (true);

-- RLS policies for template_fields (read-only for all authenticated users)
CREATE POLICY "Template fields are viewable by authenticated users" 
ON public.template_fields FOR SELECT 
TO authenticated 
USING (true);

-- RLS policies for customer_templates
CREATE POLICY "Users can view their customer templates" 
ON public.customer_templates FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their customer templates" 
ON public.customer_templates FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their customer templates" 
ON public.customer_templates FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their customer templates" 
ON public.customer_templates FOR DELETE 
TO authenticated 
USING (user_id = auth.uid());

-- RLS policies for customer_custom_data
CREATE POLICY "Users can view their customer custom data" 
ON public.customer_custom_data FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their customer custom data" 
ON public.customer_custom_data FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their customer custom data" 
ON public.customer_custom_data FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their customer custom data" 
ON public.customer_custom_data FOR DELETE 
TO authenticated 
USING (user_id = auth.uid());

-- Insert sample templates for Phase 1
INSERT INTO public.industry_templates (name, industry, description) VALUES
('Real Estate Professional', 'real_estate', 'Fields for real estate agents and brokers'),
('Insurance Agent', 'insurance', 'Fields for insurance professionals'),
('Healthcare Provider', 'healthcare', 'Fields for healthcare practices'),
('Legal Professional', 'legal', 'Fields for law firms and legal practices'),
('Financial Advisor', 'finance', 'Fields for financial services');

-- Insert sample fields for Real Estate template
INSERT INTO public.template_fields (template_id, field_name, field_label, field_type, is_required, display_order) 
SELECT 
    id,
    field_name,
    field_label,
    field_type,
    is_required,
    display_order
FROM public.industry_templates,
(VALUES 
    ('property_type', 'Property Type', 'select', false, 1),
    ('budget_range', 'Budget Range', 'text', false, 2),
    ('preferred_location', 'Preferred Location', 'text', false, 3),
    ('move_in_date', 'Target Move-in Date', 'date', false, 4),
    ('property_size', 'Property Size (sq ft)', 'number', false, 5)
) AS fields(field_name, field_label, field_type, is_required, display_order)
WHERE industry_templates.industry = 'real_estate';

-- Insert sample fields for Insurance template
INSERT INTO public.template_fields (template_id, field_name, field_label, field_type, is_required, display_order) 
SELECT 
    id,
    field_name,
    field_label,
    field_type,
    is_required,
    display_order
FROM public.industry_templates,
(VALUES 
    ('policy_number', 'Policy Number', 'text', true, 1),
    ('policy_type', 'Policy Type', 'select', true, 2),
    ('renewal_date', 'Renewal Date', 'date', true, 3),
    ('coverage_amount', 'Coverage Amount', 'number', false, 4),
    ('beneficiary', 'Primary Beneficiary', 'text', false, 5)
) AS fields(field_name, field_label, field_type, is_required, display_order)
WHERE industry_templates.industry = 'insurance';

-- Add field options for select fields
UPDATE public.template_fields 
SET field_options = '{"options": ["Auto", "Home", "Life", "Health", "Business"]}'
WHERE field_name = 'policy_type';

UPDATE public.template_fields 
SET field_options = '{"options": ["Residential", "Commercial", "Land", "Investment", "Rental"]}'
WHERE field_name = 'property_type';
