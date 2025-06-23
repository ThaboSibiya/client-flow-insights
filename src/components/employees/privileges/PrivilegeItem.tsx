
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { EnhancedEmployeePrivileges } from '@/types/enhancedSecurity';

interface PrivilegeItemProps {
  privilege: {
    key: string;
    label: string;
    description: string;
  };
  checked: boolean;
  onChange: (key: keyof EnhancedEmployeePrivileges, value: boolean) => void;
}

const PrivilegeItem: React.FC<PrivilegeItemProps> = ({ privilege, checked, onChange }) => {
  const isHighRisk = privilege.key.includes('sensitive') || 
                     privilege.key.includes('security') || 
                     privilege.key.includes('financial');

  return (
    <div className="flex items-center justify-between space-x-4 p-3 rounded-lg bg-quikle-crystal/20">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Label htmlFor={privilege.key} className="text-quikle-charcoal font-medium">
            {privilege.label}
          </Label>
          {isHighRisk && (
            <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
              <AlertTriangle className="h-3 w-3 mr-1" />
              High Risk
            </Badge>
          )}
        </div>
        <p className="text-sm text-quikle-slate mt-1">{privilege.description}</p>
      </div>
      <Switch
        id={privilege.key}
        checked={checked}
        onCheckedChange={(value) => onChange(privilege.key as keyof EnhancedEmployeePrivileges, value)}
      />
    </div>
  );
};

export default PrivilegeItem;
