 import React from 'react';
 import { useNavigate } from 'react-router-dom';
 import { Button } from '@/components/ui/button';
 import { 
   UserPlus, 
   FileText, 
   BarChart3, 
   Users,
   Settings,
   Mail
 } from 'lucide-react';
 
 interface QuickAction {
   label: string;
   icon: React.ElementType;
   path: string;
   variant: 'default' | 'outline' | 'secondary';
   shortcut?: string;
 }
 
 const QUICK_ACTIONS: QuickAction[] = [
   { label: 'Add Customer', icon: UserPlus, path: '/onboarding', variant: 'default', shortcut: '⌘N' },
   { label: 'Create Invoice', icon: FileText, path: '/invoicing', variant: 'outline' },
   { label: 'View Reports', icon: BarChart3, path: '/analytics', variant: 'outline' },
   { label: 'Manage Team', icon: Users, path: '/team', variant: 'outline' },
 ];
 
 const SECONDARY_ACTIONS: QuickAction[] = [
   { label: 'Inbox', icon: Mail, path: '/inbox', variant: 'secondary' },
   { label: 'Settings', icon: Settings, path: '/settings', variant: 'secondary' },
 ];
 
 const QuickActions: React.FC = () => {
   const navigate = useNavigate();
 
   return (
     <div className="space-y-4">
       <div className="flex items-center justify-between">
         <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
           Quick Actions
         </h2>
       </div>
       
       <div className="flex flex-wrap gap-2">
         {QUICK_ACTIONS.map((action) => {
           const Icon = action.icon;
           return (
             <Button
               key={action.label}
               variant={action.variant}
               size="sm"
               onClick={() => navigate(action.path)}
               className="gap-2 group"
             >
               <Icon className="h-4 w-4" />
               <span>{action.label}</span>
               {action.shortcut && (
                 <kbd className="hidden md:inline-flex h-5 px-1.5 items-center gap-1 rounded border bg-muted font-mono text-[10px] font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                   {action.shortcut}
                 </kbd>
               )}
             </Button>
           );
         })}
         
         <div className="hidden md:flex items-center gap-2 ml-2 pl-2 border-l border-border">
           {SECONDARY_ACTIONS.map((action) => {
             const Icon = action.icon;
             return (
               <Button
                 key={action.label}
                 variant="ghost"
                 size="sm"
                 onClick={() => navigate(action.path)}
                 className="gap-2 text-muted-foreground hover:text-foreground"
               >
                 <Icon className="h-4 w-4" />
                 <span>{action.label}</span>
               </Button>
             );
           })}
         </div>
       </div>
     </div>
   );
 };
 
 export default QuickActions;