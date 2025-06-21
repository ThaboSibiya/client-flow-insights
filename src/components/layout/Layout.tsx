
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
          <header className="bg-white/98 border-b border-quikle-silver/20 px-4 py-3 flex justify-between items-center shadow-sm backdrop-blur-lg">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img src="/lovable-uploads/f0901f42-4619-41c2-b222-e562191d61a9.png" alt="Quikle Logo" className="h-8 w-8" />
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold text-quikle-primary">QUIKLE</h1>
                  <p className="text-xs text-quikle-neutral -mt-1">Innovation Suite</p>
                </div>
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
