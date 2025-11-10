import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, Play } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AutomationSettings {
  enabled: boolean;
  first_reminder_days: number;
  second_reminder_days: number;
  final_notice_days: number;
  auto_collection_days: number;
}

const ReminderAutomationSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [settings, setSettings] = useState<AutomationSettings>({
    enabled: true,
    first_reminder_days: 7,
    second_reminder_days: 14,
    final_notice_days: 30,
    auto_collection_days: 60,
  });

  // Fetch automation settings
  const { data: savedSettings } = useQuery({
    queryKey: ['reminder-automation-settings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('user_id', user!.id)
        .eq('key', 'reminder_automation')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (!data?.value) return null;
      return data.value as unknown as AutomationSettings;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (savedSettings) {
      setSettings(savedSettings);
    }
  }, [savedSettings]);

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: AutomationSettings) => {
      // Check if setting exists
      const { data: existing } = await supabase
        .from('company_settings')
        .select('id')
        .eq('user_id', user!.id)
        .eq('key', 'reminder_automation')
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('company_settings')
          .update({ value: newSettings as any })
          .eq('user_id', user!.id)
          .eq('key', 'reminder_automation');
        
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('company_settings')
          .insert({
            user_id: user!.id,
            key: 'reminder_automation',
            value: newSettings as any,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminder-automation-settings'] });
      toast({
        title: 'Settings Saved',
        description: 'Automation settings have been updated successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Test automation mutation
  const testAutomationMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('finance-auto-reminder-scheduler');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Automation Test Complete',
        description: `Processed ${data.results?.processed || 0} invoices, sent ${data.results?.reminders_sent || 0} reminders.`,
      });
    },
    onError: () => {
      toast({
        title: 'Test Failed',
        description: 'Failed to run automation test. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    saveSettingsMutation.mutate(settings);
  };

  const handleTest = () => {
    testAutomationMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Automated Reminder Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable */}
        <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
          <div className="flex-1">
            <Label htmlFor="automation-enabled" className="text-base font-semibold">
              Enable Automated Reminders
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Automatically send payment reminders based on overdue days
            </p>
          </div>
          <Switch
            id="automation-enabled"
            checked={settings.enabled}
            onCheckedChange={(enabled) => setSettings({ ...settings, enabled })}
          />
        </div>

        {/* Reminder Intervals */}
        <div className="space-y-4">
          <h4 className="font-semibold">Reminder Intervals</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-reminder">First Reminder (Days Overdue)</Label>
              <Input
                id="first-reminder"
                type="number"
                min="1"
                value={settings.first_reminder_days}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  first_reminder_days: parseInt(e.target.value) || 7 
                })}
              />
              <p className="text-xs text-muted-foreground">
                Friendly payment reminder
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="second-reminder">Second Reminder (Days Overdue)</Label>
              <Input
                id="second-reminder"
                type="number"
                min="1"
                value={settings.second_reminder_days}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  second_reminder_days: parseInt(e.target.value) || 14 
                })}
              />
              <p className="text-xs text-muted-foreground">
                Overdue payment notice
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="final-notice">Final Notice (Days Overdue)</Label>
              <Input
                id="final-notice"
                type="number"
                min="1"
                value={settings.final_notice_days}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  final_notice_days: parseInt(e.target.value) || 30 
                })}
              />
              <p className="text-xs text-muted-foreground">
                Final warning before collection
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="auto-collection">Auto Collection (Days Overdue)</Label>
              <Input
                id="auto-collection"
                type="number"
                min="1"
                value={settings.auto_collection_days}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  auto_collection_days: parseInt(e.target.value) || 60 
                })}
              />
              <p className="text-xs text-muted-foreground">
                Flag for collection action
              </p>
            </div>
          </div>
        </div>

        {/* Information Box */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h5 className="font-semibold text-blue-900 mb-2">How It Works</h5>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>System checks for overdue invoices daily at midnight</li>
            <li>Reminders are sent automatically when invoices reach configured intervals</li>
            <li>Only one reminder per stage is sent within a 7-day period</li>
            <li>All sent reminders are logged in the reminder history</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={saveSettingsMutation.isPending}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            {saveSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
          
          <Button
            onClick={handleTest}
            disabled={testAutomationMutation.isPending}
            variant="outline"
            className="flex-1"
          >
            <Play className="h-4 w-4 mr-2" />
            {testAutomationMutation.isPending ? 'Running...' : 'Test Now'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReminderAutomationSettings;
