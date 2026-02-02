import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Zap, CheckCircle, Plus, Trash2, Mail, Bell, 
  ArrowRight, Clock, Settings, Play 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SetAutomationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stage: {
    id: string;
    name: string;
    automationEnabled: boolean;
  } | null;
  onSetAutomation: (stageId: string, enabled: boolean) => void;
}

interface AutomationAction {
  id: string;
  type: 'send_email' | 'send_notification' | 'assign_to' | 'add_tag' | 'webhook';
  config: Record<string, any>;
}

const ACTION_TYPES = [
  { value: 'send_email', label: 'Send Email', icon: Mail },
  { value: 'send_notification', label: 'Notify', icon: Bell },
  { value: 'assign_to', label: 'Assign', icon: ArrowRight },
  { value: 'add_tag', label: 'Add Tag', icon: Plus },
  { value: 'webhook', label: 'Webhook', icon: Zap },
];

const SetAutomationDialog = ({ open, onOpenChange, stage, onSetAutomation }: SetAutomationDialogProps) => {
  const { toast } = useToast();
  const [automationEnabled, setAutomationEnabled] = useState(stage?.automationEnabled || false);
  const [automationName, setAutomationName] = useState('');
  const [triggerType, setTriggerType] = useState<'on_entry' | 'on_exit' | 'time_based'>('on_entry');
  const [timeDelay, setTimeDelay] = useState('24');
  const [actions, setActions] = useState<AutomationAction[]>([]);
  const [activeTab, setActiveTab] = useState('quick');

  React.useEffect(() => {
    if (stage) {
      setAutomationEnabled(stage.automationEnabled);
    }
  }, [stage]);

  const handleAddAction = (type: string) => {
    const newAction: AutomationAction = {
      id: `action-${Date.now()}`,
      type: type as AutomationAction['type'],
      config: {},
    };
    setActions([...actions, newAction]);
  };

  const handleRemoveAction = (actionId: string) => {
    setActions(actions.filter(a => a.id !== actionId));
  };

  const handleUpdateActionConfig = (actionId: string, config: Record<string, any>) => {
    setActions(actions.map(a => 
      a.id === actionId ? { ...a, config: { ...a.config, ...config } } : a
    ));
  };

  const handleSave = () => {
    if (stage) {
      onSetAutomation(stage.id, automationEnabled);
      
      if (automationEnabled && actions.length > 0 && automationName) {
        toast({
          title: 'Automation Saved',
          description: `Created "${automationName}" with ${actions.length} actions`,
        });
      }
      
      onOpenChange(false);
    }
  };

  const renderActionConfig = (action: AutomationAction) => {
    switch (action.type) {
      case 'send_email':
        return (
          <Input
            placeholder="Email subject"
            value={action.config.subject || ''}
            onChange={(e) => handleUpdateActionConfig(action.id, { subject: e.target.value })}
            className="mt-2"
          />
        );
      case 'send_notification':
        return (
          <Input
            placeholder="Notification message"
            value={action.config.message || ''}
            onChange={(e) => handleUpdateActionConfig(action.id, { message: e.target.value })}
            className="mt-2"
          />
        );
      case 'assign_to':
        return (
          <Select
            value={action.config.assignee || ''}
            onValueChange={(value) => handleUpdateActionConfig(action.id, { assignee: value })}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto-assign (round robin)</SelectItem>
              <SelectItem value="manager">Stage manager</SelectItem>
              <SelectItem value="owner">Account owner</SelectItem>
            </SelectContent>
          </Select>
        );
      case 'add_tag':
        return (
          <Input
            placeholder="Tag name"
            value={action.config.tag || ''}
            onChange={(e) => handleUpdateActionConfig(action.id, { tag: e.target.value })}
            className="mt-2"
          />
        );
      case 'webhook':
        return (
          <Input
            placeholder="Webhook URL"
            value={action.config.url || ''}
            onChange={(e) => handleUpdateActionConfig(action.id, { url: e.target.value })}
            className="mt-2"
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Automation for "{stage?.name}"
          </DialogTitle>
          <DialogDescription>
            Configure automation rules that trigger when items enter this stage.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Enable toggle */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="automation-toggle" className="text-base font-medium">
                Enable Automation
              </Label>
              <p className="text-sm text-muted-foreground">
                Run automations when items enter this stage
              </p>
            </div>
            <Switch
              id="automation-toggle"
              checked={automationEnabled}
              onCheckedChange={setAutomationEnabled}
            />
          </div>
          
          {automationEnabled && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="quick">
                  <Play className="h-4 w-4 mr-2" />
                  Quick Setup
                </TabsTrigger>
                <TabsTrigger value="advanced">
                  <Settings className="h-4 w-4 mr-2" />
                  Advanced
                </TabsTrigger>
              </TabsList>

              <TabsContent value="quick" className="space-y-4 mt-4">
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Available Actions</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1.5 ml-6">
                    <li>• Auto-assign to team members</li>
                    <li>• Send notification emails</li>
                    <li>• Update customer status</li>
                    <li>• Create follow-up tasks</li>
                    <li>• Trigger webhooks</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 mt-4">
                {/* Automation Name */}
                <div className="space-y-2">
                  <Label>Automation Name</Label>
                  <Input
                    placeholder="e.g., Welcome email for new leads"
                    value={automationName}
                    onChange={(e) => setAutomationName(e.target.value)}
                  />
                </div>

                {/* Trigger Type */}
                <div className="space-y-2">
                  <Label>Trigger When</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant={triggerType === 'on_entry' ? 'default' : 'outline'}
                      size="sm"
                      className="w-full"
                      onClick={() => setTriggerType('on_entry')}
                    >
                      Entry
                    </Button>
                    <Button
                      type="button"
                      variant={triggerType === 'on_exit' ? 'default' : 'outline'}
                      size="sm"
                      className="w-full"
                      onClick={() => setTriggerType('on_exit')}
                    >
                      Exit
                    </Button>
                    <Button
                      type="button"
                      variant={triggerType === 'time_based' ? 'default' : 'outline'}
                      size="sm"
                      className="w-full"
                      onClick={() => setTriggerType('time_based')}
                    >
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      Delay
                    </Button>
                  </div>
                </div>

                {triggerType === 'time_based' && (
                  <div className="space-y-2">
                    <Label>Delay (hours)</Label>
                    <Input
                      type="number"
                      value={timeDelay}
                      onChange={(e) => setTimeDelay(e.target.value)}
                      min="1"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  <Label>Actions</Label>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {ACTION_TYPES.map((action) => (
                      <Button
                        key={action.value}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddAction(action.value)}
                      >
                        <action.icon className="h-3 w-3 mr-1" />
                        {action.label}
                      </Button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {actions.map((action, index) => {
                      const actionType = ACTION_TYPES.find(a => a.value === action.type);
                      return (
                        <div key={action.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {index + 1}
                              </Badge>
                              {actionType && <actionType.icon className="h-4 w-4" />}
                              <span className="font-medium text-sm">{actionType?.label}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                              onClick={() => handleRemoveAction(action.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          {renderActionConfig(action)}
                        </div>
                      );
                    })}

                    {actions.length === 0 && (
                      <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg">
                        <Zap className="h-6 w-6 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Add actions above</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Zap className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SetAutomationDialog;