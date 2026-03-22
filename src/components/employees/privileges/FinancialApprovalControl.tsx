
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { EnhancedEmployeePrivileges } from '@/types/enhancedSecurity';

interface FinancialApprovalControlProps {
  checked: boolean;
  onChange: (privilege: keyof EnhancedEmployeePrivileges, value: boolean) => void;
}

const FinancialApprovalControl: React.FC<FinancialApprovalControlProps> = ({
  checked,
  onChange
}) => {
  return (
    <Card className="border-orange-500/30 bg-orange-500/10">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-orange-700 dark:text-orange-400 font-medium">Requires Financial Approval</Label>
            <p className="text-sm text-orange-600 dark:text-orange-400/80">Financial operations require manager approval</p>
          </div>
          <Switch
            checked={checked}
            onCheckedChange={(value) => onChange('requires_financial_approval', value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialApprovalControl;
