
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Zap, Clock, Mail, ArrowRight, Webhook, Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AutomationBuilder from './AutomationBuilder';
import WebhookManager from './WebhookManager';

interface Automation {
  id: string;
  name: string;
  trigger: string;
  actions: string[];
  isActive: boolean;
  type: 'customer' | 'ticket';
  triggerType?: 'simple' | 'advanced' | 'time' | 'webhook';
  lastTriggered?: string;
  triggerCount?: number;
}

const AutomationManager = () => {
  const [automations, setAutomations] = useState<Automation[]>([
    {
      id: '1',
      name: 'Welcome New Customers',
      trigger: 'Customer moves to "New Leads"',
      actions: ['Send welcome email', 'Assign to sales rep'],
      isActive: true,
      type: 'customer',
      triggerType: 'simple',
      lastTriggered: '2024-06-14T10:30:00Z',
      triggerCount: 45
    },
    {
      id: '2',
      name: 'High Priority Ticket Alert',
      trigger: 'Ticket priority set to "Urgent"',
      actions: ['Send SMS notification', 'Assign to manager'],
      isActive: true,
      type: 'ticket',
      triggerType: 'simple',
      lastTriggered: '2024-06-14T09:15:00Z',
      triggerCount: 12
    },
    {
      id: '3',
      name: 'Follow-up Reminder',
      trigger: 'Customer in "Contacted" for 3 days',
      actions: ['Create follow-up task', 'Send reminder email'],
      isActive: false,
      type: 'customer',
      triggerType: 'time',
      triggerCount: 0
    },
    {
      id: '4',
      name: 'Zapier Integration Trigger',
      trigger: 'External webhook received',
      actions: ['Update customer status', 'Send notification'],
      isActive: true,
      type: 'customer',
      triggerType: 'webhook',
      lastTriggered: '2024-06-14T08:45:00Z',
      triggerCount: 78
    }
  ]);

  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('automations');

  const toggleAutomation = (id: string) => {
    setAutomations(prev => 
      prev.map(auto => 
        auto.id === id ? { ...auto, isActive: !auto.isActive } : auto
      )
    );
  };

  const getTriggerIcon = (triggerType?: string) => {
    switch (triggerType) {
      case 'time': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'webhook': return <Webhook className="h-4 w-4 text-green-500" />;
      case 'advanced': return <Settings className="h-4 w-4 text-purple-500" />;
      default: return <Zap className="h-4 w-4 text-quikle-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Automation Manager</h2>
          <p className="text-muted-foreground">
            Create automated workflows and manage external integrations
          </p>
        </div>
        <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Automation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Automation Builder</DialogTitle>
            </DialogHeader>
            <AutomationBuilder onClose={() => setIsBuilderOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="automations">Automations</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="automations" className="space-y-4">
          <div className="grid gap-4">
            {automations.map((automation) => (
              <Card key={automation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getTriggerIcon(automation.triggerType)}
                        {automation.name}
                        <Badge variant={automation.type === 'customer' ? 'default' : 'secondary'}>
                          {automation.type}
                        </Badge>
                        {automation.triggerType && automation.triggerType !== 'simple' && (
                          <Badge variant="outline" className="text-xs">
                            {automation.triggerType}
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span>{automation.trigger}</span>
                        {automation.triggerCount !== undefined && (
                          <span className="text-xs">
                            • {automation.triggerCount} triggers
                            {automation.lastTriggered && (
                              <> • Last: {new Date(automation.lastTriggered).toLocaleDateString()}</>
                            )}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <Switch
                      checked={automation.isActive}
                      onCheckedChange={() => toggleAutomation(automation.id)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Trigger: {automation.trigger}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Actions:</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-6">
                      {automation.actions.map((action, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          {action.includes('email') && <Mail className="h-4 w-4 text-blue-500" />}
                          {action.includes('SMS') && <span className="text-green-500">📱</span>}
                          {action.includes('task') && <span className="text-quikle-slate">📋</span>}
                          {action.includes('Assign') && <span className="text-purple-500">👤</span>}
                          {action.includes('webhook') && <Webhook className="h-4 w-4 text-green-500" />}
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Test</Button>
                      <Button variant="outline" size="sm" className="text-red-600">Delete</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {automations.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-lg font-semibold mb-2">No Automations Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first automation to streamline your workflow
                </p>
                <Button onClick={() => setIsBuilderOpen(true)}>
                  Create Your First Automation
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="webhooks">
          <WebhookManager />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Automations</p>
                    <p className="text-2xl font-bold">{automations.length}</p>
                  </div>
                  <Zap className="h-8 w-8 text-quikle-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Automations</p>
                    <p className="text-2xl font-bold">{automations.filter(a => a.isActive).length}</p>
                  </div>
                  <Settings className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Triggers</p>
                    <p className="text-2xl font-bold">
                      {automations.reduce((sum, a) => sum + (a.triggerCount || 0), 0)}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomationManager;
