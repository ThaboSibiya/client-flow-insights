
export interface IndustryTemplate {
  id: string;
  name: string;
  industry: string;
  description: string | null;
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
  field_type: 'text' | 'email' | 'phone' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
  field_options: {
    options?: string[];
    placeholder?: string;
    min?: number;
    max?: number;
  } | null;
  is_required: boolean;
  display_order: number;
  created_at: string;
}

export interface CustomerCustomData {
  id: string;
  customer_id: string;
  field_id: string;
  field_value: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerTemplate {
  id: string;
  customer_id: string;
  template_id: string;
  user_id: string;
  applied_at: string;
}
