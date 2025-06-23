
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedEmployeePrivileges } from '@/types/enhancedSecurity';
import PrivilegeItem from './PrivilegeItem';

interface PrivilegeGroupProps {
  group: {
    title: string;
    icon: React.ReactNode;
    color: string;
    privileges: Array<{
      key: string;
      label: string;
      description: string;
    }>;
  };
  privileges: EnhancedEmployeePrivileges;
  onPrivilegeChange: (privilege: keyof EnhancedEmployeePrivileges, value: boolean) => void;
}

const PrivilegeGroup: React.FC<PrivilegeGroupProps> = ({ 
  group, 
  privileges, 
  onPrivilegeChange 
}) => {
  return (
    <Card className="border">
      <CardHeader className="pb-3">
        <CardTitle className={`flex items-center gap-2 text-base ${group.color}`}>
          {group.icon}
          {group.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {group.privileges.map((privilege) => (
          <PrivilegeItem
            key={privilege.key}
            privilege={privilege}
            checked={privileges[privilege.key as keyof EnhancedEmployeePrivileges] as boolean}
            onChange={onPrivilegeChange}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default PrivilegeGroup;
