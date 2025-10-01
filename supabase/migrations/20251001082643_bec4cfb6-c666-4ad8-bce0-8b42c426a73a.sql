-- Insert Business Information template
INSERT INTO public.industry_templates (name, industry, description, is_active, version, user_id)
VALUES ('Business Information', 'general_business', 'Template for general business information', true, 1, NULL)
ON CONFLICT DO NOTHING;

-- Get the template ID and insert fields
DO $$
DECLARE
  template_id UUID;
BEGIN
  -- Get or create the template
  SELECT id INTO template_id FROM public.industry_templates 
  WHERE name = 'Business Information' AND industry = 'general_business'
  LIMIT 1;
  
  IF template_id IS NOT NULL THEN
    -- Insert template fields
    INSERT INTO public.template_fields (template_id, field_name, field_label, field_type, field_options, is_required, display_order)
    VALUES 
      (template_id, 'company_name', 'Company Name', 'text', '{"placeholder": "Enter company name"}'::jsonb, true, 1),
      (template_id, 'contact_person', 'Contact Person', 'text', '{"placeholder": "Enter contact person name"}'::jsonb, true, 2),
      (template_id, 'address', 'Address', 'textarea', '{"placeholder": "Enter business address"}'::jsonb, true, 3),
      (template_id, 'phone_number', 'Phone Number', 'phone', '{"placeholder": "Enter phone number"}'::jsonb, true, 4)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;