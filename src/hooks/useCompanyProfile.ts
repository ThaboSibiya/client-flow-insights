import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface CompanyProfileData {
  company?: string | null;
  company_address?: string | null;
  company_email?: string | null;
  company_phone?: string | null;
}

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
                .select('company, company_address, company_email, company_phone, company_logo_url')
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

    const updateProfileMutation = useMutation({
        mutationFn: async (profileData: Partial<CompanyProfileData>) => {
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('profiles')
                .update({ ...profileData, updated_at: new Date().toISOString() })
                .eq('id', user.id)
                .select()
                .single();
            
            if (error) {
                console.error('Error updating company profile:', error);
                if (error.code === 'PGRST116') {
                    const { data: newData, error: insertError } = await supabase
                        .from('profiles')
                        .insert({ id: user.id, ...profileData })
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
                description: `Failed to update profile: ${error.message}`,
                variant: 'destructive',
            });
        }
    });

    return {
        profile,
        isLoading,
        error,
        updateCompanyLogo: updateLogoMutation.mutateAsync,
        updateCompanyProfile: updateProfileMutation.mutateAsync,
    };
};
