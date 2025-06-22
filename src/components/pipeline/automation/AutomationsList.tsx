
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Clock, Users, Zap } from "lucide-react";

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

interface AutomationsListProps {
  automations: Automation[];
  onToggleAutomation: (id: string) => void;
  onCreateNew: () => void;
}

const AutomationsList = ({ automations, onToggleAutomation, onCreateNew }: AutomationsListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Active Automations</h3>
        <Button onClick={onCreateNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New
        </Button>
      </div>

      {automations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Automations Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first automation to get started</p>
            <Button onClick={onCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Automation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {automations.map((automation) => (
            <Card key={automation.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <CardTitle className="text-base">{automation.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{automation.trigger}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={automation.isActive ? 'default' : 'secondary'}>
                      {automation.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Switch
                      checked={automation.isActive}
                      onCheckedChange={() => onToggleAutomation(automation.id)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <strong>Actions:</strong> {automation.actions.join(', ')}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    {automation.lastTriggered && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last: {new Date(automation.lastTriggered).toLocaleDateString()}
                      </div>
                    )}
                    {automation.triggerCount !== undefined && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Triggered: {automation.triggerCount} times
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutomationsList;
