
import { supabase } from '@/integrations/supabase/client';
import { enhancedSecurityService } from './enhancedSecurityService';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';

// Enhanced template service with security hardening
export const secureTemplateService = {
  // Create template with enhanced security validation
  createSecureTemplate: async (templateData: any, userId: string) => {
    // Validate template basic data
    const templateValidation = enhancedSecurityService.validateFormData(templateData, [
      { field: 'name', required: true, type: 'string', maxLength: 255, minLength: 1 },
      { field: 'industry', required: true, type: 'string', maxLength: 100 },
      { field: 'description', required: false, type: 'string', maxLength: 1000 }
    ]);

    if (!templateValidation.isValid) {
      throw new Error(`Template validation failed: ${templateValidation.errors.join(', ')}`);
    }

    // Validate all fields
    if (templateData.fields && Array.isArray(templateData.fields)) {
      for (const field of templateData.fields) {
        const fieldValidation = enhancedSecurityService.validateTemplateField(field);
        if (!fieldValidation.isValid) {
          throw new Error(`Field validation failed: ${fieldValidation.errors.join(', ')}`);
        }
      }
    }

    // Sanitize template data
    const sanitizedData = enhancedSecurityService.sanitizeFormData(templateData);

    // Create template with proper ownership
    const { data: template, error: templateError } = await supabase
      .from('industry_templates')
      .insert({
        name: sanitizedData.name,
        industry: sanitizedData.industry,
        description: sanitizedData.description,
        is_active: true,
        version: 1,
        user_id: userId
      })
      .select('id')
      .single();

    if (templateError) throw templateError;

    // Create template fields
    if (sanitizedData.fields && Array.isArray(sanitizedData.fields)) {
      const fieldsToInsert = sanitizedData.fields.map((field: any) => ({
        template_id: template.id,
        field_name: field.field_name,
        field_label: field.field_label,
        field_type: field.field_type,
        field_options: field.field_options,
        is_required: Boolean(field.is_required),
        display_order: Number(field.display_order)
      }));

      const { error: fieldsError } = await supabase
        .from('template_fields')
        .insert(fieldsToInsert);

      if (fieldsError) throw fieldsError;
    }

    return template.id;
  },

  // Get user templates with ownership verification
  getUserTemplatesSecure: async (userId: string) => {
    const { data, error } = await supabase
      .from('industry_templates')
      .select('id, name, industry, description, is_active, version, user_id, created_at, updated_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Delete template with ownership verification
  deleteTemplateSecure: async (templateId: string, userId: string) => {
    // First verify ownership
    const { data: template, error: fetchError } = await supabase
      .from('industry_templates')
      .select('user_id')
      .eq('id', templateId)
      .single();

    if (fetchError) throw fetchError;
    
    if (template.user_id !== userId) {
      throw new Error('Unauthorized: Cannot delete template owned by another user');
    }

    // Delete template (fields will be cascade deleted)
    const { error: deleteError } = await supabase
      .from('industry_templates')
      .delete()
      .eq('id', templateId)
      .eq('user_id', userId); // Double-check ownership in query

    if (deleteError) throw deleteError;
  }
};
