
import { useState, useEffect } from 'react';
import { templateService } from '@/services/templateService';
import { IndustryTemplate, TemplateField } from '@/types/templates';
import { toast } from '@/hooks/use-toast';

export const useCustomTemplates = () => {
  const [templates, setTemplates] = useState<IndustryTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<IndustryTemplate | null>(null);
  const [templateFields, setTemplateFields] = useState<TemplateField[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Load available templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);
        const data = await templateService.getIndustryTemplates();
        setTemplates(data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: `Failed to load templates: ${error.message}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  // Load fields when template is selected
  useEffect(() => {
    const loadFields = async () => {
      if (!selectedTemplate) {
        setTemplateFields([]);
        setCustomFieldValues({});
        return;
      }

      try {
        setLoading(true);
        const fields = await templateService.getTemplateFields(selectedTemplate.id);
        setTemplateFields(fields);
        // Initialize custom field values
        const initialValues: Record<string, string> = {};
        fields.forEach(field => {
          initialValues[field.id] = '';
        });
        setCustomFieldValues(initialValues);
      } catch (error: any) {
        toast({
          title: "Error",
          description: `Failed to load template fields: ${error.message}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadFields();
  }, [selectedTemplate]);

  const updateCustomFieldValue = (fieldId: string, value: string) => {
    setCustomFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const validateRequiredFields = (): boolean => {
    const requiredFields = templateFields.filter(field => field.is_required);
    const missingFields = requiredFields.filter(field => !customFieldValues[field.id]?.trim());
    
    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill in all required fields: ${missingFields.map(f => f.field_label).join(', ')}`,
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
    templates,
    selectedTemplate,
    setSelectedTemplate,
    templateFields,
    customFieldValues,
    updateCustomFieldValue,
    validateRequiredFields,
    resetTemplate,
    loading
  };
};
