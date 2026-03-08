import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomerStatus } from '@/types/customer';

interface StatusSelectorProps {
  value: CustomerStatus;
  onChange: (value: CustomerStatus) => void;
}

export const StatusSelector = ({ value, onChange }: StatusSelectorProps) => {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">Customer Status</label>
      <Select value={value} onValueChange={(value: CustomerStatus) => onChange(value)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="existing">Existing</SelectItem>
          <SelectItem value="finalised">Finalised</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
