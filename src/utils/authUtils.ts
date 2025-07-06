
import { supabase } from '@/integrations/supabase/client';

export interface UserProfileStatus {
  needsOnboarding: boolean;
  redirectPath: string;
}

export const checkUserOnboardingStatus = async (userId: string): Promise<UserProfileStatus> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('company, industry, onboarding_completed')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user profile:', error);
      // If there's an error, default to onboarding as safe fallback
      return {
        needsOnboarding: true,
        redirectPath: '/company-onboarding'
      };
    }

    // Check if user needs to complete company onboarding
    const needsOnboarding = !profile || 
                           !profile.company || 
                           !profile.industry || 
                           !profile.onboarding_completed;

    return {
      needsOnboarding,
      redirectPath: needsOnboarding ? '/company-onboarding' : '/dashboard'
    };
  } catch (error) {
    console.error('Error checking user onboarding status:', error);
    return {
      needsOnboarding: true,
      redirectPath: '/company-onboarding'
    };
  }
};
