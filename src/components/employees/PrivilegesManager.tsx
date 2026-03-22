
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import EnhancedPrivilegesManager from './EnhancedPrivilegesManager';

interface PrivilegesManagerProps {
  employeeId?: string;
}

const PrivilegesManager: React.FC<PrivilegesManagerProps> = ({ employeeId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Shield className="h-5 w-5 text-primary" />
          Employee Privileges
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure what this employee can access and manage in the system
        </p>
      </CardHeader>
      <CardContent>
        <EnhancedPrivilegesManager employeeId={employeeId} />
      </CardContent>
    </Card>
  );
};

export default PrivilegesManager;
