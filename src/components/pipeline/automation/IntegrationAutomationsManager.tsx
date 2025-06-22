
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Calendar, Mail, Building } from 'lucide-react';
import CRMSyncSettings from './integration/CRMSyncSettings';
import AccountingSyncSettings from './integration/AccountingSyncSettings';
import CalendarSyncSettings from './integration/CalendarSyncSettings';
import EmailPlatformSettings from './integration/EmailPlatformSettings';

const IntegrationAutomationsManager = () => {
  const [activeIntegrations, setActiveIntegrations] = useState({
    crm: { enabled: false, platform: '', lastSync: null },
    accounting: { enabled: false, platform: '', lastSync: null },
    calendar: { enabled: false, platforms: [], lastSync: null },
    email: { enabled: false, platform: '', lastSync: null }
  });

  const updateIntegrationStatus = (type: string, updates: any) => {
    setActiveIntegrations(prev => ({
      ...prev,
      [type]: { ...prev[type as keyof typeof prev], ...updates }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500/20 via-blue-500/15 to-cyan-500/20 p-6 rounded-xl border border-white/20 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Integration Automations
            </h2>
            <p className="text-muted-foreground mt-1">
              Synchronize data across external systems and automate workflows
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant={activeIntegrations.crm.enabled ? "default" : "secondary"}>
              CRM {activeIntegrations.crm.enabled ? 'ON' : 'OFF'}
            </Badge>
            <Badge variant={activeIntegrations.accounting.enabled ? "default" : "secondary"}>
              Accounting {activeIntegrations.accounting.enabled ? 'ON' : 'OFF'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">
                  {activeIntegrations.crm.enabled ? '1' : '0'}
                </div>
                <div className="text-sm text-muted-foreground">CRM Connected</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {activeIntegrations.accounting.enabled ? '1' : '0'}
                </div>
                <div className="text-sm text-muted-foreground">Accounting</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {activeIntegrations.calendar.platforms?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Calendars</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Mail className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">
                  {activeIntegrations.email.enabled ? '1' : '0'}
                </div>
                <div className="text-sm text-muted-foreground">Email Platform</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="crm" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="crm" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            CRM Sync
          </TabsTrigger>
          <TabsTrigger value="accounting" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Accounting
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Platform
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crm">
          <CRMSyncSettings 
            settings={activeIntegrations.crm}
            onUpdateSettings={(updates) => updateIntegrationStatus('crm', updates)}
          />
        </TabsContent>

        <TabsContent value="accounting">
          <AccountingSyncSettings 
            settings={activeIntegrations.accounting}
            onUpdateSettings={(updates) => updateIntegrationStatus('accounting', updates)}
          />
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarSyncSettings 
            settings={activeIntegrations.calendar}
            onUpdateSettings={(updates) => updateIntegrationStatus('calendar', updates)}
          />
        </TabsContent>

        <TabsContent value="email">
          <EmailPlatformSettings 
            settings={activeIntegrations.email}
            onUpdateSettings={(updates) => updateIntegrationStatus('email', updates)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationAutomationsManager;
