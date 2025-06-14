
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, UserPlus, BarChart3, Home, Move } from 'lucide-react';
import UserProfile from '../auth/UserProfile';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  isCollapsed?: boolean;
}

const SidebarItem = ({ icon, label, to, isCollapsed }: SidebarItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors hover:bg-quikle-primary/10',
          isActive
            ? 'bg-gradient-to-r from-quikle-primary/20 to-quikle-accent/20 text-quikle-primary border-l-4 border-quikle-primary'
            : 'text-white/90 hover:text-quikle-accent',
          isCollapsed ? 'justify-center' : ''
        )
      }
    >
      <div>{icon}</div>
      {!isCollapsed && <span>{label}</span>}
    </NavLink>
  );
};

interface SidebarProps {
  isCollapsed?: boolean;
}

const Sidebar = ({ isCollapsed = false }: SidebarProps) => {
  return (
    <div className={cn(
      'h-full bg-gradient-to-b from-quikle-secondary to-quikle-dark border-r border-quikle-secondary/30 transition-all shadow-xl',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      <div className={cn(
        'flex items-center justify-center h-16 border-b border-quikle-secondary/30 bg-quikle-secondary/50',
        isCollapsed ? 'px-2' : 'px-6'
      )}>
        {isCollapsed ? (
          <div className="w-8 h-8 bg-quikle-primary rounded-lg flex items-center justify-center">
            <span className="font-bold text-white">Q</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <img 
              src="https://www.quikle.co.za/wp-content/uploads/2023/07/Quikle-Logo.png" 
              alt="Quikle Logo" 
              className="h-8 w-auto"
            />
            <span className="font-bold text-xl text-gradient-quikle">QUIKLE</span>
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col h-[calc(100%-4rem)] justify-between">
        <nav className="space-y-1">
          <SidebarItem 
            icon={<Home size={isCollapsed ? 20 : 16} />} 
            label="Home" 
            to="/" 
            isCollapsed={isCollapsed}
          />
          <SidebarItem 
            icon={<LayoutDashboard size={isCollapsed ? 20 : 16} />} 
            label="Dashboard" 
            to="/dashboard" 
            isCollapsed={isCollapsed}
          />
          <SidebarItem 
            icon={<Users size={isCollapsed ? 20 : 16} />} 
            label="Clients" 
            to="/customers" 
            isCollapsed={isCollapsed}
          />
          <SidebarItem 
            icon={<UserPlus size={isCollapsed ? 20 : 16} />} 
            label="Onboarding" 
            to="/onboarding" 
            isCollapsed={isCollapsed}
          />
          <SidebarItem 
            icon={<Move size={isCollapsed ? 20 : 16} />} 
            label="Workflow" 
            to="/pipeline" 
            isCollapsed={isCollapsed}
          />
          <SidebarItem 
            icon={<BarChart3 size={isCollapsed ? 20 : 16} />} 
            label="Analytics" 
            to="/analytics" 
            isCollapsed={isCollapsed}
          />
        </nav>
        
        {!isCollapsed && <UserProfile />}
      </div>
    </div>
  );
};

export default Sidebar;
