
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

interface RevenueOptimizationSettings {
  auto_create_invoice_from_quote: boolean;
  mark_overdue_after_days: number;
  payment_reminder_enabled: boolean;
  payment_reminder_days: number[];
  overdue_notification_enabled: boolean;
  finance_team_email: string;
  upsell_triggers_enabled: boolean;
  high_value_threshold: number;
  repeat_customer_threshold: number;
  reminder_template: string;
}

export const useRevenueOptimizationSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<RevenueOptimizationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const defaultSettings: RevenueOptimizationSettings = {
    auto_create_invoice_from_quote: false,
    mark_overdue_after_days: 30,
    payment_reminder_enabled: true,
    payment_reminder_days: [3, 7, 14, 30],
    overdue_notification_enabled: true,
    finance_team_email: 'finance@company.com',
    upsell_triggers_enabled: true,
    high_value_threshold: 10000,
    repeat_customer_threshold: 3,
    reminder_template: 'Hi [Customer Name],\n\nThis is a friendly reminder about your pending invoice.\n\nPlease let us know if you have any questions.\n\nBest regards,\n[Your Name]',
  };

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('company_settings')
        .select('value')
        .eq('key', 'revenue_optimization_settings')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading revenue optimization settings:', error);
        setSettings(defaultSettings);
        return;
      }

      if (data?.value && typeof data.value === 'object') {
        setSettings({ ...defaultSettings, ...(data.value as Partial<RevenueOptimizationSettings>) });
      } else {
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error loading revenue optimization settings:', error);
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<RevenueOptimizationSettings>) => {
    if (!user || !settings) return;

    try {
      setIsUpdating(true);
      const updatedSettings = { ...settings, ...newSettings };

      const { error } = await supabase
        .from('company_settings')
        .upsert({
          key: 'revenue_optimization_settings',
          value: updatedSettings,
        });

      if (error) {
        console.error('Error updating revenue optimization settings:', error);
        toast({
          title: "Error",
          description: "Failed to update revenue optimization settings.",
          variant: "destructive",
        });
        return;
      }

      setSettings(updatedSettings);
      toast({
        title: "Settings Updated",
        description: "Revenue optimization settings have been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating revenue optimization settings:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating settings.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    settings,
    updateSettings,
    isLoading,
    isUpdating,
  };
};
