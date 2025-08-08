
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

interface CompanyProfile {
  company: string;
  company_email?: string;
  company_phone?: string;
  company_address?: string;
  industry?: string;
  company_logo_url?: string;
}

export const useCompanyProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('company, company_email, company_phone, company_address, industry, company_logo_url')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching company profile:', error);
          setProfile(null);
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching company profile:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const updateCompanyProfile = async (updates: Partial<CompanyProfile>) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      toast({
        title: 'Success',
        description: 'Company profile updated successfully.',
      });
    } catch (error: any) {
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
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ company_logo_url: logoUrl })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, company_logo_url: logoUrl } : null);
      toast({
        title: 'Success',
        description: 'Company logo updated successfully.',
      });
    } catch (error: any) {
      console.error('Error updating company logo:', error);
      toast({
        title: 'Error',
        description: 'Failed to update company logo.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    profile, 
    loading, 
    isLoading,
    updateCompanyProfile,
    updateCompanyLogo
  };
};
