
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Zap } from "lucide-react";

interface AutomationBuilderProps {
  onClose: () => void;
}

const AutomationBuilder = ({ onClose }: AutomationBuilderProps) => {
  const [automationName, setAutomationName] = useState('');
  const [automationType, setAutomationType] = useState<'customer' | 'ticket'>('customer');
  const [trigger, setTrigger] = useState('');
  const [actions, setActions] = useState<string[]>([]);

  const triggerOptions = {
    customer: [
      'Customer moves to stage',
      'Customer added to pipeline',
      'Customer inactive for X days',
      'Customer status changes'
    ],
    ticket: [
      'Ticket moves to stage',
      'Ticket priority changes',
      'Ticket assigned',
      'Ticket overdue'
    ]
  };

  const actionOptions = [
    'Send email notification',
    'Send SMS notification',
    'Create task',
    'Assign to team member',
    'Move to different stage',
    'Update priority',
    'Add tag',
    'Send webhook'
  ];

  const addAction = (action: string) => {
    if (!actions.includes(action)) {
      setActions([...actions, action]);
    }
  };

  const removeAction = (actionToRemove: string) => {
    setActions(actions.filter(action => action !== actionToRemove));
  };

  const handleSave = () => {
    if (automationName && trigger && actions.length > 0) {
      // Here you would save the automation
      console.log('Saving automation:', {
        name: automationName,
        type: automationType,
        trigger,
        actions
      });
      onClose();
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Automation Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="automationName">Automation Name</Label>
              <Input
                id="automationName"
                value={automationName}
                onChange={(e) => setAutomationName(e.target.value)}
                placeholder="Enter automation name..."
              />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={automationType} onValueChange={(value: 'customer' | 'ticket') => setAutomationType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer Pipeline</SelectItem>
                  <SelectItem value="ticket">Ticket Pipeline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Trigger</Label>
              <Select value={trigger} onValueChange={setTrigger}>
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger..." />
                </SelectTrigger>
                <SelectContent>
                  {triggerOptions[automationType].map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Add Action</Label>
              <Select onValueChange={addAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action to add..." />
                </SelectTrigger>
                <SelectContent>
                  {actionOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Selected Actions ({actions.length})</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {actions.map((action, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm">{action}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAction(action)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              {actions.length === 0 && (
                <p className="text-sm text-muted-foreground">No actions selected</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Automation Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline">{automationType}</Badge>
              <span className="font-medium">{automationName || 'Untitled Automation'}</span>
            </div>
            
            <div className="text-sm space-y-2">
              <div>
                <span className="font-medium">When:</span> {trigger || 'No trigger selected'}
              </div>
              <div>
                <span className="font-medium">Then:</span>
                {actions.length > 0 ? (
                  <ul className="list-disc list-inside ml-4 mt-1">
                    {actions.map((action, index) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-muted-foreground ml-1">No actions selected</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          disabled={!automationName || !trigger || actions.length === 0}
        >
          Save Automation
        </Button>
      </div>
    </div>
  );
};

export default AutomationBuilder;
