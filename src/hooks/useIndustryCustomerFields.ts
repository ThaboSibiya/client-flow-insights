
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface FieldDefinition {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
  category?: 'personal' | 'industry' | 'equipment';
}

interface IndustryTemplate {
  id: string;
  industry: string;
  template_name: string;
  field_definitions: {
    fields: FieldDefinition[];
  };
}

export const useIndustryCustomerFields = () => {
  const { user } = useAuth();
  const [template, setTemplate] = useState<IndustryTemplate | null>(null);
  const [personalFields, setPersonalFields] = useState<FieldDefinition[]>([]);
  const [industryFields, setIndustryFields] = useState<FieldDefinition[]>([]);
  const [equipmentFields, setEquipmentFields] = useState<FieldDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userIndustry, setUserIndustry] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserIndustryAndTemplate = async () => {
      if (!user) return;

      try {
        // Get user's industry from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('industry')
          .eq('id', user.id)
          .single();

        if (profile?.industry) {
          setUserIndustry(profile.industry);

          // Get template for user's industry
          const { data: templateData } = await supabase
            .from('industry_customer_templates')
            .select('*')
            .eq('industry', profile.industry)
            .single();

          if (templateData) {
            const parsedTemplate = {
              ...templateData,
              field_definitions: typeof templateData.field_definitions === 'string' 
                ? JSON.parse(templateData.field_definitions) 
                : templateData.field_definitions
            };
            
            setTemplate(parsedTemplate);

            // Categorize fields
            const fields = parsedTemplate.field_definitions.fields || [];
            
            // Default personal fields that should always be present
            const defaultPersonal: FieldDefinition[] = [
              { name: 'name', label: 'Name', type: 'text', required: true, category: 'personal' },
              { name: 'email', label: 'Email', type: 'email', required: true, category: 'personal' },
              { name: 'phone', label: 'Phone', type: 'tel', required: false, category: 'personal' },
              { name: 'address', label: 'Address', type: 'text', required: false, category: 'personal' },
              { name: 'contact_person', label: 'Contact Person', type: 'text', required: false, category: 'personal' },
            ];

            const personal = fields.filter(f => f.category === 'personal' || 
              ['name', 'email', 'phone', 'address', 'contact_person'].includes(f.name));
            const industry = fields.filter(f => f.category === 'industry' || 
              (!f.category && !['name', 'email', 'phone', 'address', 'contact_person'].includes(f.name)));
            const equipment = fields.filter(f => f.category === 'equipment');

            setPersonalFields(personal.length > 0 ? personal : defaultPersonal);
            setIndustryFields(industry);
            setEquipmentFields(equipment);
          }
        }
      } catch (error) {
        console.error('Error fetching industry template:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserIndustryAndTemplate();
  }, [user]);

  const getAllFields = () => {
    return [...personalFields, ...industryFields, ...equipmentFields];
  };

  const getTableColumns = () => {
    // Return key fields that should be displayed in the table
    const keyFields = getAllFields().filter(field => 
      ['name', 'email', 'phone', 'company_name', 'client_name', 'business_name', 
       'printer_brand', 'equipment_brand', 'service_type'].includes(field.name)
    );
    
    return keyFields.length > 0 ? keyFields : personalFields.slice(0, 3);
  };

  return {
    template,
    personalFields,
    industryFields,
    equipmentFields,
    allFields: getAllFields(),
    tableColumns: getTableColumns(),
    userIndustry,
    isLoading
  };
};
