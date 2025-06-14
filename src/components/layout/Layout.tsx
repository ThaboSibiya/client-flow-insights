
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
          <header className="bg-white/95 border-b border-quikle-silver/30 p-4 flex justify-between items-center shadow-platinum backdrop-blur-xl">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-quikle-primary to-quikle-secondary flex items-center justify-center shadow-elegant">
                  <span className="text-white font-bold text-lg">Q</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold luxury-text">QUIKLE</h1>
                  <p className="text-sm text-quikle-neutral">Universal Business Management</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium luxury-text">Professional Dashboard</span>
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
