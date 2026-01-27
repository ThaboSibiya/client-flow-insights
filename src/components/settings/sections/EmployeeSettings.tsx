
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, UserPlus, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const EmployeeSettings = () => {
  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-quikle-primary" />
            Team Management
          </CardTitle>
          <CardDescription>
            Manage your team members and their access permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-quikle-crystal/30 rounded-lg text-center">
              <p className="text-2xl font-bold text-quikle-primary">12</p>
              <p className="text-sm text-quikle-slate/70">Total Members</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600">10</p>
              <p className="text-sm text-green-700/70">Active</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-amber-600">2</p>
              <p className="text-sm text-amber-700/70">Pending Invites</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button asChild>
              <Link to="/employees" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Manage Team
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/employees">
                View All Members
                <ExternalLink className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Role Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-quikle-primary" />
            Role Permissions
          </CardTitle>
          <CardDescription>
            Configure what each role can access in your workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Admin Role */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge className="bg-purple-100 text-purple-700">Admin</Badge>
                <div>
                  <p className="font-medium text-sm">Administrator</p>
                  <p className="text-xs text-quikle-slate/70">Full access to all features</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">Configure</Button>
            </div>

            {/* Manager Role */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-100 text-blue-700">Manager</Badge>
                <div>
                  <p className="font-medium text-sm">Manager</p>
                  <p className="text-xs text-quikle-slate/70">Team and project management</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">Configure</Button>
            </div>

            {/* Employee Role */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge className="bg-gray-100 text-gray-700">Employee</Badge>
                <div>
                  <p className="font-medium text-sm">Employee</p>
                  <p className="text-xs text-quikle-slate/70">Standard access level</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">Configure</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeSettings;
