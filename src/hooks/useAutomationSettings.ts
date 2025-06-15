
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface AutomationSettingsData {
    email_auto_send?: boolean;
    email_template?: string;
    email_subject?: string | null;
    email_message?: string | null;
    whatsapp_enabled?: boolean;
    whatsapp_template?: string | null;
    follow_up_enabled?: boolean;
    first_follow_up_days?: number;
    second_follow_up_days?: number;
    final_follow_up_days?: number;
    reminder_template?: string | null;
    auto_create_invoice_from_quote?: boolean;
    send_on_create?: boolean;
    mark_overdue_after_days?: number;
}

export const useAutomationSettings = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const queryKey = ['automation_settings', user?.id];

    const { data: settings, isLoading, error } = useQuery({
        queryKey,
        queryFn: async () => {
            if (!user) return null;
            const { data, error } = await supabase
                .from('automation_settings')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') { // Ignore 'No rows found' error
                console.error('Error fetching automation settings:', error);
                throw new Error(error.message);
            }
            return data;
        },
        enabled: !!user,
    });

    const updateSettingsMutation = useMutation({
        mutationFn: async (settingsData: AutomationSettingsData) => {
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('automation_settings')
                .upsert({ ...settingsData, user_id: user.id, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
                .select()
                .single();
            
            if (error) {
                console.error('Error updating automation settings:', error);
                throw new Error(error.message);
            }
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            toast({
                title: 'Success',
                description: 'Automation settings saved successfully.',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: `Failed to save settings: ${error.message}`,
                variant: 'destructive',
            });
        }
    });

    return {
        settings,
        isLoading,
        error,
        updateSettings: updateSettingsMutation.mutateAsync,
        isUpdating: updateSettingsMutation.isPending,
    };
};
