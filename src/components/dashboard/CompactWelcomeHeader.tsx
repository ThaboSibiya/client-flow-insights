import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useEmployeeAuth } from '@/hooks/useEmployeeAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Shield, User, HelpCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface CompactWelcomeHeaderProps {
  onStartTour?: () => void;
}

const CompactWelcomeHeader: React.FC<CompactWelcomeHeaderProps> = ({ onStartTour }) => {
  const { user } = useAuth();
  const { employeeProfile, isCompanyOwner, loading } = useEmployeeAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getUserFirstName = () => {
    if (employeeProfile?.first_name) {
      return employeeProfile.first_name;
    }
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return 'there';
  };

  const getRoleDisplay = () => {
    if (isCompanyOwner) return { label: 'Owner', icon: Crown, variant: 'default' as const };
    if (employeeProfile?.role === 'admin') return { label: 'Admin', icon: Shield, variant: 'secondary' as const };
    if (employeeProfile?.role === 'manager') return { label: 'Manager', icon: User, variant: 'outline' as const };
    return { label: employeeProfile?.role || 'Team', icon: User, variant: 'outline' as const };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-8 w-24" />
      </div>
    );
  }

  const role = getRoleDisplay();
  const RoleIcon = role.icon;

  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-foreground">
          {getGreeting()}, <span className="text-primary">{getUserFirstName()}</span>
        </h1>
        <Badge variant={role.variant} className="h-5 text-xs gap-1">
          <RoleIcon className="h-3 w-3" />
          {role.label}
        </Badge>
      </div>
      {onStartTour && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 text-xs text-muted-foreground hover:text-foreground"
          onClick={onStartTour}
        >
          <HelpCircle className="h-3.5 w-3.5 mr-1" />
          Tour
        </Button>
      )}
    </div>
  );
};

export default CompactWelcomeHeader;
