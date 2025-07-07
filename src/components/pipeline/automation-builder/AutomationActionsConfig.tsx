
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";

interface AutomationActionsConfigProps {
  actions: any[];
  setActions: (actions: any[]) => void;
}

const AutomationActionsConfig = ({ actions, setActions }: AutomationActionsConfigProps) => {
  const actionTypes = [
    'Move to stage',
    'Send email',
    'Create task',
    'Update field',
    'Send notification',
    'Assign to user',
    'Add tag'
  ];

  const addAction = () => {
    const newAction = {
      id: `action-${Date.now()}`,
      type: actionTypes[0],
      target: '',
      value: '',
      delay: 0
    };
    setActions([...actions, newAction]);
  };

  const removeAction = (actionId: string) => {
    setActions(actions.filter(a => a.id !== actionId));
  };

  const updateAction = (actionId: string, field: string, value: any) => {
    setActions(actions.map(action => 
      action.id === actionId 
        ? { ...action, [field]: value }
        : action
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Actions Configuration
          <Button onClick={addAction} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Add Action
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {actions.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No actions configured. Click "Add Action" to get started.
          </p>
        ) : (
          actions.map((action, index) => (
            <Card key={action.id} className="border border-dashed">
              <CardContent className="pt-4">
                <div className="flex gap-2 items-center">
                  <span className="text-sm font-medium w-16">
                    #{index + 1}
                  </span>
                  
                  <Select 
                    value={action.type}
                    onValueChange={(value) => updateAction(action.id, 'type', value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {actionTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    value={action.target}
                    onChange={(e) => updateAction(action.id, 'target', e.target.value)}
                    placeholder="Target..."
                    className="flex-1"
                  />

                  <Input
                    value={action.value}
                    onChange={(e) => updateAction(action.id, 'value', e.target.value)}
                    placeholder="Value..."
                    className="flex-1"
                  />

                  <Input
                    type="number"
                    value={action.delay}
                    onChange={(e) => updateAction(action.id, 'delay', parseInt(e.target.value))}
                    placeholder="Delay (minutes)"
                    className="w-32"
                  />

                  <Button
                    onClick={() => removeAction(action.id)}
                    size="sm"
                    variant="ghost"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default AutomationActionsConfig;
