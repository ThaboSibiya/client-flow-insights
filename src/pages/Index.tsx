 import React from 'react';
 import { useNavigate } from 'react-router-dom';
 import { useAuth } from '@/context/AuthContext';
import { useEmployeeAuth } from '@/hooks/useEmployeeAuth';
 import { Button } from '@/components/ui/button';
 import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowRight, 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings,
  TrendingUp,
  Crown,
  Shield,
  User
} from 'lucide-react';
import quikleLogo from '@/assets/quikle-logo.png';

const Index = () => {
  const { user } = useAuth();
  const { employeeProfile, isCompanyOwner, loading } = useEmployeeAuth();
   const navigate = useNavigate();
 
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
    return null;
  };

  const getRoleInfo = () => {
    if (isCompanyOwner) return { label: 'Owner', icon: Crown, color: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white' };
    if (employeeProfile?.role === 'admin') return { label: 'Admin', icon: Shield, color: 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground' };
    if (employeeProfile?.role === 'manager') return { label: 'Manager', icon: User, color: 'bg-secondary text-secondary-foreground' };
    return { label: employeeProfile?.role || 'Team', icon: User, color: 'bg-muted text-muted-foreground' };
  };

  const userName = getUserFirstName();
  const role = getRoleInfo();
  const RoleIcon = role.icon;

   const quickLinks = [
    { 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      path: '/dashboard', 
      description: 'Business overview',
      gradient: 'from-quikle-primary to-quikle-secondary'
    },
    { 
      label: 'Customers', 
      icon: Users, 
      path: '/customers', 
      description: 'Manage clients',
      gradient: 'from-quikle-info to-quikle-blue'
    },
    { 
      label: 'Quotes', 
      icon: FileText, 
      path: '/quotes', 
      description: 'Quotes & invoices',
      gradient: 'from-quikle-success to-emerald-600'
    },
    { 
      label: 'Settings', 
      icon: Settings, 
      path: '/settings', 
      description: 'Configure account',
      gradient: 'from-quikle-slate to-quikle-accent'
    },
   ];
 
  return (
    <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 relative overflow-hidden">
      {/* Sophisticated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-primary/8 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-gradient-to-tr from-quikle-info/8 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
      </div>

      <div className="container max-w-2xl mx-auto px-4 text-center space-y-6 relative z-10">
        {/* Hero Section */}
        <div className="space-y-3 animate-fade-in">
          {loading ? (
            <div className="space-y-3 flex flex-col items-center">
              <Skeleton className="h-10 w-72" />
              <Skeleton className="h-5 w-40" />
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-1">
                <img src={quikleLogo} alt="Quikle Logo" className="h-14 w-14 object-contain drop-shadow-md" />
              </div>
              <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase">
                Welcome to Quikle
              </p>
              
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                  {getGreeting()}
                </span>
                {userName && (
                  <span className="bg-gradient-to-r from-quikle-primary to-quikle-info bg-clip-text text-transparent">
                    , {userName}
                  </span>
                )}
              </h1>

              {userName && (
                <div className="flex justify-center pt-1">
                  <Badge className={`${role.color} shadow-sm px-2.5 py-0.5 text-xs`}>
                    <RoleIcon className="h-3 w-3 mr-1" />
                    {role.label}
                  </Badge>
                </div>
              )}

              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                {userName 
                  ? "Your command center awaits. Where would you like to start?"
                  : "Premium business management designed for professionals."}
              </p>
            </>
          )}
         </div>
 
        {/* Navigation Grid */}
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
           {quickLinks.map((link) => {
             const Icon = link.icon;
             return (
               <Card
                 key={link.path}
                 className="group relative p-4 cursor-pointer border-border/40 bg-card/80 backdrop-blur-sm hover:border-primary/30 hover:shadow-md transition-all duration-300 overflow-hidden"
                 onClick={() => navigate(link.path)}
               >
                {/* Hover gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${link.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                 <div className="relative flex flex-col items-center gap-2 text-center">
                   <div className={`p-2 rounded-lg bg-gradient-to-br ${link.gradient} shadow-sm group-hover:shadow-md transition-shadow`}>
                     <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                     <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors block">
                      {link.label}
                    </span>
                     <span className="text-[10px] text-muted-foreground block">
                      {link.description}
                    </span>
                  </div>
                 </div>
               </Card>
             );
           })}
         </div>
 
        {/* CTA */}
        <div className="pt-2">
          <Button
            size="default"
            className="gap-2 px-6 shadow-md hover:shadow-lg transition-all duration-300"
            onClick={() => navigate('/dashboard')}
          >
            <TrendingUp className="h-4 w-4" />
            Go to Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
       </div>
     </div>
  );
};

export default Index;
