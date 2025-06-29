
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeFormData, EmployeeRole, EmployeeStatus } from './types';

interface EmployeeRoleInfoProps {
  formData: EmployeeFormData;
  onInputChange: (field: string, value: string) => void;
}

const EmployeeRoleInfo = ({ formData, onInputChange }: EmployeeRoleInfoProps) => {
  return (
    <Card className="bg-white/95 border border-quikle-silver/30 shadow-platinum hover:shadow-luxury transition-all duration-300">
      <CardHeader className="border-b border-quikle-silver/20">
        <CardTitle className="text-quikle-primary">Role & Employment Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="designation" className="text-quikle-charcoal font-medium">
              Designation <span className="text-red-500">*</span>
            </Label>
            <Input
              id="designation"
              value={formData.designation}
              onChange={(e) => onInputChange('designation', e.target.value)}
              placeholder="Software Developer, Manager, etc."
              className="border-quikle-silver/50 focus:border-quikle-primary"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title" className="text-quikle-charcoal font-medium">
              Job Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => onInputChange('title', e.target.value)}
              placeholder="Senior Developer, Team Lead, etc."
              className="border-quikle-silver/50 focus:border-quikle-primary"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="department" className="text-quikle-charcoal font-medium">Department</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => onInputChange('department', e.target.value)}
              placeholder="IT, Sales, Marketing, etc."
              className="border-quikle-silver/50 focus:border-quikle-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role" className="text-quikle-charcoal font-medium">System Role</Label>
            <Select value={formData.role} onValueChange={(value) => onInputChange('role', value)}>
              <SelectTrigger className="border-quikle-silver/50 focus:border-quikle-primary">
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status" className="text-quikle-charcoal font-medium">Status</Label>
            <Select value={formData.status} onValueChange={(value) => onInputChange('status', value)}>
              <SelectTrigger className="border-quikle-silver/50 focus:border-quikle-primary">
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
          <div className="space-y-2">
            <Label htmlFor="hire_date" className="text-quikle-charcoal font-medium">Hire Date</Label>
            <Input
              id="hire_date"
              type="date"
              value={formData.hire_date}
              onChange={(e) => onInputChange('hire_date', e.target.value)}
              className="border-quikle-silver/50 focus:border-quikle-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="salary" className="text-quikle-charcoal font-medium">Salary (Optional)</Label>
            <Input
              id="salary"
              type="number"
              value={formData.salary}
              onChange={(e) => onInputChange('salary', e.target.value)}
              placeholder="Annual salary"
              className="border-quikle-silver/50 focus:border-quikle-primary"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeRoleInfo;
