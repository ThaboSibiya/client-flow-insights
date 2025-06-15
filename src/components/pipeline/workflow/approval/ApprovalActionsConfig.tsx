
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck } from "lucide-react";
import { CustomNode } from '../types';

interface ApprovalActionsConfigProps {
  node: CustomNode;
  updateConfig: (key: string, value: any) => void;
}

const ApprovalActionsConfig = ({ node, updateConfig }: ApprovalActionsConfigProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <UserCheck className="h-4 w-4" />
          Actions After Approval
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label>On Approval</Label>
          <Textarea
            value={node.data.config.on_approval || ''}
            onChange={(e) => updateConfig('on_approval', e.target.value)}
            placeholder="Define what happens when the request is approved..."
            rows={2}
          />
        </div>

        <div>
          <Label>On Rejection</Label>
          <Textarea
            value={node.data.config.on_rejection || ''}
            onChange={(e) => updateConfig('on_rejection', e.target.value)}
            placeholder="Define what happens when the request is rejected..."
            rows={2}
          />
        </div>

        <div>
          <Label>On Timeout</Label>
          <Select
            value={node.data.config.timeout_action || 'auto_reject'}
            onValueChange={(value) => updateConfig('timeout_action', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto_approve">Auto-approve</SelectItem>
              <SelectItem value="auto_reject">Auto-reject</SelectItem>
              <SelectItem value="escalate">Escalate to manager</SelectItem>
              <SelectItem value="pause">Pause workflow</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApprovalActionsConfig;
