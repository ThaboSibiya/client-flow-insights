
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { CustomNode } from '../types';

interface ApprovalTimingConfigProps {
  node: CustomNode;
  updateConfig: (key: string, value: any) => void;
}

const ApprovalTimingConfig = ({ node, updateConfig }: ApprovalTimingConfigProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Timing & Escalation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Approval Timeout (hours)</Label>
            <Input
              type="number"
              value={node.data.config.timeout_hours || 24}
              onChange={(e) => updateConfig('timeout_hours', parseInt(e.target.value) || 24)}
              min="1"
              max="168"
            />
          </div>
          <div>
            <Label>Reminder Frequency (hours)</Label>
            <Input
              type="number"
              value={node.data.config.reminder_frequency || 4}
              onChange={(e) => updateConfig('reminder_frequency', parseInt(e.target.value) || 4)}
              min="1"
              max="24"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label>Enable Escalation</Label>
          <Switch
            checked={node.data.config.enable_escalation || false}
            onCheckedChange={(checked) => updateConfig('enable_escalation', checked)}
          />
        </div>

        {node.data.config.enable_escalation && (
          <div>
            <Label>Escalation Recipients</Label>
            <Input
              value={node.data.config.escalation_recipients || ''}
              onChange={(e) => updateConfig('escalation_recipients', e.target.value)}
              placeholder="director@company.com, ceo@company.com..."
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApprovalTimingConfig;
