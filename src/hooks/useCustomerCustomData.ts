
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface AppliedTemplate {
  id: string;
  name: string;
  industry: string;
}

interface TemplateField {
  id: string;
  field_name: string;
  field_label: string;
  field_type: string;
  field_options?: any;
  is_required: boolean;
  display_order: number;
  category?: 'personal' | 'equipment' | 'business';
}

interface CustomData {
  id: string;
  field_id: string;
  field_value: string;
  customer_id: string;
  template_field?: TemplateField;
}

interface Equipment {
  id: string;
  equipment_type: string;
  brand: string;
  model: string;
  serial_number: string;
  status: string;
  technical_issues?: string;
  notes?: string;
}

export const useCustomerCustomData = (customerId: string) => {
  const [appliedTemplates, setAppliedTemplates] = useState<AppliedTemplate[]>([]);
  const [templateFields, setTemplateFields] = useState<TemplateField[]>([]);
  const [customData, setCustomData] = useState<CustomData[]>([]);
  const [equipmentData, setEquipmentData] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (customerId && user) {
      loadCustomerData();
    }
  }, [customerId, user]);

  const loadCustomerData = async () => {
    setLoading(true);
    try {
      // Load applied templates
      const { data: templates, error: templatesError } = await supabase
        .from('customer_templates')
        .select(`
          template_id,
          industry_templates (
            id,
            name,
            industry
          )
        `)
        .eq('customer_id', customerId)
        .eq('user_id', user!.id);

      if (templatesError) throw templatesError;

      const appliedTemplatesList = (templates || [])
        .filter(t => t.industry_templates)
        .map(t => ({
          id: t.industry_templates.id,
          name: t.industry_templates.name,
          industry: t.industry_templates.industry
        }));

      setAppliedTemplates(appliedTemplatesList);

      // Load template fields for applied templates
      if (appliedTemplatesList.length > 0) {
        const templateIds = appliedTemplatesList.map(t => t.id);
        const { data: fields, error: fieldsError } = await supabase
          .from('template_fields')
          .select('*')
          .in('template_id', templateIds)
          .order('display_order');

        if (fieldsError) throw fieldsError;

        // Categorize fields based on template type and field names
        const categorizedFields = (fields || []).map(field => {
          let category: 'personal' | 'equipment' | 'business' = 'business';
          
          // Determine category based on field names for Printer Service Company
          const fieldName = field.field_name.toLowerCase();
          const isPersonalField = [
            'company_name', 'contact_person', 'phone', 'email', 
            'address', 'city', 'postal_code'
          ].some(name => fieldName.includes(name));
          
          const isEquipmentField = [
            'brand', 'model', 'serial', 'printer_type', 
            'fault_details', 'maintenance'
          ].some(name => fieldName.includes(name));

          if (isPersonalField) {
            category = 'personal';
          } else if (isEquipmentField) {
            category = 'equipment';
          }

          return {
            ...field,
            category
          };
        });

        setTemplateFields(categorizedFields);

        // Load custom data for non-equipment fields
        const nonEquipmentFieldIds = categorizedFields
          .filter(f => f.category !== 'equipment')
          .map(f => f.id);

        if (nonEquipmentFieldIds.length > 0) {
          const { data: customDataResult, error: customDataError } = await supabase
            .from('customer_custom_data')
            .select('*')
            .eq('customer_id', customerId)
            .eq('user_id', user!.id)
            .in('field_id', nonEquipmentFieldIds);

          if (customDataError) throw customDataError;

          const enrichedCustomData = (customDataResult || []).map(item => ({
            ...item,
            template_field: categorizedFields.find(field => field.id === item.field_id)
          }));

          setCustomData(enrichedCustomData);
        }
      }

      // Load equipment data separately
      const { data: equipment, error: equipmentError } = await supabase
        .from('customer_equipment')
        .select('*')
        .eq('customer_id', customerId)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (equipmentError) throw equipmentError;
      setEquipmentData(equipment || []);

    } catch (error) {
      console.error('Error loading customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCustomData = async (fieldId: string, value: string) => {
    if (!user) return false;

    try {
      const existingData = customData.find(item => item.field_id === fieldId);

      if (existingData) {
        const { error } = await supabase
          .from('customer_custom_data')
          .update({ field_value: value, updated_at: new Date().toISOString() })
          .eq('id', existingData.id);

        if (error) throw error;

        setCustomData(prev => prev.map(item =>
          item.id === existingData.id
            ? { ...item, field_value: value }
            : item
        ));
      } else {
        const { data: newData, error } = await supabase
          .from('customer_custom_data')
          .insert({
            customer_id: customerId,
            user_id: user.id,
            field_id: fieldId,
            field_value: value
          })
          .select()
          .single();

        if (error) throw error;

        const templateField = templateFields.find(f => f.id === fieldId);
        setCustomData(prev => [...prev, {
          ...newData,
          template_field: templateField
        }]);
      }

      return true;
    } catch (error) {
      console.error('Error saving custom data:', error);
      return false;
    }
  };

  return {
    appliedTemplates,
    templateFields,
    customData,
    equipmentData,
    loading,
    saveCustomData,
    refreshData: loadCustomerData
  };
};
