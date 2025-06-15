
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { CustomNode } from '../types';

interface ApprovalApproverConfigProps {
  node: CustomNode;
  updateConfig: (key: string, value: any) => void;
}

const ApprovalApproverConfig = ({ node, updateConfig }: ApprovalApproverConfigProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="h-4 w-4" />
          Approver Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label>Approval Type</Label>
          <Select
            value={node.data.config.approval_type || 'single'}
            onValueChange={(value) => updateConfig('approval_type', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single Approver</SelectItem>
              <SelectItem value="multiple_any">Any of Multiple Approvers</SelectItem>
              <SelectItem value="multiple_all">All Approvers Required</SelectItem>
              <SelectItem value="hierarchical">Hierarchical Approval</SelectItem>
              <SelectItem value="conditional">Conditional Approval</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Approvers (emails, comma-separated)</Label>
          <Textarea
            value={node.data.config.approvers || ''}
            onChange={(e) => updateConfig('approvers', e.target.value)}
            placeholder="manager@company.com, supervisor@company.com..."
            rows={2}
          />
        </div>

        {node.data.config.approval_type === 'conditional' && (
          <div>
            <Label>Approval Conditions</Label>
            <Textarea
              value={node.data.config.approval_conditions || ''}
              onChange={(e) => updateConfig('approval_conditions', e.target.value)}
              placeholder="Define when different approvers are required based on conditions..."
              rows={3}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApprovalApproverConfig;
