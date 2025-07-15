
import { supabase } from '@/integrations/supabase/client';
import { IndustryTemplate, TemplateField, CustomerTemplate, CustomerCustomData, EnhancedCustomer, CustomFieldValue } from '@/types/customData';

export class CustomDataService {
  // Get all available industry templates
  static async getIndustryTemplates(): Promise<IndustryTemplate[]> {
    const { data, error } = await supabase
      .from('industry_templates')
      .select('*')
      .eq('is_active', true)
      .order('industry');

    if (error) throw error;
    return data || [];
  }

  // Get template fields for a specific template
  static async getTemplateFields(templateId: string): Promise<TemplateField[]> {
    const { data, error } = await supabase
      .from('template_fields')
      .select('*')
      .eq('template_id', templateId)
      .order('display_order');

    if (error) throw error;
    return data || [];
  }

  // Apply a template to a customer
  static async applyTemplateToCustomer(customerId: string, templateId: string, userId: string): Promise<void> {
    // First, check if template is already applied
    const { data: existing } = await supabase
      .from('customer_templates')
      .select('id')
      .eq('customer_id', customerId)
      .eq('template_id', templateId)
      .single();

    if (existing) {
      throw new Error('Template already applied to this customer');
    }

    // Apply the template
    const { error: templateError } = await supabase
      .from('customer_templates')
      .insert({
        customer_id: customerId,
        template_id: templateId,
        user_id: userId
      });

    if (templateError) throw templateError;

    // Get template fields and create empty custom data records
    const fields = await this.getTemplateFields(templateId);
    
    if (fields.length > 0) {
      const customDataRecords = fields.map(field => ({
        customer_id: customerId,
        field_id: field.id,
        field_value: '',
        user_id: userId
      }));

      const { error: dataError } = await supabase
        .from('customer_custom_data')
        .insert(customDataRecords);

      if (dataError) throw dataError;
    }
  }

  // Get enhanced customer data with custom fields
  static async getEnhancedCustomer(customerId: string, userId: string): Promise<EnhancedCustomer | null> {
    // Get base customer data
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .eq('user_id', userId)
      .single();

    if (customerError || !customer) return null;

    // Get applied templates
    const { data: customerTemplates, error: templatesError } = await supabase
      .from('customer_templates')
      .select(`
        template_id,
        industry_templates (*)
      `)
      .eq('customer_id', customerId)
      .eq('user_id', userId);

    if (templatesError) throw templatesError;

    // Get custom field data
    const { data: customFieldsData, error: fieldsError } = await supabase
      .from('customer_custom_data')
      .select(`
        field_value,
        template_fields (
          field_name,
          field_label,
          field_type,
          is_required,
          field_options,
          display_order
        )
      `)
      .eq('customer_id', customerId)
      .eq('user_id', userId);

    if (fieldsError) throw fieldsError;

    // Transform custom fields data
    const customFields: CustomFieldValue[] = (customFieldsData || [])
      .filter(item => item.template_fields)
      .map(item => ({
        field_name: item.template_fields.field_name,
        field_label: item.template_fields.field_label,
        field_type: item.template_fields.field_type,
        field_value: item.field_value || '',
        is_required: item.template_fields.is_required,
        field_options: item.template_fields.field_options
      }))
      .sort((a, b) => {
        const aOrder = customFieldsData?.find(d => d.template_fields?.field_name === a.field_name)?.template_fields?.display_order || 0;
        const bOrder = customFieldsData?.find(d => d.template_fields?.field_name === b.field_name)?.template_fields?.display_order || 0;
        return aOrder - bOrder;
      });

    return {
      ...customer,
      custom_fields: customFields,
      applied_templates: (customerTemplates || []).map(ct => ct.industry_templates).filter(Boolean)
    };
  }

  // Update custom field value
  static async updateCustomFieldValue(customerId: string, fieldId: string, value: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('customer_custom_data')
      .update({ 
        field_value: value,
        updated_at: new Date().toISOString()
      })
      .eq('customer_id', customerId)
      .eq('field_id', fieldId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  // Remove template from customer
  static async removeTemplateFromCustomer(customerId: string, templateId: string, userId: string): Promise<void> {
    // Remove custom data first
    const { error: dataError } = await supabase
      .from('customer_custom_data')
      .delete()
      .eq('customer_id', customerId)
      .eq('user_id', userId)
      .in('field_id', 
        supabase
          .from('template_fields')
          .select('id')
          .eq('template_id', templateId)
      );

    if (dataError) throw dataError;

    // Remove template association
    const { error: templateError } = await supabase
      .from('customer_templates')
      .delete()
      .eq('customer_id', customerId)
      .eq('template_id', templateId)
      .eq('user_id', userId);

    if (templateError) throw templateError;
  }
}
