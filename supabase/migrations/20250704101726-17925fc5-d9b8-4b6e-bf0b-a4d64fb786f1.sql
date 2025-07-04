-- Add industry field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN industry TEXT,
ADD COLUMN employee_count INTEGER,
ADD COLUMN business_type TEXT,
ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;

-- Create industry-specific customer templates table
CREATE TABLE public.industry_customer_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  industry TEXT NOT NULL,
  template_name TEXT NOT NULL,
  field_definitions JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on the new table
ALTER TABLE public.industry_customer_templates ENABLE ROW LEVEL SECURITY;

-- Create policy for the templates table (public read access for industry templates)
CREATE POLICY "Templates are viewable by authenticated users" 
ON public.industry_customer_templates 
FOR SELECT 
TO authenticated
USING (true);

-- Insert default industry templates
INSERT INTO public.industry_customer_templates (industry, template_name, field_definitions) VALUES
('printer_services', 'Default Printer Service Customer', '{
  "fields": [
    {"name": "company_name", "label": "Company Name", "type": "text", "required": true},
    {"name": "company_address", "label": "Company Address", "type": "textarea", "required": true},
    {"name": "contact_person", "label": "Contact Person", "type": "text", "required": true},
    {"name": "phone_number", "label": "Phone Number", "type": "tel", "required": true},
    {"name": "email", "label": "Email", "type": "email", "required": true},
    {"name": "printer_brand", "label": "Printer Brand", "type": "select", "options": ["HP", "Canon", "Epson", "Brother", "Xerox", "Other"], "required": true},
    {"name": "printer_model", "label": "Printer Model", "type": "text", "required": true},
    {"name": "serial_number", "label": "Serial Number", "type": "text", "required": true},
    {"name": "purchase_date", "label": "Purchase Date", "type": "date", "required": false},
    {"name": "service_contract", "label": "Service Contract Number", "type": "text", "required": false}
  ]
}'),
('automotive_service', 'Default Automotive Service Customer', '{
  "fields": [
    {"name": "company_name", "label": "Company/Customer Name", "type": "text", "required": true},
    {"name": "contact_person", "label": "Contact Person", "type": "text", "required": true},
    {"name": "phone_number", "label": "Phone Number", "type": "tel", "required": true},
    {"name": "email", "label": "Email", "type": "email", "required": true},
    {"name": "vehicle_make", "label": "Vehicle Make", "type": "text", "required": true},
    {"name": "vehicle_model", "label": "Vehicle Model", "type": "text", "required": true},
    {"name": "vehicle_year", "label": "Vehicle Year", "type": "number", "required": true},
    {"name": "vin_number", "label": "VIN Number", "type": "text", "required": true},
    {"name": "license_plate", "label": "License Plate", "type": "text", "required": false},
    {"name": "mileage", "label": "Current Mileage", "type": "number", "required": false}
  ]
}'),
('broker', 'Default Broker Customer', '{
  "fields": [
    {"name": "company_name", "label": "Company Name", "type": "text", "required": true},
    {"name": "contact_person", "label": "Contact Person", "type": "text", "required": true},
    {"name": "phone_number", "label": "Phone Number", "type": "tel", "required": true},
    {"name": "email", "label": "Email", "type": "email", "required": true},
    {"name": "property_type", "label": "Property Type", "type": "select", "options": ["Residential", "Commercial", "Industrial", "Land"], "required": true},
    {"name": "budget_range", "label": "Budget Range", "type": "select", "options": ["Under $100k", "$100k-$500k", "$500k-$1M", "$1M-$5M", "Over $5M"], "required": false},
    {"name": "preferred_location", "label": "Preferred Location", "type": "text", "required": false},
    {"name": "timeline", "label": "Purchase Timeline", "type": "select", "options": ["Immediate", "Within 3 months", "3-6 months", "6+ months"], "required": false}
  ]
}'),
('marketing', 'Default Marketing Agency Customer', '{
  "fields": [
    {"name": "company_name", "label": "Company Name", "type": "text", "required": true},
    {"name": "contact_person", "label": "Contact Person", "type": "text", "required": true},
    {"name": "phone_number", "label": "Phone Number", "type": "tel", "required": true},
    {"name": "email", "label": "Email", "type": "email", "required": true},
    {"name": "company_website", "label": "Company Website", "type": "url", "required": false},
    {"name": "industry_sector", "label": "Industry Sector", "type": "text", "required": true},
    {"name": "marketing_goals", "label": "Marketing Goals", "type": "textarea", "required": true},
    {"name": "current_marketing_budget", "label": "Monthly Marketing Budget", "type": "select", "options": ["Under $1k", "$1k-$5k", "$5k-$10k", "$10k-$25k", "$25k+"], "required": false},
    {"name": "target_audience", "label": "Target Audience", "type": "textarea", "required": false}
  ]
}'),
('attorney', 'Default Attorney Customer', '{
  "fields": [
    {"name": "client_name", "label": "Client Name", "type": "text", "required": true},
    {"name": "contact_person", "label": "Contact Person", "type": "text", "required": true},
    {"name": "phone_number", "label": "Phone Number", "type": "tel", "required": true},
    {"name": "email", "label": "Email", "type": "email", "required": true},
    {"name": "case_type", "label": "Case Type", "type": "select", "options": ["Personal Injury", "Criminal Defense", "Family Law", "Corporate Law", "Real Estate", "Immigration", "Other"], "required": true},
    {"name": "case_description", "label": "Case Description", "type": "textarea", "required": true},
    {"name": "urgency_level", "label": "Urgency Level", "type": "select", "options": ["Low", "Medium", "High", "Critical"], "required": true},
    {"name": "referral_source", "label": "Referral Source", "type": "text", "required": false}
  ]
}')