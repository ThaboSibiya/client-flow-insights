
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  Users, 
  MessageCircle, 
  BarChart3, 
  FileText, 
  UserPlus,
  UserCog,
  ShieldCheck,
  Bot,
  FolderKanban,
  Workflow,
  Zap
} from 'lucide-react';
import { useEmployeeProfile } from '@/hooks/useEmployeeProfile';
import UserProfile from '@/components/auth/UserProfile';

const Sidebar = () => {
  const location = useLocation();
  const { data: employee } = useEmployeeProfile();

  const menuGroups = [
    {
      label: 'Overview',
      items: [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      ]
    },
    {
      label: 'Customer Management',
      items: [
        { path: '/customers', icon: Users, label: 'Customers' },
        { path: '/onboarding', icon: UserPlus, label: 'Onboarding' },
        { path: '/conversations', icon: MessageCircle, label: 'Conversations' },
      ]
    },
    {
      label: 'Sales Operations',
      items: [
        { path: '/pipeline', icon: Bot, label: 'Pipeline' },
        { path: '/projects', icon: FolderKanban, label: 'Projects' },
        { path: '/quotes', icon: FileText, label: 'Quotes & Invoices' },
      ]
    },
    {
      label: 'Team & Security',
      items: [
        { path: '/employees', icon: UserCog, label: 'Employees' },
        ...(employee?.role === 'admin' ? [{ path: '/audit-log', icon: ShieldCheck, label: 'Audit Log' }] : []),
      ]
    },
    {
      label: 'Automation',
      items: [
        { path: '/automations', icon: Zap, label: 'Automations' },
        { path: '/integrations', icon: Workflow, label: 'Integrations' },
      ]
    },
    {
      label: 'Insights',
      items: [
        { path: '/analytics', icon: BarChart3, label: 'Analytics' },
      ]
    },
  ];

  return (
    <div className="w-64 bg-gradient-to-br from-white via-white to-quikle-crystal/20 border-r border-quikle-silver/30 min-h-screen flex flex-col shadow-xl relative overflow-hidden">
      {/* Subtle background pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.03),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.03),transparent_50%)]" />
      
      <div className="flex-1 relative z-10 flex flex-col overflow-hidden">
        {/* Premium Logo Section */}
        <div className="p-6 flex items-center gap-3 border-b border-quikle-silver/20 bg-gradient-to-r from-white/95 to-quikle-crystal/40 backdrop-blur-sm flex-shrink-0">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-quikle-primary/20 to-quikle-secondary/20 rounded-xl blur-lg" />
            <img 
              src="/lovable-uploads/f0901f42-4619-41c2-b222-e562191d61a9.png" 
              alt="Quikle Logo" 
              className="h-11 w-11 relative z-10 drop-shadow-md transition-transform duration-300 hover:scale-110" 
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-quikle-primary via-quikle-secondary to-quikle-primary bg-clip-text text-transparent">
              Quikle
            </h1>
            <p className="text-[10px] font-medium text-quikle-slate/70 tracking-widest uppercase -mt-0.5">
              Innovation Suite
            </p>
          </div>
        </div>
        
        {/* Navigation Menu with Enhanced Hover Scrollbar */}
        <ScrollArea className="flex-1 mt-4">
          <style dangerouslySetInnerHTML={{ __html: `
            [data-radix-scroll-area-viewport] {
              scrollbar-width: thin;
              scrollbar-color: transparent transparent;
              transition: scrollbar-color 0.3s ease;
            }
            [data-radix-scroll-area-viewport]:hover {
              scrollbar-color: rgba(139, 92, 246, 0.4) rgba(148, 163, 184, 0.08);
            }
            [data-radix-scroll-area-viewport]::-webkit-scrollbar {
              width: 10px;
            }
            [data-radix-scroll-area-viewport]::-webkit-scrollbar-track {
              background: transparent;
              border-radius: 10px;
              margin-top: 4px;
              margin-bottom: 4px;
            }
            [data-radix-scroll-area-viewport]::-webkit-scrollbar-thumb {
              background: transparent;
              border-radius: 10px;
              border: 2px solid transparent;
              background-clip: padding-box;
              transition: all 0.3s ease;
            }
            [data-radix-scroll-area-viewport]:hover::-webkit-scrollbar-track {
              background: rgba(148, 163, 184, 0.08);
            }
            [data-radix-scroll-area-viewport]:hover::-webkit-scrollbar-thumb {
              background: linear-gradient(180deg, rgba(139, 92, 246, 0.5), rgba(59, 130, 246, 0.4));
              box-shadow: 0 0 6px rgba(139, 92, 246, 0.3);
            }
            [data-radix-scroll-area-viewport]::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(180deg, rgba(139, 92, 246, 0.7), rgba(59, 130, 246, 0.6));
              box-shadow: 0 0 8px rgba(139, 92, 246, 0.5);
            }
            [data-radix-scroll-area-viewport]::-webkit-scrollbar-thumb:active {
              background: linear-gradient(180deg, rgba(139, 92, 246, 0.9), rgba(59, 130, 246, 0.8));
            }
          ` }} />
          <nav className="px-3 pb-4">
            <div className="space-y-3">
              {menuGroups.map((group, groupIndex) => (
                <div key={group.label} className="space-y-1.5">
                  {/* Group Label */}
                  <div className="px-3 mb-1.5">
                    <h3 className="text-[10px] font-bold text-quikle-slate/50 uppercase tracking-[0.15em] letter-spacing-wider">
                      {group.label}
                    </h3>
                  </div>
                  
                  {/* Group Items */}
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={cn(
                            "flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 group relative overflow-hidden",
                            isActive 
                              ? "bg-gradient-to-r from-quikle-primary/15 via-quikle-secondary/10 to-quikle-primary/15 text-quikle-primary shadow-lg shadow-quikle-primary/10" 
                              : "text-quikle-charcoal/80 hover:bg-gradient-to-r hover:from-quikle-crystal/40 hover:to-quikle-crystal/20 hover:text-quikle-primary hover:shadow-md"
                          )}
                        >
                          {/* Active indicator */}
                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-quikle-primary to-quikle-secondary rounded-r-full shadow-lg shadow-quikle-primary/30" />
                          )}
                          
                          <Icon className={cn(
                            "mr-3 h-[18px] w-[18px] transition-all duration-300",
                            isActive 
                              ? "text-quikle-primary drop-shadow-sm" 
                              : "text-quikle-slate/60 group-hover:text-quikle-primary group-hover:scale-110 group-hover:drop-shadow-sm"
                          )} />
                          <span className={cn(
                            "transition-all duration-300",
                            isActive ? "font-semibold" : "font-medium group-hover:translate-x-0.5"
                          )}>
                            {item.label}
                          </span>
                          
                          {/* Hover glow effect */}
                          {!isActive && (
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-quikle-primary/5 to-transparent" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                  
                  {/* Light Border Separator */}
                  {groupIndex < menuGroups.length - 1 && (
                    <div className="pt-2.5 pb-0.5">
                      <div className="h-px bg-gradient-to-r from-transparent via-quikle-silver/40 to-transparent shadow-sm" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>
        </ScrollArea>
      </div>
      
      {/* Enhanced User Profile Section */}
      <div className="mt-auto relative z-10 border-t border-quikle-silver/20 bg-gradient-to-t from-white/80 to-transparent backdrop-blur-sm">
        <UserProfile />
      </div>
    </div>
  );
};

export default Sidebar;
