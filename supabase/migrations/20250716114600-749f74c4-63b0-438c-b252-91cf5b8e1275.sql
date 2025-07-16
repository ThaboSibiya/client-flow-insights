
-- Insert printer service template
INSERT INTO public.industry_templates (name, industry, description) VALUES
('Printer Service Company', 'printer_service', 'Fields for printer service and maintenance companies');

-- Get the template ID and insert fields for printer service template
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
    ('company_name', 'Company Name', 'text', true, 1),
    ('company_address', 'Company Address', 'textarea', true, 2),
    ('contact_person', 'Contact Person', 'text', true, 3),
    ('phone_number', 'Phone Number', 'phone', true, 4),
    ('email_address', 'Email Address', 'email', true, 5),
    ('printer_brand', 'Printer Brand', 'select', true, 6),
    ('printer_model', 'Printer Model', 'text', true, 7),
    ('serial_number', 'Serial Number', 'text', true, 8),
    ('purchase_date', 'Purchase Date', 'date', false, 9)
) AS fields(field_name, field_label, field_type, is_required, display_order)
WHERE industry_templates.industry = 'printer_service';

-- Add field options for printer brands
UPDATE public.template_fields 
SET field_options = '{"options": ["Canon", "HP", "Epson", "Brother", "Xerox", "Ricoh", "Kyocera", "Lexmark", "Samsung", "Other"]}'
WHERE field_name = 'printer_brand';
