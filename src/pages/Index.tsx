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
  Sparkles,
  TrendingUp,
  Zap,
  Crown,
  Shield,
  User
} from 'lucide-react';

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
    <div className="min-h-[85vh] flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 relative overflow-hidden">
      {/* Sophisticated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-quikle-info/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/3 to-transparent rounded-full" />
      </div>

      <div className="container max-w-3xl mx-auto px-4 py-12 text-center space-y-10 relative z-10">
        {/* Premium Hero with Role Badge */}
        <div className="space-y-4 animate-fade-in">
          {loading ? (
            <div className="space-y-3 flex flex-col items-center">
              <Skeleton className="h-12 w-80" />
              <Skeleton className="h-6 w-48" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-quikle-success animate-pulse" />
                <span className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
                  Welcome to Quikle
                </span>
                <Sparkles className="h-5 w-5 text-quikle-success animate-pulse" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
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
                <div className="flex justify-center pt-2">
                  <Badge className={`${role.color} shadow-sm px-3 py-1`}>
                    <RoleIcon className="h-3.5 w-3.5 mr-1.5" />
                    {role.label}
                  </Badge>
                </div>
              )}

              <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
                {userName 
                  ? "Your command center awaits. Where would you like to start?"
                  : "Premium business management designed for professionals."}
              </p>
            </>
          )}
         </div>
 
        {/* Premium Navigation Grid */}
        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
           {quickLinks.map((link) => {
             const Icon = link.icon;
             return (
               <Card
                 key={link.path}
                className="group relative p-5 cursor-pointer border-border/40 bg-card/80 backdrop-blur-sm hover:border-primary/30 hover:shadow-elegant transition-all duration-300 overflow-hidden"
                 onClick={() => navigate(link.path)}
               >
                {/* Hover gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${link.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <div className="relative flex flex-col items-center gap-3 text-center">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${link.gradient} shadow-sm group-hover:shadow-md transition-shadow`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors block">
                      {link.label}
                    </span>
                    <span className="text-xs text-muted-foreground mt-0.5 block">
                      {link.description}
                    </span>
                  </div>
                 </div>
               </Card>
             );
           })}
         </div>
 
        {/* Premium CTA Section */}
        <div className="space-y-4 pt-2">
          <Button
            size="lg"
            className="gap-2 px-8 shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => navigate('/dashboard')}
          >
            <TrendingUp className="h-4 w-4" />
            Go to Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>

          {/* Subtle feature hints */}
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground/70">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3 w-3" />
              <span>Fast & Reliable</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <div className="flex items-center gap-1.5">
              <Shield className="h-3 w-3" />
              <span>Enterprise Security</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              <span>Premium Experience</span>
            </div>
          </div>
        </div>
       </div>
     </div>
  );
};

export default Index;
