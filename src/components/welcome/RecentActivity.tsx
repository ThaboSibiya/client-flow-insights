 import React from 'react';
 import { useNavigate } from 'react-router-dom';
 import { useQuery } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/context/AuthContext';
 import { Card, CardContent } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Skeleton } from '@/components/ui/skeleton';
 import { 
   UserPlus, 
   FileText, 
   Clock, 
   ArrowRight,
   Activity
 } from 'lucide-react';
 import { formatDistanceToNow } from 'date-fns';
 
 interface ActivityItem {
   id: string;
   type: 'customer' | 'invoice';
   title: string;
   subtitle: string;
   timestamp: Date;
   path: string;
 }
 
 const RecentActivity: React.FC = () => {
   const navigate = useNavigate();
   const { user } = useAuth();
 
   const { data: activities, isLoading } = useQuery({
     queryKey: ['recent-activity', user?.id],
     queryFn: async (): Promise<ActivityItem[]> => {
       if (!user?.id) return [];
 
       const [customersRes, invoicesRes] = await Promise.all([
         supabase
           .from('customers')
           .select('id, name, email, created_at')
           .eq('user_id', user.id)
           .order('created_at', { ascending: false })
           .limit(3),
         supabase
           .from('invoices')
           .select('id, invoice_number, total_amount, created_at, customers(name)')
           .eq('user_id', user.id)
           .order('created_at', { ascending: false })
           .limit(3),
       ]);
 
       const customerItems: ActivityItem[] = (customersRes.data || []).map((c) => ({
         id: c.id,
         type: 'customer',
         title: c.name,
         subtitle: c.email,
         timestamp: new Date(c.created_at),
         path: `/customers?id=${c.id}`,
       }));
 
       const invoiceItems: ActivityItem[] = (invoicesRes.data || []).map((i) => ({
         id: i.id,
         type: 'invoice',
         title: `Invoice ${i.invoice_number}`,
         subtitle: `$${i.total_amount?.toLocaleString() || '0'}`,
         timestamp: new Date(i.created_at || ''),
         path: `/invoicing?id=${i.id}`,
       }));
 
       return [...customerItems, ...invoiceItems]
         .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
         .slice(0, 5);
     },
     enabled: !!user?.id,
   });
 
   const getIcon = (type: ActivityItem['type']) => {
     switch (type) {
       case 'customer':
         return UserPlus;
       case 'invoice':
         return FileText;
       default:
         return Activity;
     }
   };
 
   if (isLoading) {
     return (
       <Card className="border-border/50">
         <CardContent className="p-4 space-y-3">
           {[1, 2, 3].map((i) => (
             <div key={i} className="flex items-center gap-3">
               <Skeleton className="h-9 w-9 rounded-lg" />
               <div className="flex-1 space-y-1">
                 <Skeleton className="h-4 w-32" />
                 <Skeleton className="h-3 w-24" />
               </div>
             </div>
           ))}
         </CardContent>
       </Card>
     );
   }
 
   if (!activities?.length) {
     return (
       <Card className="border-border/50 border-dashed">
         <CardContent className="p-6 text-center">
           <Activity className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
           <p className="text-sm text-muted-foreground">No recent activity</p>
           <p className="text-xs text-muted-foreground/70 mt-1">
             Add your first customer to get started
           </p>
         </CardContent>
       </Card>
     );
   }
 
   return (
     <div className="space-y-3">
       <div className="flex items-center justify-between">
         <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
           Recent Activity
         </h2>
         <Button 
           variant="ghost" 
           size="sm" 
           className="text-xs text-muted-foreground hover:text-foreground gap-1"
           onClick={() => navigate('/dashboard')}
         >
           View all
           <ArrowRight className="h-3 w-3" />
         </Button>
       </div>
 
       <Card className="border-border/50">
         <CardContent className="p-2">
           {activities.map((activity, index) => {
             const Icon = getIcon(activity.type);
             return (
               <button
                 key={activity.id}
                 onClick={() => navigate(activity.path)}
                 className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors hover:bg-muted/50 group ${
                   index !== activities.length - 1 ? 'border-b border-border/30' : ''
                 }`}
               >
                 <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                   <Icon className="h-4 w-4 text-muted-foreground" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                     {activity.title}
                   </p>
                   <p className="text-xs text-muted-foreground truncate">
                     {activity.subtitle}
                   </p>
                 </div>
                 <div className="flex items-center gap-1 text-xs text-muted-foreground/70 flex-shrink-0">
                   <Clock className="h-3 w-3" />
                   {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                 </div>
               </button>
             );
           })}
         </CardContent>
       </Card>
     </div>
   );
 };
 
 export default RecentActivity;