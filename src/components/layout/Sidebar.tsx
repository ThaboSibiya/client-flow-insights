
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
} from "@/components/ui/sidebar";
import { Users, Home, CircleCheck, ChartBar } from 'lucide-react';

const AppSidebar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <h1 className="text-xl font-bold text-broker-primary">Broker CRM</h1>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className={isActive('/') ? 'bg-broker-light text-broker-primary' : ''}>
                <Link to="/" className="flex items-center gap-3">
                  <Home size={20} />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild className={isActive('/customers') ? 'bg-broker-light text-broker-primary' : ''}>
                <Link to="/customers" className="flex items-center gap-3">
                  <Users size={20} />
                  <span>Customers</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild className={isActive('/onboarding') ? 'bg-broker-light text-broker-primary' : ''}>
                <Link to="/onboarding" className="flex items-center gap-3">
                  <CircleCheck size={20} />
                  <span>Onboarding</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild className={isActive('/analytics') ? 'bg-broker-light text-broker-primary' : ''}>
                <Link to="/analytics" className="flex items-center gap-3">
                  <ChartBar size={20} />
                  <span>Analytics</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t">
        <p className="text-sm text-gray-500">© 2025 Broker CRM</p>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
