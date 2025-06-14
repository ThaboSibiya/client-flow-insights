
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Settings, Eye } from "lucide-react";
import VisualConditionBuilder from './VisualConditionBuilder';
import EnhancedActionsBuilder from './EnhancedActionsBuilder';
import AutomationPreview from './AutomationPreview';

interface AutomationBuilderProps {
  onClose: () => void;
}

const AutomationBuilder = ({ onClose }: AutomationBuilderProps) => {
  const [automationName, setAutomationName] = useState('');
  const [automationType, setAutomationType] = useState<'customer' | 'ticket'>('customer');
  const [triggerType, setTriggerType] = useState<'simple' | 'advanced'>('simple');
  const [simpleTrigger, setSimpleTrigger] = useState('');
  const [conditionGroups, setConditionGroups] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('details');

  const simpleTriggerOptions = {
    customer: [
      'Customer moves to stage',
      'Customer added to pipeline',
      'Customer inactive for X days',
      'Customer status changes',
      'Customer priority updated',
      'Customer assigned to team member'
    ],
    ticket: [
      'Ticket moves to stage',
      'Ticket priority changes',
      'Ticket assigned',
      'Ticket overdue',
      'Ticket status updated',
      'New comment added'
    ]
  };

  const handleSave = () => {
    const currentTrigger = triggerType === 'simple' ? simpleTrigger : { type: 'advanced', conditionGroups };
    
    if (automationName && (simpleTrigger || conditionGroups.length > 0) && actions.length > 0) {
      console.log('Saving enhanced automation:', {
        name: automationName,
        type: automationType,
        triggerType,
        trigger: currentTrigger,
        actions,
        conditionGroups: triggerType === 'advanced' ? conditionGroups : undefined
      });
      onClose();
    }
  };

  const isValid = automationName && 
    ((triggerType === 'simple' && simpleTrigger) || 
     (triggerType === 'advanced' && conditionGroups.length > 0)) && 
    actions.length > 0;

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details" className="flex items-center gap-1">
            <Zap className="h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="triggers" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            Triggers
          </TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-quikle-accent" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="automationName">Automation Name</Label>
                <Input
                  id="automationName"
                  value={automationName}
                  onChange={(e) => setAutomationName(e.target.value)}
                  placeholder="Enter a descriptive name..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Pipeline Type</Label>
                <Select value={automationType} onValueChange={(value: 'customer' | 'ticket') => setAutomationType(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer Pipeline</SelectItem>
                    <SelectItem value="ticket">Ticket Pipeline</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Trigger Complexity</Label>
                <Select value={triggerType} onValueChange={(value: 'simple' | 'advanced') => setTriggerType(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">
                      <div>
                        <div className="font-medium">Simple Trigger</div>
                        <div className="text-xs text-muted-foreground">Single condition, easy setup</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="advanced">
                      <div>
                        <div className="font-medium">Advanced Trigger</div>
                        <div className="text-xs text-muted-foreground">Multiple conditions, complex logic</div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="triggers" className="space-y-4">
          {triggerType === 'simple' ? (
            <Card>
              <CardHeader>
                <CardTitle>Simple Trigger Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label>When this happens...</Label>
                  <Select value={simpleTrigger} onValueChange={setSimpleTrigger}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select trigger condition..." />
                    </SelectTrigger>
                    <SelectContent>
                      {simpleTriggerOptions[automationType].map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Advanced Trigger Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <VisualConditionBuilder
                  onConditionsChange={setConditionGroups}
                  initialConditions={conditionGroups}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actions Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedActionsBuilder
                onActionsChange={setActions}
                initialActions={actions}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <AutomationPreview
            automationName={automationName}
            automationType={automationType}
            triggerType={triggerType}
            trigger={triggerType === 'simple' ? simpleTrigger : { type: 'advanced', conditionGroups }}
            actions={actions}
            conditionGroups={conditionGroups}
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          disabled={!isValid}
          className="bg-gradient-to-r from-quikle-primary to-quikle-secondary text-white"
        >
          Save Automation
        </Button>
      </div>
    </div>
  );
};

export default AutomationBuilder;
