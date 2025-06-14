
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { UserCheck, Clock, Users, Mail } from "lucide-react";
import { WorkflowNode } from './WorkflowEngine';

interface ApprovalWorkflowProps {
  node: WorkflowNode;
  onUpdate: (updates: Partial<WorkflowNode>) => void;
}

const ApprovalWorkflow = ({ node, onUpdate }: ApprovalWorkflowProps) => {
  const updateConfig = (key: string, value: any) => {
    onUpdate({
      config: { ...node.config, [key]: value }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Approval Step Name</Label>
        <Input
          value={node.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Approval Step"
        />
      </div>

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
              value={node.config.approval_type || 'single'} 
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
              value={node.config.approvers || ''}
              onChange={(e) => updateConfig('approvers', e.target.value)}
              placeholder="manager@company.com, supervisor@company.com..."
              rows={2}
            />
          </div>

          {node.config.approval_type === 'conditional' && (
            <div>
              <Label>Approval Conditions</Label>
              <Textarea
                value={node.config.approval_conditions || ''}
                onChange={(e) => updateConfig('approval_conditions', e.target.value)}
                placeholder="Define when different approvers are required based on conditions..."
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>

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
                value={node.config.timeout_hours || 24}
                onChange={(e) => updateConfig('timeout_hours', parseInt(e.target.value) || 24)}
                min="1"
                max="168"
              />
            </div>
            <div>
              <Label>Reminder Frequency (hours)</Label>
              <Input
                type="number"
                value={node.config.reminder_frequency || 4}
                onChange={(e) => updateConfig('reminder_frequency', parseInt(e.target.value) || 4)}
                min="1"
                max="24"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label>Enable Escalation</Label>
            <Switch
              checked={node.config.enable_escalation || false}
              onCheckedChange={(checked) => updateConfig('enable_escalation', checked)}
            />
          </div>

          {node.config.enable_escalation && (
            <div>
              <Label>Escalation Recipients</Label>
              <Input
                value={node.config.escalation_recipients || ''}
                onChange={(e) => updateConfig('escalation_recipients', e.target.value)}
                placeholder="director@company.com, ceo@company.com..."
              />
            </div>
          )}
        </CardContent>
      </Card>

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
              value={node.config.request_subject || ''}
              onChange={(e) => updateConfig('request_subject', e.target.value)}
              placeholder="Approval Required: [Workflow Name]"
            />
          </div>

          <div>
            <Label>Approval Request Message</Label>
            <Textarea
              value={node.config.request_message || ''}
              onChange={(e) => updateConfig('request_message', e.target.value)}
              placeholder="Customize the approval request message..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Include Workflow Context</Label>
            <Switch
              checked={node.config.include_context !== false}
              onCheckedChange={(checked) => updateConfig('include_context', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Send Approval Confirmation</Label>
            <Switch
              checked={node.config.send_confirmation !== false}
              onCheckedChange={(checked) => updateConfig('send_confirmation', checked)}
            />
          </div>
        </CardContent>
      </Card>

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
              value={node.config.on_approval || ''}
              onChange={(e) => updateConfig('on_approval', e.target.value)}
              placeholder="Define what happens when the request is approved..."
              rows={2}
            />
          </div>

          <div>
            <Label>On Rejection</Label>
            <Textarea
              value={node.config.on_rejection || ''}
              onChange={(e) => updateConfig('on_rejection', e.target.value)}
              placeholder="Define what happens when the request is rejected..."
              rows={2}
            />
          </div>

          <div>
            <Label>On Timeout</Label>
            <Select 
              value={node.config.timeout_action || 'auto_reject'} 
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
    </div>
  );
};

export default ApprovalWorkflow;
