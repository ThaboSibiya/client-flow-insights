 import React from 'react';
 import { useQuery } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/context/AuthContext';
 import { Card, CardContent } from '@/components/ui/card';
 import { Skeleton } from '@/components/ui/skeleton';
 import { Users, FileText, TrendingUp, DollarSign } from 'lucide-react';
 
 interface StatItem {
   label: string;
   value: string | number;
   icon: React.ElementType;
   change?: string;
   positive?: boolean;
 }
 
 const QuickStats: React.FC = () => {
   const { user } = useAuth();
 
   const { data: stats, isLoading } = useQuery({
     queryKey: ['quick-stats', user?.id],
     queryFn: async () => {
       if (!user?.id) return null;
 
       const [customers, invoices, pendingInvoices] = await Promise.all([
         supabase.from('customers').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
         supabase.from('invoices').select('id, total_amount').eq('user_id', user.id),
         supabase.from('invoices').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'pending'),
       ]);
 
       const totalRevenue = (invoices.data || []).reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
 
       return {
         customerCount: customers.count || 0,
         invoiceCount: (invoices.data?.length) || 0,
         pendingCount: pendingInvoices.count || 0,
         totalRevenue,
       };
     },
     enabled: !!user?.id,
   });
 
   if (isLoading) {
     return (
       <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
         {[1, 2, 3, 4].map((i) => (
           <Card key={i} className="border-border/50">
             <CardContent className="p-4">
               <Skeleton className="h-4 w-16 mb-2" />
               <Skeleton className="h-7 w-12" />
             </CardContent>
           </Card>
         ))}
       </div>
     );
   }
 
   if (!stats) return null;
 
   const statItems: StatItem[] = [
     { label: 'Customers', value: stats.customerCount, icon: Users },
     { label: 'Invoices', value: stats.invoiceCount, icon: FileText },
     { label: 'Pending', value: stats.pendingCount, icon: TrendingUp },
     { 
       label: 'Revenue', 
       value: `$${stats.totalRevenue.toLocaleString()}`, 
       icon: DollarSign 
     },
   ];
 
   return (
     <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
       {statItems.map((stat) => {
         const Icon = stat.icon;
         return (
           <Card key={stat.label} className="border-border/50">
             <CardContent className="p-4">
               <div className="flex items-center gap-2 mb-1">
                 <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                 <span className="text-xs text-muted-foreground">{stat.label}</span>
               </div>
               <p className="text-xl font-semibold text-foreground">{stat.value}</p>
             </CardContent>
           </Card>
         );
       })}
     </div>
   );
 };
 
 export default QuickStats;