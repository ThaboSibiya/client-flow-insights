
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Play, Pause, Edit, Trash2, Zap, Clock, Target, TrendingUp } from "lucide-react";
import AutomationBuilder from './AutomationBuilder';
import PerformanceMonitor from './PerformanceMonitor';

interface Automation {
  id: string;
  name: string;
  type: 'customer' | 'ticket';
  trigger: string;
  conditions: string[];
  actions: string[];
  isActive: boolean;
  executionCount: number;
  successRate: number;
  lastRun: string;
}

const AutomationManager = () => {
  const [automations, setAutomations] = useState<Automation[]>([
    {
      id: '1',
      name: 'Auto-progress qualified customers',
      type: 'customer',
      trigger: 'Time-based (7 days)',
      conditions: ['Status = qualified', 'No recent activity'],
      actions: ['Move to next stage', 'Send follow-up email'],
      isActive: true,
      executionCount: 156,
      successRate: 94.2,
      lastRun: '2 hours ago'
    },
    {
      id: '2',
      name: 'Escalate high-priority tickets',
      type: 'ticket',
      trigger: 'Condition-based',
      conditions: ['Priority = urgent', 'Time in stage > 2 hours'],
      actions: ['Assign to manager', 'Send notification'],
      isActive: true,
      executionCount: 43,
      successRate: 100,
      lastRun: '15 minutes ago'
    },
    {
      id: '3',
      name: 'Customer follow-up sequence',
      type: 'customer',
      trigger: 'Action-based',
      conditions: ['New customer added', 'Status = new'],
      actions: ['Send welcome email', 'Schedule call', 'Add to nurture sequence'],
      isActive: false,
      executionCount: 89,
      successRate: 87.6,
      lastRun: '1 day ago'
    }
  ]);

  const [showBuilder, setShowBuilder] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);

  const toggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(auto => 
      auto.id === id ? { ...auto, isActive: !auto.isActive } : auto
    ));
  };

  const deleteAutomation = (id: string) => {
    setAutomations(prev => prev.filter(auto => auto.id !== id));
  };

  const editAutomation = (automation: Automation) => {
    setEditingAutomation(automation);
    setShowBuilder(true);
  };

  const handleBuilderClose = () => {
    setShowBuilder(false);
    setEditingAutomation(null);
  };

  if (showBuilder) {
    return (
      <AutomationBuilder 
        onClose={handleBuilderClose}
        initialData={editingAutomation}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-quikle-charcoal">Pipeline Automation</h2>
          <p className="text-quikle-slate">
            Automate stage progression, notifications, and actions based on time, conditions, or user actions.
          </p>
        </div>
        <Button 
          onClick={() => setShowBuilder(true)}
          className="bg-quikle-primary text-white hover:bg-quikle-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Automation
        </Button>
      </div>

      <Tabs defaultValue="automations" className="w-full">
        <TabsList>
          <TabsTrigger value="automations">Automations</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="automations" className="space-y-4">
          {/* Automation Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Automations</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {automations.filter(a => a.isActive).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {automations.length} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
                <Play className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {automations.reduce((sum, a) => sum + a.executionCount, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {automations.length > 0 
                    ? (automations.reduce((sum, a) => sum + a.successRate, 0) / automations.length).toFixed(1)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Average across all automations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">47h</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Automation List */}
          <div className="space-y-4">
            {automations.map((automation) => (
              <Card key={automation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={automation.isActive}
                        onCheckedChange={() => toggleAutomation(automation.id)}
                      />
                      <div>
                        <CardTitle className="text-lg">{automation.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">
                            {automation.type === 'customer' ? 'Customer' : 'Ticket'}
                          </Badge>
                          <Badge variant={automation.isActive ? 'default' : 'secondary'}>
                            {automation.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editAutomation(automation)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteAutomation(automation.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Trigger</h4>
                      <p className="text-sm text-muted-foreground">{automation.trigger}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Conditions</h4>
                      <div className="space-y-1">
                        {automation.conditions.map((condition, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Actions</h4>
                      <div className="space-y-1">
                        {automation.actions.map((action, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {action}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Performance</h4>
                      <div className="space-y-1">
                        <p className="text-sm">Executions: {automation.executionCount}</p>
                        <p className="text-sm">Success: {automation.successRate}%</p>
                        <p className="text-xs text-muted-foreground">Last run: {automation.lastRun}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceMonitor />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Automation Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Execution trends and performance metrics over time will be displayed here.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  How automations are affecting your pipeline conversion rates and efficiency.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomationManager;
