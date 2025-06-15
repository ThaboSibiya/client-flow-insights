
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, RefreshCw, AlertCircle } from "lucide-react";
import { CustomNode } from './types';

interface ErrorHandlingConfigProps {
  node: CustomNode;
  onUpdate: (updates: Partial<CustomNode>) => void;
}

const ErrorHandlingConfig = ({ node, onUpdate }: ErrorHandlingConfigProps) => {
  const updateConfig = (key: string, value: any) => {
    onUpdate({
      data: { ...node.data, config: { ...node.data.config, [key]: value } }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Error Handler Name</Label>
        <Input
          value={node.data.name}
          onChange={(e) => onUpdate({ data: { ...node.data, name: e.target.value } })}
          placeholder="Error Handler"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Enable Retry Logic</Label>
            <Switch
              checked={node.data.config.enable_retry || false}
              onCheckedChange={(checked) => updateConfig('enable_retry', checked)}
            />
          </div>

          {node.data.config.enable_retry && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Max Retry Attempts</Label>
                  <Input
                    type="number"
                    value={node.data.config.max_retries || 3}
                    onChange={(e) => updateConfig('max_retries', parseInt(e.target.value) || 3)}
                    min="1"
                    max="10"
                  />
                </div>
                <div>
                  <Label>Retry Delay (seconds)</Label>
                  <Input
                    type="number"
                    value={node.data.config.retry_delay || 5}
                    onChange={(e) => updateConfig('retry_delay', parseInt(e.target.value) || 5)}
                    min="1"
                    max="300"
                  />
                </div>
              </div>

              <div>
                <Label>Retry Strategy</Label>
                <Select 
                  value={node.data.config.retry_strategy || 'exponential'} 
                  onValueChange={(value) => updateConfig('retry_strategy', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Delay</SelectItem>
                    <SelectItem value="exponential">Exponential Backoff</SelectItem>
                    <SelectItem value="linear">Linear Increase</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Error Types & Handling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Handle These Error Types</Label>
            <Select 
              value={node.data.config.error_types || 'all'} 
              onValueChange={(value) => updateConfig('error_types', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Errors</SelectItem>
                <SelectItem value="network">Network Errors</SelectItem>
                <SelectItem value="validation">Validation Errors</SelectItem>
                <SelectItem value="timeout">Timeout Errors</SelectItem>
                <SelectItem value="custom">Custom Error Types</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {node.data.config.error_types === 'custom' && (
            <div>
              <Label>Custom Error Patterns (comma-separated)</Label>
              <Input
                value={node.data.config.custom_error_patterns || ''}
                onChange={(e) => updateConfig('custom_error_patterns', e.target.value)}
                placeholder="404, timeout, validation_failed..."
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Fallback Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Fallback Strategy</Label>
            <Select 
              value={node.data.config.fallback_strategy || 'notify'} 
              onValueChange={(value) => updateConfig('fallback_strategy', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="notify">Send Notification</SelectItem>
                <SelectItem value="alternative_action">Execute Alternative Action</SelectItem>
                <SelectItem value="skip">Skip and Continue</SelectItem>
                <SelectItem value="stop">Stop Workflow</SelectItem>
                <SelectItem value="manual_review">Queue for Manual Review</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {node.data.config.fallback_strategy === 'notify' && (
            <div>
              <Label>Notification Recipients</Label>
              <Input
                value={node.data.config.notification_recipients || ''}
                onChange={(e) => updateConfig('notification_recipients', e.target.value)}
                placeholder="admin@company.com, manager@company.com..."
              />
            </div>
          )}

          {node.data.config.fallback_strategy === 'alternative_action' && (
            <div>
              <Label>Alternative Action</Label>
              <Textarea
                value={node.data.config.alternative_action || ''}
                onChange={(e) => updateConfig('alternative_action', e.target.value)}
                placeholder="Describe the alternative action to take when the primary action fails..."
                rows={3}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label>Log Errors for Analysis</Label>
            <Switch
              checked={node.data.config.log_errors !== false}
              onCheckedChange={(checked) => updateConfig('log_errors', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorHandlingConfig;
