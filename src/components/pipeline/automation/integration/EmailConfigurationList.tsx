
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Settings, Trash2, Sync, TestTube } from 'lucide-react';
import { toast } from 'sonner';
import { EmailConfiguration, EmailProvider } from '@/types/email-integration';
import { emailIntegrationService } from '@/services/emailIntegrationService';

interface EmailConfigurationListProps {
  configurations: EmailConfiguration[];
  providers: EmailProvider[];
  onConfigurationUpdated: () => void;
}

const EmailConfigurationList = ({ 
  configurations, 
  providers, 
  onConfigurationUpdated 
}: EmailConfigurationListProps) => {
  
  const getProviderInfo = (providerId: string) => {
    return providers.find(p => p.id === providerId);
  };

  const toggleConfiguration = async (config: EmailConfiguration) => {
    try {
      await emailIntegrationService.saveEmailConfiguration({
        ...config,
        isEnabled: !config.isEnabled
      });
      toast.success(`Integration ${config.isEnabled ? 'disabled' : 'enabled'}`);
      onConfigurationUpdated();
    } catch (error) {
      toast.error('Failed to update configuration');
    }
  };

  const testConfiguration = async (config: EmailConfiguration) => {
    try {
      const success = await emailIntegrationService.testEmailConnection(config);
      if (success) {
        toast.success('Connection test successful!');
      } else {
        toast.error('Connection test failed');
      }
    } catch (error) {
      toast.error('Connection test failed');
    }
  };

  const syncConfiguration = async (config: EmailConfiguration) => {
    try {
      await emailIntegrationService.syncEmails(config.id);
      toast.success('Email sync completed');
    } catch (error) {
      toast.error('Email sync failed');
    }
  };

  if (configurations.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground mb-4">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="font-medium mb-2">No Email Integrations</h3>
            <p className="text-sm">Add your first email provider to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {configurations.map((config) => {
        const provider = getProviderInfo(config.providerId);
        if (!provider) return null;

        return (
          <Card key={config.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{provider.icon}</span>
                  <div>
                    <h3 className="font-medium">{provider.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={config.isEnabled ? "default" : "secondary"}>
                        {config.isEnabled ? 'Active' : 'Inactive'}
                      </Badge>
                      {config.settings.autoCreateTickets && (
                        <Badge variant="outline">Auto-tickets</Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={config.isEnabled}
                    onCheckedChange={() => toggleConfiguration(config)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Priority</div>
                  <div className="font-medium capitalize">
                    {config.settings.defaultTicketPriority}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Auto-create</div>
                  <div className="font-medium">
                    {config.settings.autoCreateTickets ? 'Yes' : 'No'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Subject mapping</div>
                  <div className="font-medium">
                    {config.settings.emailToTicketMapping.subjectToTitle ? 'Yes' : 'No'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Attachments</div>
                  <div className="font-medium">
                    {config.settings.emailToTicketMapping.attachmentsToFiles ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => testConfiguration(config)}
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Test
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => syncConfiguration(config)}
                  disabled={!config.isEnabled}
                >
                  <Sync className="h-4 w-4 mr-2" />
                  Sync
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default EmailConfigurationList;
