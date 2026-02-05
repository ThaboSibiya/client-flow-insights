 import React, { useMemo } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { useQuery } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/context/AuthContext';
 import { Card, CardContent } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Progress } from '@/components/ui/progress';
 import { 
   CheckCircle2, 
   Circle, 
   ArrowRight,
   Rocket
 } from 'lucide-react';
 
 interface SetupStep {
   id: string;
   label: string;
   description: string;
   path: string;
   checkFn: (data: SetupData) => boolean;
 }
 
 interface SetupData {
   hasCustomers: boolean;
   hasInvoices: boolean;
   hasEmployees: boolean;
   hasTemplates: boolean;
 }
 
 const SETUP_STEPS: SetupStep[] = [
   {
     id: 'customer',
     label: 'Add your first customer',
     description: 'Start building your client base',
     path: '/onboarding',
     checkFn: (data) => data.hasCustomers,
   },
   {
     id: 'invoice',
     label: 'Create an invoice',
     description: 'Send professional invoices',
     path: '/invoicing',
     checkFn: (data) => data.hasInvoices,
   },
   {
     id: 'team',
     label: 'Invite team members',
     description: 'Collaborate with your team',
     path: '/team',
     checkFn: (data) => data.hasEmployees,
   },
   {
     id: 'template',
     label: 'Set up industry templates',
     description: 'Customize for your business',
     path: '/onboarding',
     checkFn: (data) => data.hasTemplates,
   },
 ];
 
 const OnboardingProgress: React.FC = () => {
   const navigate = useNavigate();
   const { user } = useAuth();
 
   const { data: setupData, isLoading } = useQuery({
     queryKey: ['setup-progress', user?.id],
     queryFn: async (): Promise<SetupData> => {
       if (!user?.id) return { hasCustomers: false, hasInvoices: false, hasEmployees: false, hasTemplates: false };
 
       const [customers, invoices, employees, templates] = await Promise.all([
         supabase.from('customers').select('id').eq('user_id', user.id).limit(1),
         supabase.from('invoices').select('id').eq('user_id', user.id).limit(1),
         supabase.from('employees').select('id').eq('company_owner_id', user.id).limit(1),
         supabase.from('industry_templates').select('id').eq('user_id', user.id).limit(1),
       ]);
 
       return {
         hasCustomers: (customers.data?.length || 0) > 0,
         hasInvoices: (invoices.data?.length || 0) > 0,
         hasEmployees: (employees.data?.length || 0) > 0,
         hasTemplates: (templates.data?.length || 0) > 0,
       };
     },
     enabled: !!user?.id,
   });
 
   const { completedSteps, nextStep, progressPercent } = useMemo(() => {
     if (!setupData) return { completedSteps: 0, nextStep: SETUP_STEPS[0], progressPercent: 0 };
 
     const completed = SETUP_STEPS.filter((step) => step.checkFn(setupData)).length;
     const next = SETUP_STEPS.find((step) => !step.checkFn(setupData));
     
     return {
       completedSteps: completed,
       nextStep: next,
       progressPercent: (completed / SETUP_STEPS.length) * 100,
     };
   }, [setupData]);
 
   // Don't show if all steps complete or still loading
   if (isLoading || !setupData || completedSteps === SETUP_STEPS.length) {
     return null;
   }
 
   return (
     <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
       <CardContent className="p-4">
         <div className="flex items-start gap-4">
           <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
             <Rocket className="h-5 w-5 text-primary" />
           </div>
           
           <div className="flex-1 min-w-0">
             <div className="flex items-center justify-between gap-2 mb-2">
               <h3 className="font-semibold text-foreground">Complete your setup</h3>
               <span className="text-xs text-muted-foreground">
                 {completedSteps} of {SETUP_STEPS.length}
               </span>
             </div>
             
             <Progress value={progressPercent} className="h-1.5 mb-3" />
             
             <div className="space-y-2">
               {SETUP_STEPS.map((step) => {
                 const isComplete = setupData ? step.checkFn(setupData) : false;
                 const isNext = step.id === nextStep?.id;
                 
                 return (
                   <div
                     key={step.id}
                     className={`flex items-center gap-2 text-sm ${
                       isComplete ? 'text-muted-foreground' : 'text-foreground'
                     }`}
                   >
                     {isComplete ? (
                       <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                     ) : (
                       <Circle className={`h-4 w-4 flex-shrink-0 ${isNext ? 'text-primary' : 'text-muted-foreground/50'}`} />
                     )}
                     <span className={isComplete ? 'line-through' : ''}>
                       {step.label}
                     </span>
                   </div>
                 );
               })}
             </div>
             
             {nextStep && (
               <Button
                 size="sm"
                 className="mt-4 gap-2"
                 onClick={() => navigate(nextStep.path)}
               >
                 {nextStep.label}
                 <ArrowRight className="h-3 w-3" />
               </Button>
             )}
           </div>
         </div>
       </CardContent>
     </Card>
   );
 };
 
 export default OnboardingProgress;