
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CustomNode } from './types';
import ApprovalApproverConfig from './approval/ApprovalApproverConfig';
import ApprovalTimingConfig from './approval/ApprovalTimingConfig';
import ApprovalNotificationConfig from './approval/ApprovalNotificationConfig';
import ApprovalActionsConfig from './approval/ApprovalActionsConfig';

interface ApprovalWorkflowProps {
  node: CustomNode;
  onUpdate: (updates: Partial<CustomNode>) => void;
}

const ApprovalWorkflow = ({ node, onUpdate }: ApprovalWorkflowProps) => {
  const updateConfig = (key: string, value: any) => {
    onUpdate({
      data: { ...node.data, config: { ...node.data.config, [key]: value } }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Approval Step Name</Label>
        <Input
          value={node.data.name}
          onChange={(e) => onUpdate({ data: { ...node.data, name: e.target.value } })}
          placeholder="Approval Step"
        />
      </div>

      <ApprovalApproverConfig node={node} updateConfig={updateConfig} />
      <ApprovalTimingConfig node={node} updateConfig={updateConfig} />
      <ApprovalNotificationConfig node={node} updateConfig={updateConfig} />
      <ApprovalActionsConfig node={node} updateConfig={updateConfig} />
    </div>
  );
};

export default ApprovalWorkflow;
