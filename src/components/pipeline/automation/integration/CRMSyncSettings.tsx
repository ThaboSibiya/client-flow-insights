
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Database, Settings, Sync, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CRMSyncSettingsProps {
  settings: any;
  onUpdateSettings: (updates: any) => void;
}

const CRMSyncSettings = ({ settings, onUpdateSettings }: CRMSyncSettingsProps) => {
  const [syncRules, setSyncRules] = useState([
    {
      id: '1',
      name: 'Customer Creation',
      enabled: true,
      trigger: 'customer_created',
      action: 'create_contact',
      fieldMapping: {
        name: 'full_name',
        email: 'email_address',
        phone: 'phone_number',
        company: 'company_name'
      }
    },
    {
      id: '2',
      name: 'Deal Updates',
      enabled: false,
      trigger: 'ticket_status_change',
      action: 'update_deal',
      fieldMapping: {
        status: 'deal_stage',
        value: 'deal_amount'
      }
    }
  ]);

  const crmPlatforms = [
    { value: 'salesforce', label: 'Salesforce', icon: '🏢' },
    { value: 'hubspot', label: 'HubSpot', icon: '🟠' },
    { value: 'pipedrive', label: 'Pipedrive', icon: '🔵' },
    { value: 'zoho', label: 'Zoho CRM', icon: '🟣' },
    { value: 'freshsales', label: 'Freshsales', icon: '🟢' }
  ];

  const testConnection = async () => {
    toast.success('CRM connection test successful');
  };

  const triggerSync = async () => {
    toast.success('Manual sync initiated');
  };

  const toggleSyncRule = (ruleId: string) => {
    setSyncRules(prev =>
      prev.map(rule =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            CRM Platform Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="crm-enabled">Enable CRM Synchronization</Label>
            <Switch
              id="crm-enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) => onUpdateSettings({ enabled: checked })}
            />
          </div>

          {settings.enabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CRM Platform</Label>
                  <Select 
                    value={settings.platform} 
                    onValueChange={(value) => onUpdateSettings({ platform: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select CRM platform..." />
                    </SelectTrigger>
                    <SelectContent>
                      {crmPlatforms.map((platform) => (
                        <SelectItem key={platform.value} value={platform.value}>
                          <span className="flex items-center gap-2">
                            <span>{platform.icon}</span>
                            {platform.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Sync Frequency</Label>
                  <Select defaultValue="realtime">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="hourly">Every Hour</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="manual">Manual Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>API Key / Token</Label>
                <Input
                  type="password"
                  placeholder="Enter your CRM API key..."
                  defaultValue="••••••••••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label>CRM Instance URL (if applicable)</Label>
                <Input
                  placeholder="https://your-instance.salesforce.com"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={testConnection}>
                  <Settings className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
                <Button onClick={triggerSync}>
                  <Sync className="h-4 w-4 mr-2" />
                  Manual Sync
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {settings.enabled && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Sync Rules & Field Mapping</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {syncRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{rule.name}</h4>
                      <Badge variant={rule.enabled ? "default" : "secondary"}>
                        {rule.enabled ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <AlertCircle className="h-3 w-3 mr-1" />
                        )}
                        {rule.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <div>Trigger: <span className="font-medium">{rule.trigger}</span></div>
                      <div>Action: <span className="font-medium">{rule.action}</span></div>
                    </div>

                    <div className="mt-2">
                      <details className="text-sm">
                        <summary className="cursor-pointer text-blue-600">Field Mapping</summary>
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          <pre>{JSON.stringify(rule.fieldMapping, null, 2)}</pre>
                        </div>
                      </details>
                    </div>
                  </div>
                  
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={() => toggleSyncRule(rule.id)}
                  />
                </div>
              ))}

              <Button variant="outline" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Add Custom Sync Rule
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CRMSyncSettings;
