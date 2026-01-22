import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface ProfileData {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  avatar_url: string | null;
  company_logo_url: string | null;
  company_address: string | null;
  company_email: string | null;
  company_phone: string | null;
  industry: string | null;
}

interface CompletionStep {
  id: string;
  label: string;
  completed: boolean;
  field: keyof ProfileData | 'name';
  priority: 'required' | 'recommended' | 'optional';
}

export const useProfileCompletion = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, phone, company, avatar_url, company_logo_url, company_address, company_email, company_phone, industry')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const refetch = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  const completionSteps: CompletionStep[] = useMemo(() => {
    if (!profile) return [];

    const hasFirstName = !!profile.first_name?.trim();
    const hasLastName = !!profile.last_name?.trim();

    return [
      {
        id: 'name',
        label: 'Add your name',
        // Treat a single-part name as valid (users may not have/enter a last name).
        completed: hasFirstName || hasLastName,
        field: 'name',
        priority: 'required'
      },
      {
        id: 'avatar',
        label: 'Upload profile photo',
        completed: !!profile.avatar_url,
        field: 'avatar_url',
        priority: 'recommended'
      },
      {
        id: 'phone',
        label: 'Add phone number',
        completed: !!profile.phone,
        field: 'phone',
        priority: 'recommended'
      },
      {
        id: 'company',
        label: 'Set company name',
        completed: !!profile.company,
        field: 'company',
        priority: 'required'
      },
      {
        id: 'company_logo',
        label: 'Upload company logo',
        completed: !!profile.company_logo_url,
        field: 'company_logo_url',
        priority: 'optional'
      },
      {
        id: 'industry',
        label: 'Select industry',
        completed: !!profile.industry,
        field: 'industry',
        priority: 'recommended'
      },
      {
        id: 'company_address',
        label: 'Add business address',
        completed: !!profile.company_address,
        field: 'company_address',
        priority: 'optional'
      },
      {
        id: 'company_contact',
        label: 'Add company contact',
        completed: !!(profile.company_email || profile.company_phone),
        field: 'company_email',
        priority: 'optional'
      }
    ];
  }, [profile]);

  const completionPercentage = useMemo(() => {
    if (completionSteps.length === 0) return 0;
    
    // Weight required fields more heavily
    let totalWeight = 0;
    let completedWeight = 0;
    
    completionSteps.forEach(step => {
      const weight = step.priority === 'required' ? 3 : step.priority === 'recommended' ? 2 : 1;
      totalWeight += weight;
      if (step.completed) {
        completedWeight += weight;
      }
    });

    return Math.round((completedWeight / totalWeight) * 100);
  }, [completionSteps]);

  const incompleteSteps = useMemo(() => {
    return completionSteps
      .filter(step => !step.completed)
      .sort((a, b) => {
        const priorityOrder = { required: 0, recommended: 1, optional: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }, [completionSteps]);

  // More robust than relying on a rounded percentage.
  const isComplete = completionSteps.length > 0 && completionSteps.every(step => step.completed);

  return {
    profile,
    loading,
    completionSteps,
    completionPercentage,
    incompleteSteps,
    isComplete,
    refetch
  };
};
