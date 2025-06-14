
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, UserPlus, BarChart3, Home, move } from 'lucide-react';
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
          'flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors hover:bg-gray-100',
          isActive
            ? 'bg-gradient-to-r from-broker-primary/10 to-broker-accent/10 text-broker-primary'
            : 'text-gray-600 hover:text-broker-primary',
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
      'h-full bg-white border-r border-gray-200 transition-all',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      <div className={cn(
        'flex items-center justify-center h-16 border-b border-gray-200',
        isCollapsed ? 'px-2' : 'px-6'
      )}>
        {isCollapsed ? (
          <span className="font-bold text-xl text-broker-primary">B</span>
        ) : (
          <span className="font-bold text-xl bg-gradient-to-r from-broker-primary to-broker-accent bg-clip-text text-transparent">Broker CRM</span>
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
            label="Customers" 
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
