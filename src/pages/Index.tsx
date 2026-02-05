 import React from 'react';
 import { useNavigate } from 'react-router-dom';
 import { useAuth } from '@/context/AuthContext';
 import { Button } from '@/components/ui/button';
 import { Card } from '@/components/ui/card';
 import { ArrowRight, LayoutDashboard, Users, FileText, Settings } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
   const navigate = useNavigate();
 
   const getGreeting = () => {
     const hour = new Date().getHours();
     if (hour < 12) return 'Good morning';
     if (hour < 18) return 'Good afternoon';
     return 'Good evening';
   };
 
   const quickLinks = [
     { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', description: 'View your business overview' },
     { label: 'Customers', icon: Users, path: '/customers', description: 'Manage your clients' },
     { label: 'Invoicing', icon: FileText, path: '/invoicing', description: 'Create and track invoices' },
     { label: 'Settings', icon: Settings, path: '/settings', description: 'Configure your account' },
   ];
 
  return (
     <div className="min-h-[85vh] flex items-center justify-center bg-background">
       <div className="container max-w-2xl mx-auto px-4 py-12 text-center space-y-8">
         {/* Minimal Hero */}
         <div className="space-y-3">
           <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
             {getGreeting()}{user ? '!' : ', welcome to Quikle'}
           </h1>
           <p className="text-muted-foreground text-lg">
             {user ? 'Where would you like to go?' : 'Premium business management for professionals.'}
           </p>
         </div>
 
         {/* Quick Navigation Grid */}
         <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
           {quickLinks.map((link) => {
             const Icon = link.icon;
             return (
               <Card
                 key={link.path}
                 className="p-4 cursor-pointer border-border/50 hover:border-primary/40 hover:bg-muted/30 transition-all group"
                 onClick={() => navigate(link.path)}
               >
                 <div className="flex flex-col items-center gap-2 text-center">
                   <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                   <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                     {link.label}
                   </span>
                 </div>
               </Card>
             );
           })}
         </div>
 
         {/* Primary CTA */}
         <Button
           size="lg"
           className="gap-2"
           onClick={() => navigate('/dashboard')}
         >
           Go to Dashboard
           <ArrowRight className="h-4 w-4" />
         </Button>
       </div>
     </div>
  );
};

export default Index;
