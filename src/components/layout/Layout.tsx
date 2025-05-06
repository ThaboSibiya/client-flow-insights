
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from './Sidebar';

const Layout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="bg-white border-b p-4 flex justify-between items-center">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1 flex justify-end">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Welcome, Broker</span>
              </div>
            </div>
          </header>
          
          <main className="flex-1 p-6 bg-gray-50">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
