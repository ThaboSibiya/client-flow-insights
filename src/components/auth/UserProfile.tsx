
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useEmployeeAuth } from '@/hooks/useEmployeeAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, Crown, Shield } from 'lucide-react';

const UserProfile = () => {
  const { user, signOut } = useAuth();
  const { employeeProfile, isCompanyOwner, loading } = useEmployeeAuth();
  
  if (!user) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  const getUserDisplayName = () => {
    if (employeeProfile) {
      return `${employeeProfile.first_name} ${employeeProfile.last_name}`;
    }
    return user.email?.split('@')[0] || 'User';
  };

  const getRoleIcon = () => {
    if (isCompanyOwner) return <Crown className="h-3 w-3" />;
    if (employeeProfile?.role === 'admin') return <Shield className="h-3 w-3" />;
    return <User className="h-3 w-3" />;
  };

  const getRoleDisplay = () => {
    if (isCompanyOwner) return 'Company Owner';
    return employeeProfile?.role ? employeeProfile.role.charAt(0).toUpperCase() + employeeProfile.role.slice(1) : 'User';
  };

  const getRoleBadgeVariant = () => {
    if (isCompanyOwner) return 'default';
    if (employeeProfile?.role === 'admin') return 'secondary';
    return 'outline';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center space-y-3 border-t border-quikle-silver/20 pt-4 animate-pulse">
        <div className="w-12 h-12 rounded-full bg-quikle-crystal"></div>
        <div className="text-center space-y-2">
          <div className="h-4 w-32 bg-quikle-crystal rounded"></div>
          <div className="h-3 w-20 bg-quikle-crystal rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-surface rounded-xl p-4 mx-2 mb-2 border border-quikle-silver/20">
      {/* Premium Header */}
      <div className="flex items-center space-x-3 mb-4">
        <Avatar className="h-12 w-12 ring-2 ring-quikle-primary/20 ring-offset-2">
          <AvatarImage src="" alt={getUserDisplayName()} />
          <AvatarFallback className="bg-gradient-to-r from-quikle-primary to-quikle-secondary text-white font-semibold text-sm">
            {getInitials(getUserDisplayName())}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-quikle-charcoal truncate text-sm">
            {getUserDisplayName()}
          </p>
          <p className="text-xs text-quikle-slate truncate">
            {user.email}
          </p>
        </div>
      </div>

      {/* Role and Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <Badge variant={getRoleBadgeVariant()} className="text-xs font-medium">
            {getRoleIcon()}
            <span className="ml-1">{getRoleDisplay()}</span>
          </Badge>
        </div>

        {employeeProfile && (
          <div className="space-y-2 text-xs">
            {employeeProfile.title && (
              <div className="flex justify-between items-center">
                <span className="text-quikle-slate">Title:</span>
                <span className="font-medium text-quikle-charcoal truncate max-w-24">
                  {employeeProfile.title}
                </span>
              </div>
            )}
            
            {employeeProfile.department && (
              <div className="flex justify-between items-center">
                <span className="text-quikle-slate">Department:</span>
                <span className="font-medium text-quikle-charcoal truncate max-w-24">
                  {employeeProfile.department}
                </span>
              </div>
            )}
            
            {employeeProfile.employee_number && (
              <div className="flex justify-between items-center">
                <span className="text-quikle-slate">ID:</span>
                <span className="font-medium text-quikle-charcoal">
                  {employeeProfile.employee_number}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Premium Sign Out Button */}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={signOut} 
        className="w-full text-xs border-quikle-silver/30 hover:bg-quikle-crystal/50 hover:border-quikle-primary/30 transition-all duration-300 group"
      >
        <LogOut className="mr-2 h-3 w-3 group-hover:text-quikle-primary transition-colors" />
        Sign Out
      </Button>
    </div>
  );
};

export default UserProfile;
