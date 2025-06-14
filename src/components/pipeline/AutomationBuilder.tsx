
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
        <Card className="border-quikle-silver/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-quikle-charcoal">
              <Zap className="h-5 w-5 text-quikle-accent" />
              Automation Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="automationName" className="text-quikle-charcoal">Automation Name</Label>
              <Input
                id="automationName"
                value={automationName}
                onChange={(e) => setAutomationName(e.target.value)}
                placeholder="Enter automation name..."
                className="border-quikle-silver/50 text-quikle-charcoal"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-quikle-charcoal">Type</Label>
              <Select value={automationType} onValueChange={(value: 'customer' | 'ticket') => setAutomationType(value)}>
                <SelectTrigger className="border-quikle-silver/50 text-quikle-charcoal">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-quikle-silver/30 z-50">
                  <SelectItem value="customer" className="text-quikle-charcoal hover:bg-quikle-crystal">Customer Pipeline</SelectItem>
                  <SelectItem value="ticket" className="text-quikle-charcoal hover:bg-quikle-crystal">Ticket Pipeline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-quikle-charcoal">Trigger</Label>
              <Select value={trigger} onValueChange={setTrigger}>
                <SelectTrigger className="border-quikle-silver/50 text-quikle-charcoal">
                  <SelectValue placeholder="Select trigger..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-quikle-silver/30 z-50">
                  {triggerOptions[automationType].map((option) => (
                    <SelectItem key={option} value={option} className="text-quikle-charcoal hover:bg-quikle-crystal">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-quikle-silver/30">
          <CardHeader>
            <CardTitle className="text-quikle-charcoal">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-quikle-charcoal">Add Action</Label>
              <Select onValueChange={addAction}>
                <SelectTrigger className="border-quikle-silver/50 text-quikle-charcoal">
                  <SelectValue placeholder="Select action to add..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-quikle-silver/30 z-50">
                  {actionOptions.map((option) => (
                    <SelectItem key={option} value={option} className="text-quikle-charcoal hover:bg-quikle-crystal">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-quikle-charcoal">Selected Actions ({actions.length})</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {actions.map((action, index) => (
                  <div key={index} className="flex items-center justify-between bg-quikle-crystal p-2 rounded border border-quikle-silver/30">
                    <span className="text-sm text-quikle-charcoal">{action}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAction(action)}
                      className="text-quikle-slate hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              {actions.length === 0 && (
                <p className="text-sm text-quikle-slate">No actions selected</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-quikle-silver/30">
        <CardHeader>
          <CardTitle className="text-quikle-charcoal">Automation Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-quikle-crystal p-4 rounded-lg border border-quikle-silver/30">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="border-quikle-primary/30 text-quikle-primary">{automationType}</Badge>
              <span className="font-medium text-quikle-charcoal">{automationName || 'Untitled Automation'}</span>
            </div>
            
            <div className="text-sm space-y-2">
              <div>
                <span className="font-medium text-quikle-charcoal">When:</span> 
                <span className="text-quikle-slate ml-1">{trigger || 'No trigger selected'}</span>
              </div>
              <div>
                <span className="font-medium text-quikle-charcoal">Then:</span>
                {actions.length > 0 ? (
                  <ul className="list-disc list-inside ml-4 mt-1">
                    {actions.map((action, index) => (
                      <li key={index} className="text-quikle-slate">{action}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-quikle-slate ml-1">No actions selected</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} className="border-quikle-silver/50 text-quikle-charcoal hover:bg-quikle-crystal">
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          disabled={!automationName || !trigger || actions.length === 0}
          className="bg-gradient-to-r from-quikle-primary to-quikle-secondary text-white"
        >
          Save Automation
        </Button>
      </div>
    </div>
  );
};

export default AutomationBuilder;
