
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
      case 'new': return 'border-blue-200 text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 hover:border-blue-300';
      case 'existing': return 'border-green-200 text-green-700 bg-gradient-to-r from-green-50 to-green-100 hover:border-green-300';
      case 'pending': return 'border-quikle-silver text-quikle-slate bg-gradient-to-r from-quikle-crystal to-quikle-platinum hover:border-quikle-neutral';
      case 'finalised': return 'border-purple-200 text-purple-700 bg-gradient-to-r from-purple-50 to-purple-100 hover:border-purple-300';
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
      <SelectContent>
        <SelectItem value="new" className="text-blue-600">New</SelectItem>
        <SelectItem value="existing" className="text-green-600">Existing</SelectItem>
        <SelectItem value="pending" className="text-quikle-slate">Pending</SelectItem>
        <SelectItem value="finalised" className="text-purple-600">Finalised</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default StatusSelector;
