import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useEmployeeAuth } from '@/hooks/useEmployeeAuth';
import { Badge } from '@/components/ui/badge';
import { Crown, Shield, User, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface WelcomeHeaderProps {
  subtitle?: string;
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ 
  subtitle = "Monitor your business performance at a glance" 
}) => {
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
      // Capitalize first letter
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return 'there';
  };

  const getRoleDisplay = () => {
    if (isCompanyOwner) return { label: 'Owner', icon: Crown, color: 'bg-gradient-to-r from-amber-500 to-amber-600' };
    if (employeeProfile?.role === 'admin') return { label: 'Admin', icon: Shield, color: 'bg-gradient-to-r from-quikle-primary to-quikle-secondary' };
    if (employeeProfile?.role === 'manager') return { label: 'Manager', icon: User, color: 'bg-gradient-to-r from-quikle-secondary to-quikle-accent' };
    return { label: employeeProfile?.role || 'Team Member', icon: User, color: 'bg-quikle-slate' };
  };

  if (loading) {
    return (
      <div className="mb-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
    );
  }

  const role = getRoleDisplay();
  const RoleIcon = role.icon;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-quikle-primary via-quikle-secondary to-quikle-accent bg-clip-text text-transparent drop-shadow-lg">
          {getGreeting()}, {getUserFirstName()}!
        </h1>
        <Badge className={`${role.color} text-white border-0 shadow-sm`}>
          <RoleIcon className="h-3 w-3 mr-1" />
          {role.label}
        </Badge>
        <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
      </div>
      <p className="text-quikle-charcoal/70 font-medium mt-1">{subtitle}</p>
    </div>
  );
};

export default WelcomeHeader;
