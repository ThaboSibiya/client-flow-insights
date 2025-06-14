
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
      case 'new': return 'border-quikle-primary/30 text-quikle-primary bg-gradient-to-r from-quikle-crystal to-quikle-platinum hover:border-quikle-primary/50';
      case 'existing': return 'border-emerald-300 text-emerald-800 bg-gradient-to-r from-emerald-50 to-emerald-100 hover:border-emerald-400';
      case 'pending': return 'border-quikle-accent/30 text-quikle-accent bg-gradient-to-r from-quikle-crystal to-quikle-platinum hover:border-quikle-accent/50';
      case 'finalised': return 'border-purple-300 text-purple-800 bg-gradient-to-r from-purple-50 to-purple-100 hover:border-purple-400';
      default: return 'border-quikle-silver/30 text-quikle-slate bg-gradient-to-r from-quikle-crystal to-quikle-platinum';
    }
  };

  return (
    <Select
      value={status}
      onValueChange={(value) => onChange(value as CustomerStatus)}
    >
      <SelectTrigger className={`w-[140px] ${getStatusTriggerColor(status)} shadow-sm hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-quikle-primary/20 focus:border-quikle-primary/50 ${className}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-white border border-quikle-silver/30 shadow-luxury z-50 rounded-lg">
        <SelectItem value="new" className="text-quikle-primary hover:bg-quikle-crystal focus:bg-quikle-crystal cursor-pointer">New</SelectItem>
        <SelectItem value="existing" className="text-emerald-700 hover:bg-emerald-50 focus:bg-emerald-50 cursor-pointer">Existing</SelectItem>
        <SelectItem value="pending" className="text-quikle-accent hover:bg-quikle-crystal focus:bg-quikle-crystal cursor-pointer">Pending</SelectItem>
        <SelectItem value="finalised" className="text-purple-700 hover:bg-purple-50 focus:bg-purple-50 cursor-pointer">Finalised</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default StatusSelector;
