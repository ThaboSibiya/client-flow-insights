
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
      <div className="min-h-screen flex flex-col w-full quikle-gradient-bg safe-area-top safe-area-bottom">
        <MobileNavigation />
        
        <main className="flex-1 mobile-container pb-20 quikle-gradient-bg overflow-x-hidden">
          <div className="max-w-full">
            <Outlet />
          </div>
        </main>
        
        <HelpButton />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full quikle-gradient-bg">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-white/98 border-b border-quikle-silver/20 px-4 py-3 flex justify-between items-center shadow-sm backdrop-blur-lg flex-shrink-0">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1 flex justify-between items-center min-w-0">
              <div className="flex items-center gap-3 min-w-0">
                <img 
                  src="/lovable-uploads/f0901f42-4619-41c2-b222-e562191d61a9.png" 
                  alt="Quikle Logo" 
                  className="h-8 w-8 flex-shrink-0" 
                />
                <div className="hidden sm:block min-w-0">
                  <h1 className="text-lg font-bold text-quikle-primary truncate">QUIKLE</h1>
                  <p className="text-xs text-quikle-neutral -mt-1 truncate">Innovation Suite</p>
                </div>
              </div>
            </div>
          </header>
          
          <main className="flex-1 p-6 quikle-gradient-bg overflow-x-hidden min-w-0">
            <div className="max-w-full">
              <Outlet />
            </div>
          </main>
        </div>
        
        <HelpButton />
      </div>
    </SidebarProvider>
  );
};

export default Layout;
