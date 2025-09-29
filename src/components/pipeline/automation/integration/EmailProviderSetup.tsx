
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ExternalLink, TestTube } from 'lucide-react';
import { toast } from 'sonner';
import { emailIntegrationService } from '@/services/emailIntegrationService';
import { EmailProvider, EmailConfiguration } from '@/types/email-integration';

interface EmailProviderSetupProps {
  providers: EmailProvider[];
  onConfigurationSaved: () => void;
}

const EmailProviderSetup = ({ providers, onConfigurationSaved }: EmailProviderSetupProps) => {
  const [selectedProvider, setSelectedProvider] = useState<EmailProvider | null>(null);
  const [configuration, setConfiguration] = useState<Partial<EmailConfiguration>>({
    isEnabled: true,
    settings: {
      autoCreateTickets: true,
      defaultTicketPriority: 'medium',
      emailToTicketMapping: {
        subjectToTitle: true,
        bodyToDescription: true,
        senderToCustomer: true,
        attachmentsToFiles: true,
      }
    }
  });
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  const updateSetting = (path: string, value: any) => {
    setConfiguration(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current: any = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  const handleOAuthSetup = async () => {
    if (!selectedProvider) return;
    
    try {
      const authUrl = await emailIntegrationService.initiateOAuthFlow(selectedProvider.id);
      
      // Open popup and listen for completion
      const popup = window.open(authUrl, 'oauth-popup', 'width=600,height=700,scrollbars=yes,resizable=yes');
      
      if (!popup) {
        toast.error('Popup blocked. Please allow popups and try again.');
        return;
      }

      toast.info('Complete OAuth authorization in the popup window');

      // Listen for OAuth completion
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.success) {
          toast.success(`Successfully authorized ${selectedProvider.name}!`);
          popup.close();
          window.removeEventListener('message', handleMessage);
          onConfigurationSaved(); // Refresh the integration list
        } else if (event.data.error) {
          toast.error(`Authorization failed: ${event.data.error}`);
          popup.close();
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);

      // Check if popup is closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
        }
      }, 1000);

    } catch (error: any) {
      console.error('OAuth flow error:', error);
      toast.error(error.message || 'Failed to initiate OAuth flow');
    }
  };

  const testConnection = async () => {
    if (!selectedProvider || !configuration.settings) return;
    
    setTesting(true);
    try {
      const success = await emailIntegrationService.testEmailConnection({
        id: '',
        providerId: selectedProvider.id,
        isEnabled: true,
        settings: configuration.settings
      } as EmailConfiguration);
      
      if (success) {
        toast.success('✅ Connection test successful!');
      } else {
        toast.error('❌ Connection test failed');
      }
    } catch (error: any) {
      console.error('Connection test error:', error);
      toast.error(error.message || 'Connection test failed');
    } finally {
      setTesting(false);
    }
  };

  const saveConfiguration = async () => {
    if (!selectedProvider || !configuration.settings) return;
    
    setSaving(true);
    try {
      await emailIntegrationService.saveEmailConfiguration({
        id: `${selectedProvider.id}-${Date.now()}`,
        providerId: selectedProvider.id,
        isEnabled: configuration.isEnabled || false,
        settings: configuration.settings
      });
      
      toast.success('Email integration configured successfully!');
      onConfigurationSaved();
      setSelectedProvider(null);
      setConfiguration({
        isEnabled: true,
        settings: {
          autoCreateTickets: true,
          defaultTicketPriority: 'medium',
          emailToTicketMapping: {
            subjectToTitle: true,
            bodyToDescription: true,
            senderToCustomer: true,
            attachmentsToFiles: true,
          }
        }
      });
    } catch (error) {
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Email Provider</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Email Provider</Label>
            <Select onValueChange={(value) => {
              const provider = providers.find(p => p.id === value);
              setSelectedProvider(provider || null);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an email provider..." />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    <span className="flex items-center gap-2">
                      <span>{provider.icon}</span>
                      {provider.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProvider && (
            <div className="space-y-6 pt-4 border-t">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedProvider.icon}</span>
                <div>
                  <h3 className="font-medium">{selectedProvider.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedProvider.requiresOAuth ? 'OAuth 2.0 Authentication' : 'Direct Connection'}
                  </p>
                </div>
              </div>

              {selectedProvider.requiresOAuth ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">🔐 OAuth Setup Required</h4>
                    <p className="text-sm text-blue-800 mb-3">
                      Authorize Quikle to securely access your {selectedProvider.name} account. 
                      This enables automatic email syncing and ticket creation.
                    </p>
                    <div className="bg-white/50 p-3 rounded border border-blue-100 mb-3">
                      <p className="text-xs text-blue-700">
                        ✅ Your credentials stay secure - we use OAuth 2.0 industry standard<br/>
                        ✅ You can revoke access anytime from your {selectedProvider.name} settings<br/>
                        ✅ We only access emails you authorize
                      </p>
                    </div>
                    <Button onClick={handleOAuthSetup} className="w-full bg-blue-600 hover:bg-blue-700">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      🚀 Connect {selectedProvider.name} Account
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Server Host</Label>
                    <Input
                      placeholder="mail.example.com"
                      value={configuration.settings?.serverHost || ''}
                      onChange={(e) => updateSetting('settings.serverHost', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Port</Label>
                    <Input
                      type="number"
                      placeholder="993"
                      value={configuration.settings?.serverPort || ''}
                      onChange={(e) => updateSetting('settings.serverPort', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input
                      placeholder="user@example.com"
                      value={configuration.settings?.username || ''}
                      onChange={(e) => updateSetting('settings.username', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={configuration.settings?.password || ''}
                      onChange={(e) => updateSetting('settings.password', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-between">
                    <Label>Use SSL/TLS</Label>
                    <Switch
                      checked={configuration.settings?.useSSL || false}
                      onCheckedChange={(checked) => updateSetting('settings.useSSL', checked)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Email Processing Settings</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label>Auto-create tickets from emails</Label>
                    <Switch
                      checked={configuration.settings?.autoCreateTickets || false}
                      onCheckedChange={(checked) => updateSetting('settings.autoCreateTickets', checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Default ticket priority</Label>
                    <Select 
                      value={configuration.settings?.defaultTicketPriority} 
                      onValueChange={(value) => updateSetting('settings.defaultTicketPriority', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Email-to-Ticket Mapping</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Subject → Ticket Title</span>
                      <Switch
                        checked={configuration.settings?.emailToTicketMapping?.subjectToTitle || false}
                        onCheckedChange={(checked) => updateSetting('settings.emailToTicketMapping.subjectToTitle', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Body → Description</span>
                      <Switch
                        checked={configuration.settings?.emailToTicketMapping?.bodyToDescription || false}
                        onCheckedChange={(checked) => updateSetting('settings.emailToTicketMapping.bodyToDescription', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Sender → Customer</span>
                      <Switch
                        checked={configuration.settings?.emailToTicketMapping?.senderToCustomer || false}
                        onCheckedChange={(checked) => updateSetting('settings.emailToTicketMapping.senderToCustomer', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Attachments → Files</span>
                      <Switch
                        checked={configuration.settings?.emailToTicketMapping?.attachmentsToFiles || false}
                        onCheckedChange={(checked) => updateSetting('settings.emailToTicketMapping.attachmentsToFiles', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={testConnection}
                  disabled={testing}
                  className="flex-1"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  {testing ? 'Testing...' : 'Test Connection'}
                </Button>
                <Button 
                  onClick={saveConfiguration}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? 'Saving...' : 'Save Configuration'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailProviderSetup;
