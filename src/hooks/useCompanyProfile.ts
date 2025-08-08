
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface CompanyProfile {
  company: string;
  company_email?: string;
  company_phone?: string;
  company_address?: string;
  industry?: string;
}

export const useCompanyProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('company, company_email, company_phone, company_address, industry')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // Not found is ok
          console.error('Error fetching company profile:', error);
        } else if (data) {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching company profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return { profile, loading };
};
