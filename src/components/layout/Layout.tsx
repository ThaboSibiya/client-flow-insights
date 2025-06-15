
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from './Sidebar';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const Layout = () => {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full quikle-gradient-bg">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="bg-white/95 border-b border-quikle-silver/30 p-4 flex justify-between items-center shadow-platinum backdrop-blur-xl">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <img src="/lovable-uploads/f0901f42-4619-41c2-b222-e562191d61a9.png" alt="Quikle Logo" className="h-10 w-10" />
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold luxury-text">QUIKLE</h1>
                  <p className="text-sm text-quikle-neutral">Innovation Suite</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium luxury-text hidden sm:inline">{user.email}</span>
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || 'user'} />
                      <AvatarFallback className="bg-gradient-to-r from-quikle-primary to-quikle-accent text-white font-medium">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                ) : (
                  <span className="text-sm font-medium luxury-text">Professional Dashboard</span>
                )}
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
