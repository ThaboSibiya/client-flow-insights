
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CustomDataService } from '@/services/customDataService';
import { EnhancedCustomer, IndustryTemplate } from '@/types/customData';

export const useCustomerTemplates = (customerId?: string) => {
  const [enhancedCustomer, setEnhancedCustomer] = useState<EnhancedCustomer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadCustomerData = async () => {
    if (!customerId || !user) return;

    setLoading(true);
    setError(null);
    try {
      const data = await CustomDataService.getEnhancedCustomer(customerId, user.id);
      setEnhancedCustomer(data);
    } catch (err: any) {
      console.error('Error loading customer data:', err);
      setError(err.message || 'Failed to load customer data');
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = async (templateId: string) => {
    if (!customerId || !user) return;

    try {
      await CustomDataService.applyTemplateToCustomer(customerId, templateId, user.id);
      await loadCustomerData(); // Reload to get updated data
    } catch (err: any) {
      throw new Error(err.message || 'Failed to apply template');
    }
  };

  const removeTemplate = async (templateId: string) => {
    if (!customerId || !user) return;

    try {
      await CustomDataService.removeTemplateFromCustomer(customerId, templateId, user.id);
      await loadCustomerData(); // Reload to get updated data
    } catch (err: any) {
      throw new Error(err.message || 'Failed to remove template');
    }
  };

  useEffect(() => {
    loadCustomerData();
  }, [customerId, user]);

  return {
    enhancedCustomer,
    loading,
    error,
    refetch: loadCustomerData,
    applyTemplate,
    removeTemplate
  };
};
