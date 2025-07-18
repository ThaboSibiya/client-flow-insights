
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
  Bot
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
    { path: '/quotes', icon: FileText, label: 'Quotes & Invoices' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/onboarding', icon: UserPlus, label: 'Onboarding' },
  ];

  if (employee?.role === 'admin') {
    menuItems.splice(4, 0, { path: '/audit-log', icon: ShieldCheck, label: 'Audit Log' });
  }

  return (
    <div className="w-64 bg-white border-r border-quikle-silver min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="p-6 flex items-center gap-3">
          <img src="/lovable-uploads/f0901f42-4619-41c2-b222-e562191d61a9.png" alt="Quikle Logo" className="h-10 w-10" />
          <h1 className="text-2xl font-bold text-quikle-primary">Quikle</h1>
        </div>
        
        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-6 py-3 text-sm font-medium transition-colors hover:bg-quikle-crystal",
                  isActive 
                    ? "bg-quikle-crystal text-quikle-primary border-r-2 border-quikle-primary" 
                    : "text-quikle-charcoal"
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4">
        <UserProfile />
      </div>
    </div>
  );
};

export default Sidebar;
