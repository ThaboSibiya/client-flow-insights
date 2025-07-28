
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Plus, Settings, TestTube, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { emailIntegrationService } from '@/services/emailIntegrationService';
import { emailSyncService } from '@/services/emailSyncService';
import { EmailProvider, EmailConfiguration } from '@/types/email-integration';
import EmailProviderSetup from './EmailProviderSetup';
import EmailConfigurationList from './EmailConfigurationList';
import EmailSyncStatus from '@/components/email/EmailSyncStatus';

const EmailIntegrationManager = () => {
  const [providers, setProviders] = useState<EmailProvider[]>([]);
  const [configurations, setConfigurations] = useState<EmailConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [providersData, configurationsData] = await Promise.all([
        emailIntegrationService.getEmailProviders(),
        emailIntegrationService.getEmailConfigurations()
      ]);
      
      setProviders(providersData);
      setConfigurations(configurationsData);
    } catch (error) {
      console.error('Failed to load email integration data:', error);
      toast.error('Failed to load email integration settings');
    } finally {
      setLoading(false);
    }
  };

  const syncAllEmails = async () => {
    const enabledConfigs = configurations.filter(config => config.isEnabled);
    
    if (enabledConfigs.length === 0) {
      toast.warning('No email integrations are enabled');
      return;
    }

    try {
      await emailSyncService.syncAllProviders();
      toast.success('Email sync completed');
    } catch (error) {
      toast.error('Email sync failed');
    }
  };

  const getProviderStats = () => {
    const enabled = configurations.filter(config => config.isEnabled).length;
    const total = configurations.length;
    return { enabled, total };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  const stats = getProviderStats();
  const enabledConfigurations = configurations.filter(config => config.isEnabled);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500/20 via-purple-500/15 to-pink-500/20 p-6 rounded-xl border border-white/20 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Email Integration Hub
            </h2>
            <p className="text-muted-foreground mt-1">
              Connect email providers to automatically create tickets and manage customer communications
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant={stats.enabled > 0 ? "default" : "secondary"}>
              {stats.enabled}/{stats.total} Active
            </Badge>
            <Button onClick={syncAllEmails} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync All
            </Button>
          </div>
        </div>
      </div>

      {/* Sync Status Grid */}
      {enabledConfigurations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enabledConfigurations.map((config) => {
            const provider = providers.find(p => p.id === config.providerId);
            return (
              <EmailSyncStatus
                key={config.id}
                providerId={config.providerId}
                providerName={provider?.name || config.providerId}
                onSyncComplete={loadData}
              />
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {providers.map((provider) => {
          const config = configurations.find(c => c.providerId === provider.id);
          return (
            <Card key={provider.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{provider.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{provider.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {config ? (
                        <Badge variant={config.isEnabled ? "default" : "secondary"} className="text-xs">
                          {config.isEnabled ? 'Connected' : 'Configured'}
                        </Badge>
                      ) : (
                        <span>Not configured</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="setup" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Provider
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Manage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Email Integration Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.enabled}</div>
                    <div className="text-sm text-blue-800">Active Integrations</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-green-800">Emails Processed Today</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">0</div>
                    <div className="text-sm text-purple-800">Tickets Created</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Available Email Providers</h4>
                  <div className="space-y-2">
                    {providers.map((provider) => (
                      <div key={provider.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{provider.icon}</span>
                          <div>
                            <div className="font-medium">{provider.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {provider.requiresOAuth ? 'OAuth 2.0' : 'Direct Connection'}
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setActiveTab('setup')}
                        >
                          Configure
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup">
          <EmailProviderSetup 
            providers={providers}
            onConfigurationSaved={loadData}
          />
        </TabsContent>

        <TabsContent value="manage">
          <EmailConfigurationList 
            configurations={configurations}
            providers={providers}
            onConfigurationUpdated={loadData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailIntegrationManager;
