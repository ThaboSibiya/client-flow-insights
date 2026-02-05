 import React from 'react';
 import { useNavigate } from 'react-router-dom';
 import { Card, CardContent } from '@/components/ui/card';
 import { ArrowRight, Users, LayoutDashboard, BarChart3 } from 'lucide-react';
 
 interface Feature {
   title: string;
   description: string;
   icon: React.ElementType;
   path: string;
 }
 
 const FEATURES: Feature[] = [
   {
     title: 'Clients',
     description: 'Manage relationships',
     icon: Users,
     path: '/customers',
   },
   {
     title: 'Dashboard',
     description: 'Business overview',
     icon: LayoutDashboard,
     path: '/dashboard',
   },
   {
     title: 'Analytics',
     description: 'Deep insights',
     icon: BarChart3,
     path: '/analytics',
   },
 ];
 
 const FeatureHighlights: React.FC = () => {
   const navigate = useNavigate();
 
   return (
     <div className="space-y-3">
       <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
         Explore
       </h2>
       
       <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
         {FEATURES.map((feature) => {
           const Icon = feature.icon;
           return (
             <Card 
               key={feature.title}
               className="border-border/50 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group"
               onClick={() => navigate(feature.path)}
             >
               <CardContent className="p-4 flex items-center gap-3">
                 <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                   <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                     {feature.title}
                   </p>
                   <p className="text-xs text-muted-foreground">
                     {feature.description}
                   </p>
                 </div>
                 <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
               </CardContent>
             </Card>
           );
         })}
       </div>
     </div>
   );
 };
 
 export default FeatureHighlights;