
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeFormData } from './types';

interface EmployeeRoleInfoProps {
  formData: EmployeeFormData;
  onInputChange: (field: string, value: string) => void;
}

const EmployeeRoleInfo = ({ formData, onInputChange }: EmployeeRoleInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-quikle-charcoal">Position & Role</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-quikle-charcoal">Job Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => onInputChange('title', e.target.value)}
              placeholder="e.g., Senior Developer"
              className="border-quikle-silver"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="designation" className="text-quikle-charcoal">Designation *</Label>
            <Input
              id="designation"
              value={formData.designation}
              onChange={(e) => onInputChange('designation', e.target.value)}
              placeholder="e.g., Software Engineer"
              className="border-quikle-silver"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="department" className="text-quikle-charcoal">Department</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => onInputChange('department', e.target.value)}
              placeholder="e.g., IT, Sales, HR"
              className="border-quikle-silver"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role" className="text-quikle-charcoal">Role *</Label>
            <Select value={formData.role} onValueChange={(value) => onInputChange('role', value)}>
              <SelectTrigger className="border-quikle-silver">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="intern">Intern</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status" className="text-quikle-charcoal">Status</Label>
            <Select value={formData.status} onValueChange={(value) => onInputChange('status', value)}>
              <SelectTrigger className="border-quikle-silver">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hire_date" className="text-quikle-charcoal">Hire Date</Label>
            <Input
              id="hire_date"
              type="date"
              value={formData.hire_date}
              onChange={(e) => onInputChange('hire_date', e.target.value)}
              className="border-quikle-silver"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="salary" className="text-quikle-charcoal">Salary (R)</Label>
            <Input
              id="salary"
              type="number"
              value={formData.salary}
              onChange={(e) => onInputChange('salary', e.target.value)}
              placeholder="e.g., 50000"
              className="border-quikle-silver"
              step="0.01"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeRoleInfo;
