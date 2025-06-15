
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { CustomNode } from '../types';

interface ApprovalNotificationConfigProps {
  node: CustomNode;
  updateConfig: (key: string, value: any) => void;
}

const ApprovalNotificationConfig = ({ node, updateConfig }: ApprovalNotificationConfigProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label>Approval Request Subject</Label>
          <Input
            value={node.data.config.request_subject || ''}
            onChange={(e) => updateConfig('request_subject', e.target.value)}
            placeholder="Approval Required: [Workflow Name]"
          />
        </div>

        <div>
          <Label>Approval Request Message</Label>
          <Textarea
            value={node.data.config.request_message || ''}
            onChange={(e) => updateConfig('request_message', e.target.value)}
            placeholder="Customize the approval request message..."
            rows={3}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>Include Workflow Context</Label>
          <Switch
            checked={node.data.config.include_context !== false}
            onCheckedChange={(checked) => updateConfig('include_context', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>Send Approval Confirmation</Label>
          <Switch
            checked={node.data.config.send_confirmation !== false}
            onCheckedChange={(checked) => updateConfig('send_confirmation', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ApprovalNotificationConfig;
