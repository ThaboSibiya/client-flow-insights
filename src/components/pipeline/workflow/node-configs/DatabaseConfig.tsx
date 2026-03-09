import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DatabaseConfigProps {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

const DatabaseConfig = ({ config, onChange }: DatabaseConfigProps) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>Operation</Label>
      <Select value={config.operation || 'read'} onValueChange={(v) => onChange('operation', v)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="read">Read</SelectItem>
          <SelectItem value="insert">Insert</SelectItem>
          <SelectItem value="update">Update</SelectItem>
          <SelectItem value="delete">Delete</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label>Table</Label>
      <Select value={config.table || 'customers'} onValueChange={(v) => onChange('table', v)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="customers">Customers</SelectItem>
          <SelectItem value="invoices">Invoices</SelectItem>
          <SelectItem value="email_history">Email History</SelectItem>
          <SelectItem value="customer_transactions">Transactions</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label>Filter (optional)</Label>
      <Input
        placeholder="e.g., status=active"
        value={config.filter || ''}
        onChange={(e) => onChange('filter', e.target.value)}
      />
    </div>
  </div>
);

export default DatabaseConfig;
