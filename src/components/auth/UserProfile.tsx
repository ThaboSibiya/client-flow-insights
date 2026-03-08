import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useEmployeeAuth } from '@/hooks/useEmployeeAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Crown, Shield, User, Settings, ChevronUp } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

const UserProfile: React.FC = () => {
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { employeeProfile, isCompanyOwner, loading: employeeLoading } = useEmployeeAuth();
  const navigate = useNavigate();

  const loading = profileLoading || employeeLoading;

  if (!user) return null;

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

  const getRoleLabel = () => {
    if (isCompanyOwner) return 'Owner';
    if (employeeProfile?.role === 'admin') return 'Admin';
    return employeeProfile?.role || 'Member';
  };

  const displayName = getDisplayName();
  const avatarUrl = profile?.avatar_url || '';
  const roleLabel = getRoleLabel();

  if (loading) {
    return (
      <div className="px-2 py-1.5 animate-pulse">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-muted" />
          <div className="flex-1 space-y-1">
            <div className="h-3.5 w-20 bg-muted rounded" />
            <div className="h-2.5 w-14 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate leading-tight">
              {displayName}
            </p>
            <p className="text-[11px] text-muted-foreground truncate leading-tight">
              {roleLabel}
            </p>
          </div>

          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="top"
        align="start"
        sideOffset={8}
        className="w-[--radix-dropdown-menu-trigger-width] min-w-[200px]"
      >
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium text-foreground">{displayName}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => navigate('/settings')}
          className="gap-2 cursor-pointer"
        >
          <Settings className="h-4 w-4" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={signOut}
          className="gap-2 cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;
