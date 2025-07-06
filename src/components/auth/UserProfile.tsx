
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

const UserProfile = () => {
  const { user, signOut } = useAuth();
  
  // Fetch user profile data
  const { data: profile } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, role, company')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  if (!user) return null;
  
  // Construct display name
  const displayName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}`
    : user.email?.split('@')[0] || 'User';
  
  // Get user title/role
  const userTitle = profile?.role || 'User';
  
  // Get user initials for avatar
  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase();
    }
    return user.email?.charAt(0).toUpperCase() || 'U';
  };
  
  return (
    <div className="flex flex-col items-center space-y-3 border-t border-gray-200 pt-4">
      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-quikle-primary to-quikle-accent flex items-center justify-center text-white font-medium">
        {getInitials()}
      </div>
      <div className="text-center">
        <p className="text-sm font-medium truncate max-w-[180px]" title={displayName}>
          {displayName}
        </p>
        <p className="text-xs text-gray-500" title={userTitle}>
          {userTitle}
        </p>
        {profile?.company && (
          <p className="text-xs text-gray-400 truncate max-w-[180px]" title={profile.company}>
            {profile.company}
          </p>
        )}
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={signOut} 
        className="text-xs w-full"
      >
        <LogOut className="mr-2 h-3 w-3" />
        Sign Out
      </Button>
    </div>
  );
};

export default UserProfile;
