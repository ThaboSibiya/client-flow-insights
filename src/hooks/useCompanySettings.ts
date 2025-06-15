
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const SETTINGS_QUERY_KEY = 'company_settings';

// Function to fetch a specific setting
const fetchSetting = async (key: string) => {
    const { data, error } = await supabase
        .from('company_settings')
        .select('value')
        .eq('key', key)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116: 'single' row not found
        console.error('Error fetching setting:', error);
        throw new Error(error.message);
    }
    return data ? data.value : null;
};

// Function to update or insert a setting
const upsertSetting = async ({ key, value }: { key: string; value: any }) => {
    const { data, error } = await supabase
        .from('company_settings')
        .upsert({ key, value }, { onConflict: 'key' })
        .select()
        .single();
    
    if (error) {
        console.error('Error upserting setting:', error);
        throw new Error(error.message);
    }

    return data;
};

export const useCompanySetting = (key: string) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data, isLoading, error } = useQuery({
        queryKey: [SETTINGS_QUERY_KEY, key],
        queryFn: () => fetchSetting(key),
        retry: false,
    });

    const { mutateAsync: updateSetting, isPending: isUpdating } = useMutation({
        mutationFn: (value: any) => upsertSetting({ key, value: { value } }),
        onSuccess: (data) => {
            toast({
                title: 'Setting Saved',
                description: `The setting has been updated successfully.`,
            });
            queryClient.setQueryData([SETTINGS_QUERY_KEY, key], { value: data.value.value });
        },
        onError: (err: Error) => {
            toast({
                title: 'Error Saving Setting',
                description: err.message,
                variant: 'destructive',
            });
        },
    });

    // The setting is nested in a 'value' property in the DB
    const settingValue = data ? (data as any).value : null;

    return {
        setting: settingValue,
        isLoading,
        error,
        updateSetting,
        isUpdating,
    };
};
