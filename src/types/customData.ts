
export interface IndustryTemplate {
  id: string;
  name: string;
  industry: string;
  description: string;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface TemplateField {
  id: string;
  template_id: string;
  field_name: string;
  field_label: string;
  field_type: 'text' | 'email' | 'phone' | 'number' | 'date' | 'boolean' | 'select' | 'textarea';
  field_options?: {
    options?: string[];
    validation?: any;
  };
  is_required: boolean;
  display_order: number;
  created_at: string;
}

export interface CustomerTemplate {
  id: string;
  customer_id: string;
  template_id: string;
  applied_at: string;
  user_id: string;
}

export interface CustomerCustomData {
  id: string;
  customer_id: string;
  field_id: string;
  field_value: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CustomFieldValue {
  field_name: string;
  field_label: string;
  field_type: string;
  field_value: string;
  is_required: boolean;
  field_options?: any;
}

export interface EnhancedCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  contact_person?: string;
  company_address?: string;
  status?: string;
  notes?: string;
  custom_fields: CustomFieldValue[];
  applied_templates: IndustryTemplate[];
}
