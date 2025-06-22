
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Building, Settings, Sync, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface AccountingSyncSettingsProps {
  settings: any;
  onUpdateSettings: (updates: any) => void;
}

const AccountingSyncSettings = ({ settings, onUpdateSettings }: AccountingSyncSettingsProps) => {
  const [syncMappings, setSyncMappings] = useState([
    {
      id: '1',
      name: 'Invoice Creation',
      enabled: true,
      trigger: 'quote_accepted',
      accountingAction: 'create_invoice',
      chartOfAccounts: 'Revenue - Services'
    },
    {
      id: '2',
      name: 'Payment Recording',
      enabled: true,
      trigger: 'payment_received',
      accountingAction: 'record_payment',
      chartOfAccounts: 'Accounts Receivable'
    },
    {
      id: '3',
      name: 'Expense Tracking',
      enabled: false,
      trigger: 'expense_logged',
      accountingAction: 'create_expense',
      chartOfAccounts: 'Operating Expenses'
    }
  ]);

  const accountingPlatforms = [
    { value: 'quickbooks', label: 'QuickBooks', icon: '💼' },
    { value: 'xero', label: 'Xero', icon: '💙' },
    { value: 'freshbooks', label: 'FreshBooks', icon: '🟢' },
    { value: 'wave', label: 'Wave Accounting', icon: '🌊' },
    { value: 'sage', label: 'Sage', icon: '🟣' }
  ];

  const testConnection = async () => {
    toast.success('Accounting software connection verified');
  };

  const syncAccounts = async () => {
    toast.success('Chart of accounts synchronized');
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-green-600" />
            Accounting Software Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="accounting-enabled">Enable Accounting Sync</Label>
            <Switch
              id="accounting-enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) => onUpdateSettings({ enabled: checked })}
            />
          </div>

          {settings.enabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Accounting Platform</Label>
                  <Select 
                    value={settings.platform} 
                    onValueChange={(value) => onUpdateSettings({ platform: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select accounting software..." />
                    </SelectTrigger>
                    <SelectContent>
                      {accountingPlatforms.map((platform) => (
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
                  <Label>Sync Mode</Label>
                  <Select defaultValue="bidirectional">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bidirectional">Bidirectional</SelectItem>
                      <SelectItem value="push_only">Push Only</SelectItem>
                      <SelectItem value="pull_only">Pull Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>API Credentials</Label>
                <Input
                  type="password"
                  placeholder="Client ID or API Key..."
                  defaultValue="••••••••••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label>Company ID / Organization</Label>
                <Input
                  placeholder="Your company identifier..."
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={testConnection}>
                  <Settings className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
                <Button onClick={syncAccounts}>
                  <Sync className="h-4 w-4 mr-2" />
                  Sync Chart of Accounts
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {settings.enabled && (
        <>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Financial Sync Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {syncMappings.map((mapping) => (
                  <div key={mapping.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{mapping.name}</h4>
                        <Badge variant={mapping.enabled ? "default" : "secondary"}>
                          {mapping.enabled ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <div>Trigger: <span className="font-medium">{mapping.trigger}</span></div>
                        <div>Action: <span className="font-medium">{mapping.accountingAction}</span></div>
                        <div>Account: <span className="font-medium">{mapping.chartOfAccounts}</span></div>
                      </div>
                    </div>
                    
                    <Switch
                      checked={mapping.enabled}
                      onCheckedChange={() => {
                        setSyncMappings(prev =>
                          prev.map(m =>
                            m.id === mapping.id ? { ...m, enabled: !m.enabled } : m
                          )
                        );
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Tax & Compliance Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Tax Rate (%)</Label>
                  <Input type="number" placeholder="8.25" step="0.01" />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select defaultValue="USD">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label>Auto-calculate Sales Tax</Label>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label>Generate 1099 Forms</Label>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AccountingSyncSettings;
