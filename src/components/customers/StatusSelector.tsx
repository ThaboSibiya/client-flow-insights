
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomerStatus } from '@/context/CRMContext';

interface StatusSelectorProps {
  status: CustomerStatus;
  onChange: (status: CustomerStatus) => void;
}

const StatusSelector = ({ status, onChange }: StatusSelectorProps) => {
  return (
    <Select value={status} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="new">New</SelectItem>
        <SelectItem value="existing">Existing</SelectItem>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="finalised">Finalised</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default StatusSelector;
