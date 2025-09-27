
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from './Sidebar';
import MobileNavigation from './MobileNavigation';
import HelpButton from '@/components/help/HelpButton';
import { useIsMobile } from '@/hooks/use-mobile';

const Layout = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col w-full quikle-gradient-bg">
        <MobileNavigation />
        
        <main className="flex-1 p-4 pb-20 quikle-gradient-bg overflow-x-hidden">
          <Outlet />
        </main>
        
        <HelpButton />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full quikle-gradient-bg">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="bg-white/98 border-b border-quikle-silver/20 px-3 py-1.5 flex justify-between items-center shadow-sm backdrop-blur-lg">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1 flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <img src="/lovable-uploads/f0901f42-4619-41c2-b222-e562191d61a9.png" alt="Quikle Logo" className="h-6 w-6" />
                <div className="hidden sm:block">
                  <h1 className="text-sm font-bold text-quikle-primary">QUIKLE</h1>
                  <p className="text-xs text-quikle-neutral -mt-0.5">Innovation Suite</p>
                </div>
              </div>
            </div>
          </header>
          
          <main className="flex-1 p-3 quikle-gradient-bg">
            <Outlet />
          </main>
        </div>
        
        <HelpButton />
      </div>
    </SidebarProvider>
  );
};

export default Layout;
