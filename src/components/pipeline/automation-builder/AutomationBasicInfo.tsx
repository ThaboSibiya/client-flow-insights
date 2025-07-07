
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AutomationBasicInfoProps {
  automationName: string;
  setAutomationName: (name: string) => void;
  automationType: 'customer' | 'ticket';
  setAutomationType: (type: 'customer' | 'ticket') => void;
  triggerType: 'simple' | 'advanced';
  setTriggerType: (type: 'simple' | 'advanced') => void;
}

const AutomationBasicInfo = ({
  automationName,
  setAutomationName,
  automationType,
  setAutomationType,
  triggerType,
  setTriggerType
}: AutomationBasicInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="automation-name">Automation Name</Label>
          <Input
            id="automation-name"
            value={automationName}
            onChange={(e) => setAutomationName(e.target.value)}
            placeholder="Enter automation name..."
          />
        </div>

        <div>
          <Label>Automation Type</Label>
          <Select value={automationType} onValueChange={setAutomationType}>
            <SelectTrigger>
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
          <RadioGroup value={triggerType} onValueChange={setTriggerType} className="mt-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="simple" id="simple" />
              <Label htmlFor="simple">Simple Trigger</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="advanced" id="advanced" />
              <Label htmlFor="advanced">Advanced Conditions</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutomationBasicInfo;
