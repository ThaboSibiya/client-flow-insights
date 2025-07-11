
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const EmployeeManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-quikle-charcoal">Employee Management</h1>
        <p className="text-quikle-slate">Manage your team and employee settings</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Employee Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-quikle-slate">Employee management features coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeManagement;
