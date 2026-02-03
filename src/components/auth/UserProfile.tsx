import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useEmployeeAuth } from '@/hooks/useEmployeeAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Crown, Shield, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const UserProfile: React.FC = () => {
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { employeeProfile, isCompanyOwner, loading: employeeLoading } = useEmployeeAuth();
  
  const loading = profileLoading || employeeLoading;
  
  if (!user) return null;

  // Get display name from profile first, then employee, then email
  const getDisplayName = () => {
    if (profile?.first_name || profile?.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    if (employeeProfile) {
      return `${employeeProfile.first_name} ${employeeProfile.last_name}`;
    }
    return user.email?.split('@')[0] || 'User';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleConfig = () => {
    if (isCompanyOwner) {
      return {
        label: 'Owner',
        icon: Crown,
        className: 'bg-primary/10 text-primary border-primary/20'
      };
    }
    if (employeeProfile?.role === 'admin') {
      return {
        label: 'Admin',
        icon: Shield,
        className: 'bg-amber-500/10 text-amber-600 border-amber-500/20'
      };
    }
    return {
      label: employeeProfile?.role || 'Member',
      icon: User,
      className: 'bg-muted text-muted-foreground border-border'
    };
  };

  const displayName = getDisplayName();
  const avatarUrl = profile?.avatar_url || '';
  const roleConfig = getRoleConfig();
  const RoleIcon = roleConfig.icon;

  if (loading) {
    return (
      <div className="p-3 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-muted" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-24 bg-muted rounded" />
            <div className="h-2.5 w-16 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">
      {/* Compact Profile Card */}
      <div className="rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        {/* User Info Row */}
        <div className="p-3 flex items-center gap-3">
          <Avatar className="h-9 w-9 ring-2 ring-primary/10 ring-offset-1 ring-offset-background">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xs font-semibold">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground truncate leading-tight">
              {displayName}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={cn(
                "inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border",
                roleConfig.className
              )}>
                <RoleIcon className="h-2.5 w-2.5" />
                {roleConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* Sign Out - Subtle Divider */}
        <div className="border-t border-border/30">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={signOut} 
            className="w-full h-8 rounded-none text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <LogOut className="mr-1.5 h-3 w-3" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
