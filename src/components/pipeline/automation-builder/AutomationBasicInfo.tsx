
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap } from "lucide-react";

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
  );
};

export default AutomationBasicInfo;
