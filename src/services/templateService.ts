
import { supabase } from '@/integrations/supabase/client';
import { IndustryTemplate, TemplateField, CustomerCustomData, CustomerTemplate } from '@/types/templates';

export const templateService = {
  // Fetch all available industry templates
  async getIndustryTemplates(): Promise<IndustryTemplate[]> {
    const { data, error } = await supabase
      .from('industry_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  // Fetch template fields for a specific template
  async getTemplateFields(templateId: string): Promise<TemplateField[]> {
    const { data, error } = await supabase
      .from('template_fields')
      .select('*')
      .eq('template_id', templateId)
      .order('display_order');

    if (error) throw error;
    return data || [];
  },

  // Apply a template to a customer
  async applyTemplateToCustomer(customerId: string, templateId: string, userId: string): Promise<void> {
    // First check if template is already applied
    const { data: existing } = await supabase
      .from('customer_templates')
      .select('id')
      .eq('customer_id', customerId)
      .eq('template_id', templateId)
      .single();

    if (!existing) {
      const { error } = await supabase
        .from('customer_templates')
        .insert({
          customer_id: customerId,
          template_id: templateId,
          user_id: userId
        });

      if (error) throw error;
    }
  },

  // Save custom field data for a customer
  async saveCustomFieldData(
    customerId: string,
    fieldId: string,
    fieldValue: string,
    userId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('customer_custom_data')
      .upsert({
        customer_id: customerId,
        field_id: fieldId,
        field_value: fieldValue,
        user_id: userId
      }, {
        onConflict: 'customer_id,field_id'
      });

    if (error) throw error;
  },

  // Get custom data for a customer
  async getCustomerCustomData(customerId: string): Promise<CustomerCustomData[]> {
    const { data, error } = await supabase
      .from('customer_custom_data')
      .select('*')
      .eq('customer_id', customerId);

    if (error) throw error;
    return data || [];
  },

  // Get applied templates for a customer
  async getCustomerTemplates(customerId: string): Promise<CustomerTemplate[]> {
    const { data, error } = await supabase
      .from('customer_templates')
      .select('*')
      .eq('customer_id', customerId);

    if (error) throw error;
    return data || [];
  }
};
