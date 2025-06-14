
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
          'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-sm',
          isActive
            ? 'bg-white/15 text-white border-l-4 border-white/50 shadow-lg backdrop-blur-sm'
            : 'text-white/90 hover:text-white',
          isCollapsed ? 'justify-center' : ''
        )
      }
    >
      <div className="text-white/90">{icon}</div>
      {!isCollapsed && <span className="font-medium">{label}</span>}
    </NavLink>
  );
};

interface SidebarProps {
  isCollapsed?: boolean;
}

const Sidebar = ({ isCollapsed = false }: SidebarProps) => {
  return (
    <div className={cn(
      'h-full bg-gradient-to-b from-quikle-obsidian via-quikle-dark to-quikle-primary border-r border-quikle-secondary/20 transition-all shadow-luxury backdrop-blur-xl',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      <div className={cn(
        'flex items-center justify-center h-16 border-b border-white/10 bg-white/5 backdrop-blur-sm',
        isCollapsed ? 'px-2' : 'px-6'
      )}>
        {isCollapsed ? (
          <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/10 rounded-xl flex items-center justify-center shadow-elegant backdrop-blur-sm">
            <span className="font-bold text-white text-lg">Q</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/10 rounded-xl flex items-center justify-center shadow-elegant backdrop-blur-sm">
              <span className="font-bold text-white text-lg">Q</span>
            </div>
            <div>
              <span className="font-bold text-xl text-white">QUIKLE</span>
              <p className="text-xs text-white/70">Business Suite</p>
            </div>
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col h-[calc(100%-4rem)] justify-between">
        <nav className="space-y-2">
          <SidebarItem 
            icon={<Home size={isCollapsed ? 20 : 18} />} 
            label="Home" 
            to="/" 
            isCollapsed={isCollapsed}
          />
          <SidebarItem 
            icon={<LayoutDashboard size={isCollapsed ? 20 : 18} />} 
            label="Dashboard" 
            to="/dashboard" 
            isCollapsed={isCollapsed}
          />
          <SidebarItem 
            icon={<Users size={isCollapsed ? 20 : 18} />} 
            label="Clients" 
            to="/customers" 
            isCollapsed={isCollapsed}
          />
          <SidebarItem 
            icon={<UserPlus size={isCollapsed ? 20 : 18} />} 
            label="Onboarding" 
            to="/onboarding" 
            isCollapsed={isCollapsed}
          />
          <SidebarItem 
            icon={<Move size={isCollapsed ? 20 : 18} />} 
            label="Workflow" 
            to="/pipeline" 
            isCollapsed={isCollapsed}
          />
          <SidebarItem 
            icon={<BarChart3 size={isCollapsed ? 20 : 18} />} 
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
