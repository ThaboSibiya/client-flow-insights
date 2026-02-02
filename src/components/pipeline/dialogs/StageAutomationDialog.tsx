import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  Zap, Mail, MessageSquare, Bell, Clock, ArrowRight, 
  Plus, Trash2, Settings, Play
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StageAutomationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stage: { id: string; name: string; automationEnabled: boolean };
  existingAutomations?: any[];
  onSaveAutomation: (automation: {
    name: string;
    triggerType: 'on_entry' | 'on_exit' | 'time_based';
    triggerConfig?: Record<string, any>;
    actions: any[];
    isActive: boolean;
  }) => void;
  onToggleAutomation?: (stageId: string, enabled: boolean) => void;
}

interface AutomationAction {
  id: string;
  type: 'send_email' | 'send_notification' | 'update_field' | 'assign_to' | 'add_tag' | 'webhook';
  config: Record<string, any>;
}

const ACTION_TYPES = [
  { value: 'send_email', label: 'Send Email', icon: Mail },
  { value: 'send_notification', label: 'Send Notification', icon: Bell },
  { value: 'assign_to', label: 'Assign To', icon: ArrowRight },
  { value: 'add_tag', label: 'Add Tag', icon: Plus },
  { value: 'webhook', label: 'Call Webhook', icon: Zap },
];

const StageAutomationDialog = ({
  open,
  onOpenChange,
  stage,
  existingAutomations = [],
  onSaveAutomation,
  onToggleAutomation,
}: StageAutomationDialogProps) => {
  const { toast } = useToast();
  const [automationName, setAutomationName] = useState('');
  const [triggerType, setTriggerType] = useState<'on_entry' | 'on_exit' | 'time_based'>('on_entry');
  const [timeDelay, setTimeDelay] = useState('24');
  const [actions, setActions] = useState<AutomationAction[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [activeTab, setActiveTab] = useState('create');

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
    if (!automationName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an automation name',
        variant: 'destructive',
      });
      return;
    }

    if (actions.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one action',
        variant: 'destructive',
      });
      return;
    }

    onSaveAutomation({
      name: automationName,
      triggerType,
      triggerConfig: triggerType === 'time_based' ? { delayHours: parseInt(timeDelay) } : undefined,
      actions: actions.map(a => ({ type: a.type, config: a.config })),
      isActive,
    });

    // Reset form
    setAutomationName('');
    setActions([]);
    setTriggerType('on_entry');
    setTimeDelay('24');
    onOpenChange(false);
  };

  const renderActionConfig = (action: AutomationAction) => {
    switch (action.type) {
      case 'send_email':
        return (
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
            <Input
              placeholder="Email subject"
              value={action.config.subject || ''}
              onChange={(e) => handleUpdateActionConfig(action.id, { subject: e.target.value })}
            />
            <Input
              placeholder="Email template name"
              value={action.config.template || ''}
              onChange={(e) => handleUpdateActionConfig(action.id, { template: e.target.value })}
            />
          </div>
        );
      case 'send_notification':
        return (
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
            <Input
              placeholder="Notification message"
              value={action.config.message || ''}
              onChange={(e) => handleUpdateActionConfig(action.id, { message: e.target.value })}
            />
          </div>
        );
      case 'assign_to':
        return (
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
            <Select
              value={action.config.assignee || ''}
              onValueChange={(value) => handleUpdateActionConfig(action.id, { assignee: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto-assign (round robin)</SelectItem>
                <SelectItem value="manager">Stage manager</SelectItem>
                <SelectItem value="owner">Account owner</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      case 'add_tag':
        return (
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
            <Input
              placeholder="Tag name"
              value={action.config.tag || ''}
              onChange={(e) => handleUpdateActionConfig(action.id, { tag: e.target.value })}
            />
          </div>
        );
      case 'webhook':
        return (
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
            <Input
              placeholder="Webhook URL"
              value={action.config.url || ''}
              onChange={(e) => handleUpdateActionConfig(action.id, { url: e.target.value })}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Stage Automation - {stage.name}
          </DialogTitle>
          <DialogDescription>
            Configure automations that trigger when items enter or exit this stage
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New
            </TabsTrigger>
            <TabsTrigger value="existing" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Existing ({existingAutomations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4 mt-4">
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
                  variant={triggerType === 'on_entry' ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => setTriggerType('on_entry')}
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  On Entry
                </Button>
                <Button
                  variant={triggerType === 'on_exit' ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => setTriggerType('on_exit')}
                >
                  <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                  On Exit
                </Button>
                <Button
                  variant={triggerType === 'time_based' ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => setTriggerType('time_based')}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Time-based
                </Button>
              </div>
            </div>

            {/* Time delay for time-based triggers */}
            {triggerType === 'time_based' && (
              <div className="space-y-2">
                <Label>Delay (hours after entering stage)</Label>
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
              <div className="flex flex-wrap gap-2 mb-3">
                {ACTION_TYPES.map((action) => (
                  <Button
                    key={action.value}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddAction(action.value)}
                  >
                    <action.icon className="h-3.5 w-3.5 mr-1.5" />
                    {action.label}
                  </Button>
                ))}
              </div>

              {/* Action list */}
              <div className="space-y-3">
                {actions.map((action, index) => {
                  const actionType = ACTION_TYPES.find(a => a.value === action.type);
                  return (
                    <div key={action.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {index + 1}
                          </Badge>
                          {actionType && <actionType.icon className="h-4 w-4" />}
                          <span className="font-medium text-sm">{actionType?.label}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => handleRemoveAction(action.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {renderActionConfig(action)}
                    </div>
                  );
                })}

                {actions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                    <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No actions added yet</p>
                    <p className="text-sm">Click a button above to add an action</p>
                  </div>
                )}
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                <span className="font-medium">Active</span>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </TabsContent>

          <TabsContent value="existing" className="mt-4">
            {existingAutomations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No automations yet</p>
                <p className="text-sm">Create your first automation for this stage</p>
              </div>
            ) : (
              <div className="space-y-3">
                {existingAutomations.map((automation) => (
                  <div 
                    key={automation.id} 
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-amber-500" />
                        <span className="font-medium">{automation.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {automation.trigger_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {automation.actions?.length || 0} actions • 
                        Executed {automation.execution_count || 0} times
                      </p>
                    </div>
                    <Switch 
                      checked={automation.is_active} 
                      onCheckedChange={() => {}}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {activeTab === 'create' && (
            <Button onClick={handleSave} disabled={!automationName || actions.length === 0}>
              <Zap className="h-4 w-4 mr-2" />
              Create Automation
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StageAutomationDialog;
