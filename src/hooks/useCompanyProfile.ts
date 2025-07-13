
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

interface CompanyProfile {
  id: string;
  company: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  company_logo_url: string;
}

export const useCompanyProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, company, company_address, company_phone, company_email, company_logo_url')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfile(data as CompanyProfile);
    } catch (error) {
      console.error('Error fetching company profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCompanyProfile = async (profileData: Partial<CompanyProfile>) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setProfile(prev => prev ? { ...prev, ...profileData } : null);
      
      toast({
        title: 'Success',
        description: 'Company profile updated successfully.',
      });
    } catch (error) {
      console.error('Error updating company profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update company profile.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCompanyLogo = async (logoUrl: string) => {
    return updateCompanyProfile({ company_logo_url: logoUrl });
  };

  return { 
    profile, 
    loading, 
    isLoading,
    refetch: fetchProfile,
    updateCompanyProfile,
    updateCompanyLogo
  };
};
