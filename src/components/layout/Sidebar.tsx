
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
        <nav className="flex-1 mt-4 px-3 overflow-y-auto hover-scrollbar">
          <div className="space-y-3 pb-4">
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
                            ? "bg-gradient-to-r from-quikle-primary via-quikle-primary to-quikle-secondary text-white shadow-lg shadow-quikle-primary/20 border border-quikle-primary/30" 
                            : "text-quikle-charcoal hover:bg-gradient-to-r hover:from-quikle-crystal hover:to-quikle-platinum/30 hover:text-quikle-primary hover:shadow-md border border-transparent"
                        )}
                      >
                        {/* Active indicator */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-gradient-to-b from-white/80 via-white to-white/80 rounded-r-full shadow-lg" />
                        )}
                        
                        <Icon className={cn(
                          "mr-3 h-[18px] w-[18px] transition-all duration-300",
                          isActive 
                            ? "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]" 
                            : "text-quikle-slate group-hover:text-quikle-primary group-hover:scale-110 group-hover:drop-shadow-sm"
                        )} />
                        <span className={cn(
                          "transition-all duration-300 relative z-10",
                          isActive ? "font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]" : "font-medium group-hover:translate-x-0.5"
                        )}>
                          {item.label}
                        </span>
                        
                        {/* Active shimmer effect */}
                        {isActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                        )}
                        
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
      </div>
      
      {/* Enhanced User Profile Section */}
      <div className="mt-auto relative z-10 border-t border-quikle-silver/20 bg-gradient-to-t from-white/80 to-transparent backdrop-blur-sm">
        <UserProfile />
      </div>
    </div>
  );
};

export default Sidebar;
