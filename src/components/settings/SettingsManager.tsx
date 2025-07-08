
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Settings, Download, Upload, History, User, Shield, Bell, Palette, Database } from 'lucide-react';
import { useEnhancedPrivileges } from '@/hooks/useEnhancedPrivileges';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import CompanySettings from './CompanySettings';
import SecuritySettings from './SecuritySettings';
import NotificationSettings from './NotificationSettings';
import AppearanceSettings from './AppearanceSettings';
import IntegrationSettings from './IntegrationSettings';
import SettingsSearch from './SettingsSearch';
import SettingsImportExport from './SettingsImportExport';
import SettingsHistory from './SettingsHistory';
import MobileSettingsView from './mobile/MobileSettingsView';

interface SettingsCategory {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
  requiredPrivilege?: string;
  description: string;
}

const SettingsManager = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('company');
  const { privileges, hasPrivilege } = useEnhancedPrivileges();
  const { shouldUseMobileView } = useMobileDetection();

  const settingsCategories: SettingsCategory[] = [
    {
      id: 'company',
      label: 'Company',
      icon: Settings,
      component: CompanySettings,
      requiredPrivilege: 'can_edit_basic_settings',
      description: 'Basic company information and branding'
    },
    {
      id: 'security',
      label: 'Security',
      icon: Shield,
      component: SecuritySettings,
      requiredPrivilege: 'can_edit_security_settings',
      description: 'User access, permissions, and security policies'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      component: NotificationSettings,
      description: 'Email, SMS, and push notification preferences'
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: Palette,
      component: AppearanceSettings,
      description: 'Theme, layout, and visual customization'
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: Database,
      component: IntegrationSettings,
      requiredPrivilege: 'can_edit_integration_settings',
      description: 'Third-party services and API connections'
    }
  ];

  const visibleCategories = useMemo(() => {
    return settingsCategories.filter(category => {
      if (category.requiredPrivilege && !hasPrivilege(category.requiredPrivilege as any)) {
        return false;
      }
      
      if (searchQuery) {
        return category.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
               category.description.toLowerCase().includes(searchQuery.toLowerCase());
      }
      
      return true;
    });
  }, [settingsCategories, hasPrivilege, searchQuery]);

  if (shouldUseMobileView) {
    return (
      <MobileSettingsView 
        categories={visibleCategories}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-quikle-charcoal">Settings</h1>
          <p className="text-quikle-slate text-sm">Manage your application preferences and configuration</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-quikle-slate h-4 w-4" />
            <Input
              placeholder="Search settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <SettingsImportExport />
            {hasPrivilege('can_edit_security_settings') && (
              <Button variant="outline" size="sm">
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Search Results or Categories */}
      {searchQuery ? (
        <SettingsSearch 
          query={searchQuery}
          categories={visibleCategories}
          onCategorySelect={(categoryId) => {
            setActiveTab(categoryId);
            setSearchQuery('');
          }}
        />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white border border-quikle-silver/20">
            {visibleCategories.map((category) => {
              const Icon = category.icon;
              return (
                <TabsTrigger 
                  key={category.id}
                  value={category.id}
                  className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{category.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {visibleCategories.map((category) => {
            const Component = category.component;
            return (
              <TabsContent key={category.id} value={category.id} className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <category.icon className="h-5 w-5 text-quikle-primary" />
                        <div>
                          <CardTitle>{category.label} Settings</CardTitle>
                          <p className="text-sm text-quikle-slate mt-1">{category.description}</p>
                        </div>
                      </div>
                      {category.requiredPrivilege && (
                        <Badge variant="secondary">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Component />
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </div>
  );
};

export default SettingsManager;
