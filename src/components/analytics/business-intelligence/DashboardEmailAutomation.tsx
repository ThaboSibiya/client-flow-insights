
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Mail, Plus, Settings, Send } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardEmailSettings } from './types';

const DashboardEmailAutomation = () => {
  const [emailSettings, setEmailSettings] = useState<DashboardEmailSettings[]>([
    {
      id: '1',
      name: 'Weekly Executive Summary',
      frequency: 'weekly',
      recipients: ['ceo@company.com', 'management@company.com'],
      dashboardType: 'overview',
      enabled: true,
      lastSent: '2024-01-15',
      nextScheduled: '2024-01-22',
      includeCharts: true,
      includeMetrics: true,
    },
    {
      id: '2',
      name: 'Daily Sales Report',
      frequency: 'daily',
      recipients: ['sales@company.com'],
      dashboardType: 'sales',
      enabled: true,
      lastSent: '2024-01-21',
      nextScheduled: '2024-01-22',
      includeCharts: false,
      includeMetrics: true,
    },
  ]);

  const [newEmail, setNewEmail] = useState({
    name: '',
    frequency: 'weekly' as const,
    recipients: '',
    dashboardType: 'overview' as const,
    includeCharts: true,
    includeMetrics: true,
  });

  const addEmailSetting = () => {
    if (!newEmail.name || !newEmail.recipients) {
      toast.error('Please fill in all required fields');
      return;
    }

    const recipients = newEmail.recipients.split(',').map(email => email.trim());
    const nextScheduled = new Date();
    
    // Fix the comparison issue by using proper logic
    if (newEmail.frequency === 'daily') {
      nextScheduled.setDate(nextScheduled.getDate() + 1);
    } else if (newEmail.frequency === 'weekly') {
      nextScheduled.setDate(nextScheduled.getDate() + 7);
    } else {
      // monthly
      nextScheduled.setMonth(nextScheduled.getMonth() + 1);
    }

    const emailSetting: DashboardEmailSettings = {
      id: Date.now().toString(),
      name: newEmail.name,
      frequency: newEmail.frequency,
      recipients,
      dashboardType: newEmail.dashboardType,
      enabled: true,
      lastSent: '',
      nextScheduled: nextScheduled.toISOString().split('T')[0],
      includeCharts: newEmail.includeCharts,
      includeMetrics: newEmail.includeMetrics,
    };

    setEmailSettings([...emailSettings, emailSetting]);
    setNewEmail({
      name: '',
      frequency: 'weekly',
      recipients: '',
      dashboardType: 'overview',
      includeCharts: true,
      includeMetrics: true,
    });
    toast.success('Dashboard email automation created');
  };

  const toggleEmailSetting = (id: string) => {
    setEmailSettings(prev =>
      prev.map(setting =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  const sendTestEmail = (setting: DashboardEmailSettings) => {
    toast.success(`Test email sent for "${setting.name}"`);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-600" />
            Create Dashboard Email Automation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email-name">Report Name</Label>
              <Input
                id="email-name"
                placeholder="e.g., Weekly Executive Summary"
                value={newEmail.name}
                onChange={(e) => setNewEmail({ ...newEmail, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={newEmail.frequency} onValueChange={(value: any) => setNewEmail({ ...newEmail, frequency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dashboard-type">Dashboard Type</Label>
              <Select value={newEmail.dashboardType} onValueChange={(value: any) => setNewEmail({ ...newEmail, dashboardType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="customers">Customers</SelectItem>
                  <SelectItem value="tickets">Tickets</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipients">Recipients (comma-separated)</Label>
              <Input
                id="recipients"
                placeholder="user1@company.com, user2@company.com"
                value={newEmail.recipients}
                onChange={(e) => setNewEmail({ ...newEmail, recipients: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                checked={newEmail.includeCharts}
                onCheckedChange={(checked) => setNewEmail({ ...newEmail, includeCharts: checked })}
              />
              <Label>Include Charts</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={newEmail.includeMetrics}
                onCheckedChange={(checked) => setNewEmail({ ...newEmail, includeMetrics: checked })}
              />
              <Label>Include Metrics</Label>
            </div>
          </div>

          <Button onClick={addEmailSetting} className="w-full">
            <Mail className="h-4 w-4 mr-2" />
            Create Email Automation
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-green-600" />
            Active Email Automations ({emailSettings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {emailSettings.map((setting) => (
              <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{setting.name}</h4>
                    <Badge variant={setting.enabled ? "default" : "secondary"}>
                      {setting.enabled ? 'Active' : 'Disabled'}
                    </Badge>
                    <Badge variant="outline">{setting.frequency}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Type:</span> {setting.dashboardType}
                    </div>
                    <div>
                      <span className="font-medium">Recipients:</span> {setting.recipients.length}
                    </div>
                    <div>
                      <span className="font-medium">Next Send:</span> {setting.nextScheduled}
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm text-muted-foreground">
                    <span className="font-medium">Recipients:</span> {setting.recipients.join(', ')}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={setting.enabled}
                    onCheckedChange={() => toggleEmailSetting(setting.id)}
                  />
                  <Button variant="outline" size="sm" onClick={() => sendTestEmail(setting)}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {emailSettings.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No email automations configured yet. Create your first one above.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardEmailAutomation;
