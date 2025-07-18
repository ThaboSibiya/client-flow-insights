
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VisualConditionBuilder from '../VisualConditionBuilder';

interface AutomationTriggerConfigProps {
  triggerType: 'simple' | 'advanced';
  automationType: 'customer' | 'ticket';
  simpleTrigger: string;
  setSimpleTrigger: (trigger: string) => void;
  conditionGroups: any[];
  setConditionGroups: (groups: any[]) => void;
}

const AutomationTriggerConfig = ({
  triggerType,
  automationType,
  simpleTrigger,
  setSimpleTrigger,
  conditionGroups,
  setConditionGroups
}: AutomationTriggerConfigProps) => {
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

  return (
    <>
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
    </>
  );
};

export default AutomationTriggerConfig;
