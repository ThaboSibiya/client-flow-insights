
import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import SettingsSidebar from '@/components/settings/SettingsSidebar';
import { useIsMobile } from '@/hooks/use-mobile';

const Settings = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  // Redirect to general settings if at /settings root
  if (location.pathname === '/settings') {
    return <Navigate to="/settings/general" replace />;
  }

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-quikle-primary via-quikle-secondary to-quikle-accent bg-clip-text text-transparent drop-shadow-lg">
          Settings
        </h1>
        <p className="text-quikle-charcoal/70 font-medium">
          Manage your account and application preferences
        </p>
      </div>

      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-6`}>
        <SettingsSidebar />
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Settings;
