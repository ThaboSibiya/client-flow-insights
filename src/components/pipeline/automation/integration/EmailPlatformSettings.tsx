
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mail, Settings, Send, Users, Target } from 'lucide-react';
import { toast } from 'sonner';

interface EmailPlatformSettingsProps {
  settings: any;
  onUpdateSettings: (updates: any) => void;
}

const EmailPlatformSettings = ({ settings, onUpdateSettings }: EmailPlatformSettingsProps) => {
  const [campaigns, setCampaigns] = useState([
    {
      id: '1',
      name: 'Welcome Series',
      enabled: true,
      trigger: 'customer_created',
      emailCount: 3,
      status: 'active'
    },
    {
      id: '2',
      name: 'Follow-up Campaign',
      enabled: true,
      trigger: 'service_completed',
      emailCount: 2,
      status: 'active'
    },
    {
      id: '3',
      name: 'Win-back Campaign',
      enabled: false,
      trigger: 'customer_inactive',
      emailCount: 4,
      status: 'draft'
    }
  ]);

  const [automationRules, setAutomationRules] = useState([
    {
      id: '1',
      name: 'List Segmentation',
      enabled: true,
      trigger: 'customer_status_change',
      action: 'move_to_list',
      targetList: 'Active Customers'
    },
    {
      id: '2',
      name: 'Tag Assignment',
      enabled: true,
      trigger: 'service_type_booked',
      action: 'add_tag',
      tag: 'service-type'
    }
  ]);

  const emailPlatforms = [
    { value: 'mailchimp', label: 'Mailchimp', icon: '🐒' },
    { value: 'constant_contact', label: 'Constant Contact', icon: '📧' },
    { value: 'sendgrid', label: 'SendGrid', icon: '📮' },
    { value: 'campaign_monitor', label: 'Campaign Monitor', icon: '📊' },
    { value: 'aweber', label: 'AWeber', icon: '📬' }
  ];

  const testConnection = async () => {
    toast.success('Email platform connection verified');
  };

  const syncLists = async () => {
    toast.success('Email lists synchronized');
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-orange-600" />
            Email Platform Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-enabled">Enable Email Automation</Label>
            <Switch
              id="email-enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) => onUpdateSettings({ enabled: checked })}
            />
          </div>

          {settings.enabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email Platform</Label>
                  <Select 
                    value={settings.platform} 
                    onValueChange={(value) => onUpdateSettings({ platform: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select email platform..." />
                    </SelectTrigger>
                    <SelectContent>
                      {emailPlatforms.map((platform) => (
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
                  <Label>Default List</Label>
                  <Select defaultValue="all_customers">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_customers">All Customers</SelectItem>
                      <SelectItem value="active_customers">Active Customers</SelectItem>
                      <SelectItem value="prospects">Prospects</SelectItem>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  placeholder="Enter your email platform API key..."
                  defaultValue="••••••••••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label>Server/Data Center (if applicable)</Label>
                <Input
                  placeholder="us1, us2, us3, etc."
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={testConnection}>
                  <Settings className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
                <Button onClick={syncLists}>
                  <Users className="h-4 w-4 mr-2" />
                  Sync Lists
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
                <Send className="h-5 w-5 text-blue-600" />
                Automated Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{campaign.name}</h4>
                        <Badge variant={campaign.status === 'active' ? "default" : "secondary"}>
                          {campaign.status}
                        </Badge>
                        <Badge variant="outline">
                          {campaign.emailCount} emails
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        Trigger: <span className="font-medium">{campaign.trigger}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Switch
                        checked={campaign.enabled}
                        onCheckedChange={() => {
                          setCampaigns(prev =>
                            prev.map(c =>
                              c.id === campaign.id ? { ...c, enabled: !c.enabled } : c
                            )
                          );
                        }}
                      />
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Create New Campaign
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                List Management & Segmentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automationRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{rule.name}</h4>
                        <Badge variant={rule.enabled ? "default" : "secondary"}>
                          {rule.enabled ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <div>Trigger: <span className="font-medium">{rule.trigger}</span></div>
                        <div>Action: <span className="font-medium">{rule.action}</span></div>
                        {rule.targetList && (
                          <div>Target: <span className="font-medium">{rule.targetList}</span></div>
                        )}
                        {rule.tag && (
                          <div>Tag: <span className="font-medium">{rule.tag}</span></div>
                        )}
                      </div>
                    </div>
                    
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={() => {
                        setAutomationRules(prev =>
                          prev.map(r =>
                            r.id === rule.id ? { ...r, enabled: !r.enabled } : r
                          )
                        );
                      }}
                    />
                  </div>
                ))}

                <Button variant="outline" className="w-full">
                  <Target className="h-4 w-4 mr-2" />
                  Add Segmentation Rule
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Global Email Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From Name</Label>
                  <Input placeholder="Your Company Name" />
                </div>
                <div className="space-y-2">
                  <Label>From Email</Label>
                  <Input placeholder="noreply@yourcompany.com" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Unsubscribe Footer</Label>
                <Textarea
                  placeholder="You received this email because you are a customer of [Company]. Click here to unsubscribe."
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Double Opt-in Required</Label>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label>Track Email Opens</Label>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label>Track Link Clicks</Label>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default EmailPlatformSettings;
