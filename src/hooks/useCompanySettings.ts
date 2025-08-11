
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const SETTINGS_QUERY_KEY = 'company_settings';

// Function to fetch a specific setting
const fetchSetting = async (key: string, userId: string) => {
    const { data, error } = await supabase
        .from('company_settings')
        .select('value')
        .eq('key', key)
        .eq('user_id', userId)
        .maybeSingle();

    if (error) {
        console.error('Error fetching setting:', error);
        throw new Error(error.message);
    }
    return data ? data.value : null;
};

// Function to update or insert a setting
const upsertSetting = async ({ key, value, userId }: { key: string; value: any; userId: string }) => {
    const { data, error } = await supabase
        .from('company_settings')
        .upsert({ key, value, user_id: userId }, { onConflict: 'key,user_id' })
        .select()
        .maybeSingle();
    
    if (error) {
        console.error('Error upserting setting:', error);
        throw new Error(error.message);
    }

    return data;
};

export const useCompanySetting = (key: string) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { user } = useAuth();

    const { data, isLoading, error } = useQuery({
        queryKey: [SETTINGS_QUERY_KEY, key, user?.id],
        queryFn: () => user ? fetchSetting(key, user.id) : Promise.resolve(null),
        retry: false,
        enabled: !!user,
    });

    const { mutateAsync: updateSetting, isPending: isUpdating } = useMutation({
        mutationFn: (value: any) => {
            if (!user) throw new Error('User not authenticated');
            return upsertSetting({ key, value: { value }, userId: user.id });
        },
        onSuccess: (data) => {
            toast({
                title: 'Setting Saved',
                description: `The setting has been updated successfully.`,
            });
            // The type of data.value is Json, which is too broad for TypeScript to know it has a 'value' property.
            // Casting to `any` and using optional chaining resolves the type error safely.
            queryClient.setQueryData([SETTINGS_QUERY_KEY, key, user?.id], { value: (data.value as any)?.value });
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
