
import React from 'react';
import { CustomerStatus } from '@/context/CRMContext';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface StatusSelectorProps {
  status: CustomerStatus;
  onChange: (value: CustomerStatus) => void;
  className?: string;
}

const StatusSelector = ({ status, onChange, className }: StatusSelectorProps) => {
  
  const getStatusTriggerColor = (status: CustomerStatus) => {
    switch(status) {
      case 'new': return 'border-blue-300 text-blue-800 bg-gradient-to-r from-blue-50 to-blue-100 hover:border-blue-400';
      case 'existing': return 'border-emerald-300 text-emerald-800 bg-gradient-to-r from-emerald-50 to-emerald-100 hover:border-emerald-400';
      case 'pending': return 'border-slate-300 text-slate-800 bg-gradient-to-r from-slate-50 to-slate-100 hover:border-slate-400';
      case 'finalised': return 'border-purple-300 text-purple-800 bg-gradient-to-r from-purple-50 to-purple-100 hover:border-purple-400';
      default: return '';
    }
  };

  return (
    <Select
      value={status}
      onValueChange={(value) => onChange(value as CustomerStatus)}
    >
      <SelectTrigger className={`w-[140px] ${getStatusTriggerColor(status)} shadow-sm hover:shadow-md transition-all ${className}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-white border border-gray-200 shadow-lg">
        <SelectItem value="new" className="text-blue-700 hover:bg-blue-50">New</SelectItem>
        <SelectItem value="existing" className="text-emerald-700 hover:bg-emerald-50">Existing</SelectItem>
        <SelectItem value="pending" className="text-slate-700 hover:bg-slate-50">Pending</SelectItem>
        <SelectItem value="finalised" className="text-purple-700 hover:bg-purple-50">Finalised</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default StatusSelector;
