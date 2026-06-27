import React, { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import MobileNavigation from './MobileNavigation';
import HelpButton from '@/components/help/HelpButton';
import { useIsMobile } from '@/hooks/use-mobile';
import NotificationBell from '@/components/notifications/NotificationBell';
import TrialBanner from '@/components/billing/TrialBanner';
import DemoBanner from '@/components/demo/DemoBanner';
import HardPaywall from '@/components/billing/HardPaywall';
import { Search } from 'lucide-react';

const CommandPalette = lazy(() => import('@/components/command/CommandPalette'));
const QuikleAgent = lazy(() => import('@/components/quikle-agent/QuikleAgent'));

const Layout = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex flex-col w-full bg-background overflow-x-hidden" style={{ minHeight: '100dvh' }}>
        <MobileNavigation />
        <TrialBanner />
        <main
          className="flex-1 flex flex-col ios-scroll"
          style={{ paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + 5rem)` }}
        >
          <Outlet />
        </main>
        <HelpButton />
        <Suspense fallback={null}><CommandPalette /></Suspense>
        <HardPaywall />
        <Suspense fallback={null}><QuikleAgent /></Suspense>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />

        <SidebarInset className="flex flex-col">
          <TrialBanner />
          <header className="h-11 flex items-center gap-2 px-3 border-b border-border/40 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger className="h-7 w-7" />
            <button
              onClick={() => {
                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
              }}
              className="flex items-center gap-2 ml-1 px-2.5 py-1 rounded-md border border-border/40 bg-muted/20 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer max-w-[220px]"
            >
              <Search className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="text-xs">Search...</span>
              <kbd className="text-[10px] bg-background px-1.5 py-0.5 rounded border border-border/50 font-mono ml-auto">⌘K</kbd>
            </button>
            <div className="flex-1" />
            <NotificationBell />
          </header>

          <main className="flex-1 p-4 overflow-y-auto">
            <Outlet />
          </main>
        </SidebarInset>

        <HelpButton />
        <Suspense fallback={null}><CommandPalette /></Suspense>
        <HardPaywall />
        <Suspense fallback={null}><QuikleAgent /></Suspense>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
