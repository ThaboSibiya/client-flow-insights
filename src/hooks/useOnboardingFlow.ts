import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface CompanyProfile {
  company: string | null;
  industry: string | null;
  employee_count: number | null;
  business_type: string | null;
  onboarding_completed: boolean | null;
}

export const useOnboardingFlow = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<'company' | 'customer' | 'complete'>('company');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('company, industry, employee_count, business_type, onboarding_completed')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
          setProfile(null);
        } else {
          setProfile(data || {
            company: null,
            industry: null,
            employee_count: null,
            business_type: null,
            onboarding_completed: false,
          });

          // Determine the current step based on profile data
          if (!data || !data.onboarding_completed) {
            if (!data || !data.company || !data.industry) {
              setCurrentStep('company');
            } else {
              setCurrentStep('customer');
            }
          } else {
            setCurrentStep('complete');
          }
        }
      } catch (error) {
        console.error('Error in fetchProfile:', error);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const needsOnboarding = () => {
    return !profile?.onboarding_completed;
  };

  const refreshProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('company, industry, employee_count, business_type, onboarding_completed')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error refreshing profile:', error);
      } else {
        setProfile(data || {
          company: null,
          industry: null,
          employee_count: null,
          business_type: null,
          onboarding_completed: false,
        });
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  return {
    profile,
    isLoading,
    needsOnboarding,
    currentStep,
    setCurrentStep,
    refreshProfile,
  };
};