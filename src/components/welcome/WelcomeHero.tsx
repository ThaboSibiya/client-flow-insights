 import React from 'react';
 import { useAuth } from '@/context/AuthContext';
 import { useEmployeeAuth } from '@/hooks/useEmployeeAuth';
 import { Badge } from '@/components/ui/badge';
 import { Skeleton } from '@/components/ui/skeleton';
 import { Crown, Shield, User } from 'lucide-react';
 
 const WelcomeHero: React.FC = () => {
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
     return null;
   };
 
   const getRoleInfo = () => {
     if (isCompanyOwner) return { label: 'Owner', icon: Crown, color: 'bg-amber-500/10 text-amber-600 border-amber-200' };
     if (employeeProfile?.role === 'admin') return { label: 'Admin', icon: Shield, color: 'bg-primary/10 text-primary border-primary/20' };
     if (employeeProfile?.role === 'manager') return { label: 'Manager', icon: User, color: 'bg-secondary/10 text-secondary-foreground border-secondary/20' };
     return { label: employeeProfile?.role || 'Team', icon: User, color: 'bg-muted text-muted-foreground border-border' };
   };
 
   const userName = getUserFirstName();
   const role = getRoleInfo();
   const RoleIcon = role.icon;
 
   if (loading) {
     return (
       <div className="space-y-3">
         <Skeleton className="h-10 w-72" />
         <Skeleton className="h-5 w-96" />
       </div>
     );
   }
 
   return (
     <div className="space-y-2">
       <div className="flex items-center gap-3 flex-wrap">
         <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
           {getGreeting()}{userName ? `, ${userName}` : ''}
         </h1>
         {userName && (
           <Badge variant="outline" className={`${role.color} text-xs font-medium`}>
             <RoleIcon className="h-3 w-3 mr-1" />
             {role.label}
           </Badge>
         )}
       </div>
       <p className="text-muted-foreground text-lg max-w-2xl">
         {userName 
           ? "Here's what's happening with your business today."
           : "Premium business management designed for discerning professionals."
         }
       </p>
     </div>
   );
 };
 
 export default WelcomeHero;