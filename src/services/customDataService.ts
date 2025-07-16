
import { supabase } from '@/integrations/supabase/client';
import { IndustryTemplate, TemplateField, CustomFieldValue } from '@/types/customData';

export class CustomDataService {
  static async getIndustryTemplates(): Promise<IndustryTemplate[]> {
    const { data, error } = await supabase
      .from('industry_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching industry templates:', error);
      throw new Error('Failed to fetch industry templates');
    }

    return data || [];
  }

  static async getTemplateFields(templateId: string): Promise<TemplateField[]> {
    const { data, error } = await supabase
      .from('template_fields')
      .select('*')
      .eq('template_id', templateId)
      .order('display_order');

    if (error) {
      console.error('Error fetching template fields:', error);
      throw new Error('Failed to fetch template fields');
    }

    return data || [];
  }

  static async applyTemplateToCustomer(customerId: string, templateId: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // Check if template is already applied
    const { data: existingTemplate } = await supabase
      .from('customer_templates')
      .select('id')
      .eq('customer_id', customerId)
      .eq('template_id', templateId)
      .single();

    if (existingTemplate) {
      throw new Error('Template is already applied to this customer');
    }

    // Apply the template
    const { error } = await supabase
      .from('customer_templates')
      .insert({
        customer_id: customerId,
        template_id: templateId,
        user_id: user.user.id
      });

    if (error) {
      console.error('Error applying template:', error);
      throw new Error('Failed to apply template to customer');
    }
  }

  static async removeTemplateFromCustomer(customerId: string, templateId: string): Promise<void> {
    const { error } = await supabase
      .from('customer_templates')
      .delete()
      .eq('customer_id', customerId)
      .eq('template_id', templateId);

    if (error) {
      console.error('Error removing template:', error);
      throw new Error('Failed to remove template from customer');
    }
  }

  static async getCustomerTemplates(customerId: string) {
    const { data, error } = await supabase
      .from('customer_templates')
      .select(`
        *,
        industry_templates (*)
      `)
      .eq('customer_id', customerId);

    if (error) {
      console.error('Error fetching customer templates:', error);
      throw new Error('Failed to fetch customer templates');
    }

    return data || [];
  }

  static async getCustomerCustomFields(customerId: string): Promise<CustomFieldValue[]> {
    const { data, error } = await supabase
      .from('customer_custom_data')
      .select(`
        *,
        template_fields (
          field_name,
          field_label,
          field_type,
          is_required,
          field_options
        )
      `)
      .eq('customer_id', customerId);

    if (error) {
      console.error('Error fetching customer custom fields:', error);
      throw new Error('Failed to fetch customer custom fields');
    }

    return (data || []).map(item => ({
      field_name: item.template_fields.field_name,
      field_label: item.template_fields.field_label,
      field_type: item.template_fields.field_type,
      field_value: item.field_value,
      is_required: item.template_fields.is_required,
      field_options: item.template_fields.field_options
    }));
  }

  static async updateCustomerCustomField(customerId: string, fieldId: string, value: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('customer_custom_data')
      .upsert({
        customer_id: customerId,
        field_id: fieldId,
        field_value: value,
        user_id: user.user.id
      });

    if (error) {
      console.error('Error updating custom field:', error);
      throw new Error('Failed to update custom field');
    }
  }

  static async createTemplateField(templateId: string, fieldData: Omit<TemplateField, 'id' | 'template_id' | 'created_at'>): Promise<TemplateField> {
    const { data, error } = await supabase
      .from('template_fields')
      .insert({
        template_id: templateId,
        ...fieldData
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating template field:', error);
      throw new Error('Failed to create template field');
    }

    return data;
  }

  static async updateTemplateField(fieldId: string, fieldData: Partial<TemplateField>): Promise<void> {
    const { error } = await supabase
      .from('template_fields')
      .update(fieldData)
      .eq('id', fieldId);

    if (error) {
      console.error('Error updating template field:', error);
      throw new Error('Failed to update template field');
    }
  }

  static async deleteTemplateField(fieldId: string): Promise<void> {
    const { error } = await supabase
      .from('template_fields')
      .delete()
      .eq('id', fieldId);

    if (error) {
      console.error('Error deleting template field:', error);
      throw new Error('Failed to delete template field');
    }
  }
}
