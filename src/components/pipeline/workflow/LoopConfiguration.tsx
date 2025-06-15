
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, ListIcon } from "lucide-react";
import { CustomNode } from './types';

interface LoopConfigurationProps {
  node: CustomNode;
  onUpdate: (updates: Partial<CustomNode>) => void;
}

const LoopConfiguration = ({ node, onUpdate }: LoopConfigurationProps) => {
  const updateConfig = (key: string, value: any) => {
    onUpdate({
      data: { ...node.data, config: { ...node.data.config, [key]: value } }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Loop Name</Label>
        <Input
          value={node.data.name}
          onChange={(e) => onUpdate({ data: { ...node.data, name: e.target.value } })}
          placeholder="For Each Loop"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Loop Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Loop Type</Label>
            <Select 
              value={node.data.config.loop_type || 'for_each'} 
              onValueChange={(value) => updateConfig('loop_type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="for_each">For Each Item</SelectItem>
                <SelectItem value="while">While Condition</SelectItem>
                <SelectItem value="repeat">Repeat N Times</SelectItem>
                <SelectItem value="until">Until Condition</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {node.data.config.loop_type === 'for_each' && (
            <div>
              <Label>Data Source</Label>
              <Select 
                value={node.data.config.data_source || ''} 
                onValueChange={(value) => updateConfig('data_source', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select data source..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer_list">Customer List</SelectItem>
                  <SelectItem value="ticket_list">Ticket List</SelectItem>
                  <SelectItem value="custom_list">Custom List</SelectItem>
                  <SelectItem value="csv_upload">CSV Upload</SelectItem>
                  <SelectItem value="api_response">API Response</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {node.data.config.loop_type === 'repeat' && (
            <div>
              <Label>Number of Iterations</Label>
              <Input
                type="number"
                value={node.data.config.iterations || 1}
                onChange={(e) => updateConfig('iterations', parseInt(e.target.value) || 1)}
                placeholder="Enter number of times to repeat..."
                min="1"
                max="1000"
              />
            </div>
          )}

          {(node.data.config.loop_type === 'while' || node.data.config.loop_type === 'until') && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Field</Label>
                <Input
                  value={node.data.config.condition_field || ''}
                  onChange={(e) => updateConfig('condition_field', e.target.value)}
                  placeholder="Field to check..."
                />
              </div>
              <div>
                <Label>Operator</Label>
                <Select 
                  value={node.data.config.condition_operator || ''} 
                  onValueChange={(value) => updateConfig('condition_operator', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="not_equals">Not Equals</SelectItem>
                    <SelectItem value="greater_than">Greater Than</SelectItem>
                    <SelectItem value="less_than">Less Than</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Value</Label>
                <Input
                  value={node.data.config.condition_value || ''}
                  onChange={(e) => updateConfig('condition_value', e.target.value)}
                  placeholder="Condition value..."
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <ListIcon className="h-4 w-4" />
            Loop Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label>Actions to perform for each iteration</Label>
            <Textarea
              value={node.data.config.loop_actions || ''}
              onChange={(e) => updateConfig('loop_actions', e.target.value)}
              placeholder="Describe the actions to perform in each loop iteration..."
              rows={4}
            />
          </div>
          <div className="mt-3">
            <Label>Batch Size (for performance)</Label>
            <Input
              type="number"
              value={node.data.config.batch_size || 10}
              onChange={(e) => updateConfig('batch_size', parseInt(e.target.value) || 10)}
              placeholder="Process items in batches of..."
              min="1"
              max="100"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoopConfiguration;
