
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from './Sidebar';

const Layout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="bg-white border-b p-4 flex justify-between items-center shadow-sm backdrop-blur-sm bg-white/70">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1 flex justify-end">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Welcome to QUIKLE</span>
              </div>
            </div>
          </header>
          
          <main className="flex-1 p-6 bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/10">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
