
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedEmployeePrivileges } from '@/types/enhancedSecurity';

interface ScopeConfigurationProps {
  privileges: EnhancedEmployeePrivileges;
  onPrivilegeChange: (privilege: keyof EnhancedEmployeePrivileges, value: string) => void;
}

const ScopeConfiguration: React.FC<ScopeConfigurationProps> = ({
  privileges,
  onPrivilegeChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg border border-border">
      <div>
        <Label className="text-sm font-medium text-foreground">Automation Scope</Label>
        <Select
          value={privileges.automation_scope}
          onValueChange={(value) => onPrivilegeChange('automation_scope', value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="own_customers">Own Customers Only</SelectItem>
            <SelectItem value="department">Department Customers</SelectItem>
            <SelectItem value="all_company">All Company Customers</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-sm font-medium text-foreground">Customer Access Scope</Label>
        <Select
          value={privileges.customer_access_scope}
          onValueChange={(value) => onPrivilegeChange('customer_access_scope', value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="assigned_only">Assigned Only</SelectItem>
            <SelectItem value="team">Team Customers</SelectItem>
            <SelectItem value="department">Department Customers</SelectItem>
            <SelectItem value="all_company">All Company Customers</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ScopeConfiguration;
