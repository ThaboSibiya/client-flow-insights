
import { supabase } from '@/integrations/supabase/client';
import { IndustryTemplate, TemplateField, CustomerCustomData, CustomerTemplate } from '@/types/templates';

export const templateService = {
  // Fetch all available industry templates (now secured by user ownership)
  async getIndustryTemplates(): Promise<IndustryTemplate[]> {
    const { data, error } = await supabase
      .from('industry_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  // Fetch template fields for a specific template (now secured)
  async getTemplateFields(templateId: string): Promise<TemplateField[]> {
    const { data, error } = await supabase
      .from('template_fields')
      .select('*')
      .eq('template_id', templateId)
      .order('display_order');

    if (error) throw error;
    
    return (data || []).map(field => ({
      ...field,
      field_options: field.field_options as TemplateField['field_options']
    }));
  },

  // Apply a template to a customer
  async applyTemplateToCustomer(customerId: string, templateId: string, userId: string): Promise<void> {
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
  },

  // Create a new custom template (now with proper user ownership)
  async createCustomTemplate(templateData: {
    name: string;
    industry: string;
    description?: string;
    fields: Array<{
      field_name: string;
      field_label: string;
      field_type: string;
      field_options?: any;
      is_required: boolean;
      display_order: number;
    }>;
    userId: string;
  }): Promise<string> {
    const { data: template, error: templateError } = await supabase
      .from('industry_templates')
      .insert({
        name: templateData.name,
        industry: templateData.industry,
        description: templateData.description,
        is_active: true,
        version: 1,
        user_id: templateData.userId
      })
      .select('id')
      .single();

    if (templateError) throw templateError;

    const fieldsToInsert = templateData.fields.map(field => ({
      template_id: template.id,
      field_name: field.field_name,
      field_label: field.field_label,
      field_type: field.field_type,
      field_options: field.field_options,
      is_required: field.is_required,
      display_order: field.display_order
    }));

    const { error: fieldsError } = await supabase
      .from('template_fields')
      .insert(fieldsToInsert);

    if (fieldsError) throw fieldsError;

    return template.id;
  },

  // Update an existing custom template (now with proper ownership validation)
  async updateCustomTemplate(templateId: string, templateData: {
    name: string;
    industry: string;
    description?: string;
    fields: Array<{
      id?: string;
      field_name: string;
      field_label: string;
      field_type: string;
      field_options?: any;
      is_required: boolean;
      display_order: number;
    }>;
  }): Promise<void> {
    const { error: templateError } = await supabase
      .from('industry_templates')
      .update({
        name: templateData.name,
        industry: templateData.industry,
        description: templateData.description,
        updated_at: new Date().toISOString()
      })
      .eq('id', templateId);

    if (templateError) throw templateError;

    const { error: deleteError } = await supabase
      .from('template_fields')
      .delete()
      .eq('template_id', templateId);

    if (deleteError) throw deleteError;

    const fieldsToInsert = templateData.fields.map(field => ({
      template_id: templateId,
      field_name: field.field_name,
      field_label: field.field_label,
      field_type: field.field_type,
      field_options: field.field_options,
      is_required: field.is_required,
      display_order: field.display_order
    }));

    const { error: fieldsError } = await supabase
      .from('template_fields')
      .insert(fieldsToInsert);

    if (fieldsError) throw fieldsError;
  },

  // Delete a custom template (now with proper ownership validation)
  async deleteCustomTemplate(templateId: string): Promise<void> {
    const { error } = await supabase
      .from('industry_templates')
      .delete()
      .eq('id', templateId);

    if (error) throw error;
  },

  // Get templates created by the current user (now properly secured)
  async getUserCustomTemplates(): Promise<IndustryTemplate[]> {
    const { data, error } = await supabase
      .from('industry_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};
