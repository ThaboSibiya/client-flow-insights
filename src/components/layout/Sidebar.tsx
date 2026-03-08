
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
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
  Zap,
  DollarSign,
  Bell,
  Settings
} from 'lucide-react';
import { useEmployeeProfile } from '@/hooks/useEmployeeProfile';
import UserProfile from '@/components/auth/UserProfile';
import NotificationBell from '@/components/notifications/NotificationBell';
import WorkstationQuickPanel from '@/components/sidebar/WorkstationQuickPanel';
import QuikleLogo from '@/components/brand/QuikleLogo';

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
      label: 'Operation',
      items: [
        { path: '/pipeline', icon: Bot, label: 'Pipeline' },
        { path: '/projects', icon: FolderKanban, label: 'Projects' },
        { path: '/quotes', icon: FileText, label: 'Quotes & Invoices' },
        { path: '/finance', icon: DollarSign, label: 'Finance' },
      ]
    },
    {
      label: 'Team & Security',
      items: [
        { path: '/employees', icon: Users, label: 'Team' },
        { path: '/notifications', icon: Bell, label: 'Notifications' },
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
    {
      label: 'Configuration',
      items: [
        { path: '/settings', icon: Settings, label: 'Settings' },
      ]
    },
  ];

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border min-h-screen flex flex-col shadow-xl relative overflow-hidden">
      <div className="flex-1 relative z-10 flex flex-col overflow-hidden">
        {/* Logo Section */}
        <div className="p-6 flex items-center justify-between border-b border-sidebar-border bg-sidebar/95 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src="/lovable-uploads/f0901f42-4619-41c2-b222-e562191d61a9.png" 
                alt="Quikle Logo" 
                className="h-11 w-11 relative z-10 drop-shadow-md transition-transform duration-300 hover:scale-110" 
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-sidebar-foreground">
                Quikle
              </h1>
              <p className="text-[10px] font-medium text-sidebar-foreground/50 tracking-widest uppercase -mt-0.5">
                Innovation Suite
              </p>
            </div>
          </div>
          <NotificationBell />
        </div>
        
        {/* Workstation Quick Access Panel */}
        <WorkstationQuickPanel />

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 overflow-y-auto hover-scrollbar">
          <div className="space-y-3 pb-4">
            {menuGroups.map((group, groupIndex) => (
              <div key={group.label} className="space-y-1.5">
                <div className="px-3 mb-1.5">
                  <h3 className="text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-[0.15em]">
                    {group.label}
                  </h3>
                </div>
                
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          "flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden",
                          isActive 
                            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" 
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        )}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sidebar-primary rounded-r-full" />
                        )}
                        
                        <Icon className={cn(
                          "mr-3 h-[18px] w-[18px] transition-all duration-200",
                          isActive 
                            ? "text-sidebar-primary" 
                            : "text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground"
                        )} />
                        <span className={cn(
                          "transition-all duration-200",
                          isActive ? "font-semibold" : "font-medium"
                        )}>
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
                
                {groupIndex < menuGroups.length - 1 && (
                  <div className="pt-2.5 pb-0.5">
                    <div className="h-px bg-sidebar-border/50" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>
      </div>
      
      {/* User Profile Section */}
      <div className="mt-auto relative z-10 border-t border-sidebar-border bg-sidebar/80 backdrop-blur-sm">
        <UserProfile />
      </div>
    </div>
  );
};

export default Sidebar;
