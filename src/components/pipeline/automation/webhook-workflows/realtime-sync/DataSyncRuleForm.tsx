
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NewDataSyncRule } from './types';

interface DataSyncRuleFormProps {
  isOpen: boolean;
  onClose: () => void;
  newRule: NewDataSyncRule;
  onRuleChange: (rule: NewDataSyncRule) => void;
  onCreate: () => void;
}

const DataSyncRuleForm: React.FC<DataSyncRuleFormProps> = ({
  isOpen,
  onClose,
  newRule,
  onRuleChange,
  onCreate
}) => {
  const systems = [
    'Quikle CRM', 'Quikle Tickets', 'Quikle Products',
    'Salesforce', 'HubSpot', 'Slack', 'Microsoft Teams',
    'Shopify', 'WooCommerce', 'Google Sheets', 'Airtable'
  ];

  const dataTypes = [
    'customers', 'tickets', 'products', 'orders', 'contacts',
    'leads', 'tasks', 'events', 'files', 'messages'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Data Sync Rule</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Rule Name</Label>
            <Input
              value={newRule.name}
              onChange={(e) => onRuleChange({ ...newRule, name: e.target.value })}
              placeholder="e.g., Customer Data Sync"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Source System</Label>
              <Select 
                value={newRule.sourceSystem} 
                onValueChange={(value) => onRuleChange({ ...newRule, sourceSystem: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source..." />
                </SelectTrigger>
                <SelectContent>
                  {systems.map(system => (
                    <SelectItem key={system} value={system}>{system}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target System</Label>
              <Select 
                value={newRule.targetSystem} 
                onValueChange={(value) => onRuleChange({ ...newRule, targetSystem: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target..." />
                </SelectTrigger>
                <SelectContent>
                  {systems.map(system => (
                    <SelectItem key={system} value={system}>{system}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Type</Label>
              <Select 
                value={newRule.dataType} 
                onValueChange={(value) => onRuleChange({ ...newRule, dataType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select data type..." />
                </SelectTrigger>
                <SelectContent>
                  {dataTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sync Direction</Label>
              <Select 
                value={newRule.syncDirection} 
                onValueChange={(value: 'bidirectional' | 'push' | 'pull') => 
                  onRuleChange({ ...newRule, syncDirection: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bidirectional">Bidirectional</SelectItem>
                  <SelectItem value="push">Push Only</SelectItem>
                  <SelectItem value="pull">Pull Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sync Frequency</Label>
            <Select 
              value={newRule.frequency} 
              onValueChange={(value) => onRuleChange({ ...newRule, frequency: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="real-time">Real-time</SelectItem>
                <SelectItem value="5min">Every 5 minutes</SelectItem>
                <SelectItem value="15min">Every 15 minutes</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onCreate}>
              Create Sync Rule
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DataSyncRuleForm;
