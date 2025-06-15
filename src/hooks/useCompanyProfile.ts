
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useCompanyProfile = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const queryKey = ['company_profile', user?.id];

    const { data: profile, isLoading, error } = useQuery({
        queryKey,
        queryFn: async () => {
            if (!user) return null;
            const { data, error } = await supabase
                .from('profiles')
                .select('company_logo_url')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') { // Ignore error if no profile exists yet
                console.error('Error fetching company profile:', error);
                throw new Error(error.message);
            }
            return data;
        },
        enabled: !!user,
    });

    const updateLogoMutation = useMutation({
        mutationFn: async (logoUrl: string) => {
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('profiles')
                .update({ company_logo_url: logoUrl, updated_at: new Date().toISOString() })
                .eq('id', user.id)
                .select()
                .single();
            
            if (error) {
                console.error('Error updating company logo:', error);
                // If profile doesn't exist, create it.
                if (error.code === 'PGRST116') {
                    const { data: newData, error: insertError } = await supabase
                        .from('profiles')
                        .insert({ id: user.id, company_logo_url: logoUrl })
                        .select()
                        .single();
                    if (insertError) {
                        console.error('Error creating company profile:', insertError);
                        throw new Error(insertError.message);
                    }
                    return newData;
                }
                throw new Error(error.message);
            }
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: `Failed to update logo: ${error.message}`,
                variant: 'destructive',
            });
        }
    });

    return {
        companyLogoUrl: profile?.company_logo_url,
        isLoading,
        error,
        updateCompanyLogo: updateLogoMutation.mutateAsync,
    };
};
