
import { useState, useEffect } from 'react';
import { templateService } from '@/services/templateService';
import { CustomerCustomData, TemplateField, IndustryTemplate } from '@/types/templates';
import { toast } from '@/hooks/use-toast';

export const useCustomerCustomData = (customerId: string | null) => {
  const [customData, setCustomData] = useState<CustomerCustomData[]>([]);
  const [templateFields, setTemplateFields] = useState<TemplateField[]>([]);
  const [appliedTemplates, setAppliedTemplates] = useState<IndustryTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCustomData = async () => {
      if (!customerId) {
        setCustomData([]);
        setTemplateFields([]);
        setAppliedTemplates([]);
        return;
      }

      setLoading(true);
      try {
        // Fetch custom data for the customer
        const data = await templateService.getCustomerCustomData(customerId);
        setCustomData(data);

        // Get applied templates
        const customerTemplates = await templateService.getCustomerTemplates(customerId);
        
        // Fetch template details and fields
        const templates = await templateService.getIndustryTemplates();
        const appliedTemplateIds = customerTemplates.map(ct => ct.template_id);
        const appliedTemplateDetails = templates.filter(t => appliedTemplateIds.includes(t.id));
        setAppliedTemplates(appliedTemplateDetails);

        // Fetch all fields for applied templates
        const allFields: TemplateField[] = [];
        for (const template of appliedTemplateDetails) {
          const fields = await templateService.getTemplateFields(template.id);
          allFields.push(...fields);
        }
        setTemplateFields(allFields);

      } catch (error: any) {
        toast({
          title: "Error",
          description: `Failed to load custom data: ${error.message}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomData();
  }, [customerId]);

  return {
    customData,
    templateFields,
    appliedTemplates,
    loading
  };
};
