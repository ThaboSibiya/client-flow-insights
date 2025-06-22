
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomerStatus } from '@/types/customer';

interface StatusSelectorProps {
  value: CustomerStatus;
  onChange: (value: CustomerStatus) => void;
}

export const StatusSelector = ({ value, onChange }: StatusSelectorProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700">New Status</label>
      <Select value={value} onValueChange={(value: CustomerStatus) => onChange(value)}>
        <SelectTrigger className="border-2 border-gray-200 focus:border-green-500">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white border-2 border-gray-200 shadow-lg">
          <SelectItem value="existing" className="hover:bg-green-50">Existing</SelectItem>
          <SelectItem value="finalised" className="hover:bg-green-50">Finalised</SelectItem>
          <SelectItem value="pending" className="hover:bg-green-50">Pending</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
