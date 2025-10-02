
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
  Workflow
} from 'lucide-react';
import { useEmployeeProfile } from '@/hooks/useEmployeeProfile';
import UserProfile from '@/components/auth/UserProfile';

const Sidebar = () => {
  const location = useLocation();
  const { data: employee } = useEmployeeProfile();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/conversations', icon: MessageCircle, label: 'Conversations' },
    { path: '/employees', icon: UserCog, label: 'Employees' },
    { path: '/pipeline', icon: Bot, label: 'Pipeline' },
    { path: '/integrations', icon: Workflow, label: 'Integrations' },
    { path: '/projects', icon: FolderKanban, label: 'Projects' },
    { path: '/quotes', icon: FileText, label: 'Quotes & Invoices' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/onboarding', icon: UserPlus, label: 'Onboarding' },
  ];

  if (employee?.role === 'admin') {
    menuItems.splice(5, 0, { path: '/audit-log', icon: ShieldCheck, label: 'Audit Log' });
  }

  return (
    <div className="w-64 bg-gradient-to-b from-white to-quikle-crystal/30 border-r border-quikle-silver/30 min-h-screen flex flex-col backdrop-blur-sm">
      <div className="flex-1">
        {/* Premium Logo Section */}
        <div className="p-6 flex items-center gap-3 border-b border-quikle-silver/20 bg-white/50">
          <img src="/lovable-uploads/f0901f42-4619-41c2-b222-e562191d61a9.png" alt="Quikle Logo" className="h-10 w-10" />
          <div>
            <h1 className="text-2xl font-bold luxury-text">Quikle</h1>
            <p className="text-xs text-quikle-slate -mt-1">Premium Suite</p>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group",
                    isActive 
                      ? "bg-gradient-to-r from-quikle-primary/10 to-quikle-secondary/10 text-quikle-primary border-r-2 border-quikle-primary shadow-sm" 
                      : "text-quikle-charcoal hover:bg-quikle-crystal/50 hover:text-quikle-primary"
                  )}
                >
                  <Icon className={cn(
                    "mr-3 h-4 w-4 transition-colors",
                    isActive ? "text-quikle-primary" : "text-quikle-slate group-hover:text-quikle-primary"
                  )} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
      
      {/* Enhanced User Profile Section */}
      <div className="mt-auto">
        <UserProfile />
      </div>
    </div>
  );
};

export default Sidebar;
