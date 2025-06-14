
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Zap, Clock, Mail, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AutomationBuilder from './AutomationBuilder';

interface Automation {
  id: string;
  name: string;
  trigger: string;
  actions: string[];
  isActive: boolean;
  type: 'customer' | 'ticket';
}

const AutomationManager = () => {
  const [automations, setAutomations] = useState<Automation[]>([
    {
      id: '1',
      name: 'Welcome New Customers',
      trigger: 'Customer moves to "New Leads"',
      actions: ['Send welcome email', 'Assign to sales rep'],
      isActive: true,
      type: 'customer'
    },
    {
      id: '2',
      name: 'High Priority Ticket Alert',
      trigger: 'Ticket priority set to "Urgent"',
      actions: ['Send SMS notification', 'Assign to manager'],
      isActive: true,
      type: 'ticket'
    },
    {
      id: '3',
      name: 'Follow-up Reminder',
      trigger: 'Customer in "Contacted" for 3 days',
      actions: ['Create follow-up task', 'Send reminder email'],
      isActive: false,
      type: 'customer'
    }
  ]);

  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  const toggleAutomation = (id: string) => {
    setAutomations(prev => 
      prev.map(auto => 
        auto.id === id ? { ...auto, isActive: !auto.isActive } : auto
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Automation Manager</h2>
          <p className="text-muted-foreground">
            Create automated workflows to streamline your processes
          </p>
        </div>
        <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Automation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Automation Builder</DialogTitle>
            </DialogHeader>
            <AutomationBuilder onClose={() => setIsBuilderOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {automations.map((automation) => (
          <Card key={automation.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    {automation.name}
                    <Badge variant={automation.type === 'customer' ? 'default' : 'secondary'}>
                      {automation.type}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{automation.trigger}</CardDescription>
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
                      {action.includes('task') && <span className="text-orange-500">📋</span>}
                      {action.includes('Assign') && <span className="text-purple-500">👤</span>}
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm">Edit</Button>
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
    </div>
  );
};

export default AutomationManager;
