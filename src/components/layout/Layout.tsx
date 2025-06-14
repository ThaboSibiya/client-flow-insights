
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from './Sidebar';

const Layout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full quikle-gradient-bg">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="bg-white/80 border-b border-quikle-neutral/30 p-4 flex justify-between items-center shadow-sm backdrop-blur-sm">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img 
                  src="https://www.quikle.co.za/wp-content/uploads/2023/07/Quikle-Logo.png" 
                  alt="Quikle Logo" 
                  className="h-8 w-auto"
                />
                <span className="text-sm font-medium text-gradient-quikle hidden sm:inline">
                  Universal Business Management
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gradient-quikle">Welcome to QUIKLE</span>
              </div>
            </div>
          </header>
          
          <main className="flex-1 p-6 quikle-gradient-bg">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
