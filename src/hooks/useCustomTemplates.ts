
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { templateService } from '@/services/templateService';
import { useAuth } from '@/context/AuthContext';
import { IndustryTemplate, TemplateField } from '@/types/templates';
import { toast } from '@/hooks/use-toast';

export const useCustomTemplates = () => {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<IndustryTemplate | null>(null);
  const [templateFields, setTemplateFields] = useState<TemplateField[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  const [fieldsLoading, setFieldsLoading] = useState(false);

  const { data: templates, isLoading, error } = useQuery({
    queryKey: ['custom-templates', user?.id],
    queryFn: () => templateService.getUserCustomTemplates(),
    enabled: !!user,
    retry: false,
  });

  const loadTemplateFields = async (template: IndustryTemplate) => {
    if (!template) return;
    
    setFieldsLoading(true);
    try {
      const fields = await templateService.getTemplateFields(template.id);
      setTemplateFields(fields);
      
      // Initialize field values
      const initialValues: Record<string, string> = {};
      fields.forEach(field => {
        initialValues[field.id] = '';
      });
      setCustomFieldValues(initialValues);
    } catch (error) {
      console.error('Failed to load template fields:', error);
      toast({
        title: "Error",
        description: "Failed to load template fields",
        variant: "destructive",
      });
    } finally {
      setFieldsLoading(false);
    }
  };

  const handleSelectTemplate = async (template: IndustryTemplate | null) => {
    setSelectedTemplate(template);
    if (template) {
      await loadTemplateFields(template);
    } else {
      setTemplateFields([]);
      setCustomFieldValues({});
    }
  };

  const updateCustomFieldValue = (fieldId: string, value: string) => {
    setCustomFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const validateRequiredFields = (): boolean => {
    const requiredFields = templateFields.filter(field => field.is_required);
    const missingFields = requiredFields.filter(field => 
      !customFieldValues[field.id] || customFieldValues[field.id].trim() === ''
    );
    
    if (missingFields.length > 0) {
      toast({
        title: "Required Fields Missing",
        description: `Please fill in: ${missingFields.map(f => f.field_label).join(', ')}`,
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const resetTemplate = () => {
    setSelectedTemplate(null);
    setTemplateFields([]);
    setCustomFieldValues({});
  };

  return {
    templates: templates || [],
    loading: isLoading,
    error,
    selectedTemplate,
    setSelectedTemplate: handleSelectTemplate,
    templateFields,
    customFieldValues,
    updateCustomFieldValue,
    validateRequiredFields,
    resetTemplate,
    fieldsLoading
  };
};
