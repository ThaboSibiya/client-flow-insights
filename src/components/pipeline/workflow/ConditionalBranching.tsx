
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitBranch, ArrowRight } from "lucide-react";
import { WorkflowNode } from './WorkflowEngine';

interface ConditionalBranchingProps {
  node: WorkflowNode;
  onUpdate: (updates: Partial<WorkflowNode>) => void;
}

const ConditionalBranching = ({ node, onUpdate }: ConditionalBranchingProps) => {
  const updateConfig = (key: string, value: any) => {
    onUpdate({
      config: { ...node.config, [key]: value }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Branch Name</Label>
        <Input
          value={node.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="If/Then Branch"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Condition Logic
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Field</Label>
              <Select 
                value={node.config.field || ''} 
                onValueChange={(value) => updateConfig('field', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer_status">Customer Status</SelectItem>
                  <SelectItem value="ticket_priority">Ticket Priority</SelectItem>
                  <SelectItem value="customer_value">Customer Value</SelectItem>
                  <SelectItem value="time_since_last_contact">Time Since Last Contact</SelectItem>
                  <SelectItem value="custom_field">Custom Field</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Operator</Label>
              <Select 
                value={node.config.operator || ''} 
                onValueChange={(value) => updateConfig('operator', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="not_equals">Not Equals</SelectItem>
                  <SelectItem value="greater_than">Greater Than</SelectItem>
                  <SelectItem value="less_than">Less Than</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="starts_with">Starts With</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Value</Label>
              <Input
                value={node.config.value || ''}
                onChange={(e) => updateConfig('value', e.target.value)}
                placeholder="Comparison value..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-green-600 flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              TRUE Path
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label>Action when condition is TRUE</Label>
              <Textarea
                value={node.config.true_path || ''}
                onChange={(e) => updateConfig('true_path', e.target.value)}
                placeholder="Describe what happens when condition is met..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-red-600 flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              FALSE Path
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label>Action when condition is FALSE</Label>
              <Textarea
                value={node.config.false_path || ''}
                onChange={(e) => updateConfig('false_path', e.target.value)}
                placeholder="Describe what happens when condition is not met..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConditionalBranching;
