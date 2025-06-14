
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
    <Card className="bg-white/95 border border-quikle-silver/30 shadow-platinum hover:shadow-luxury transition-all duration-300">
      <CardHeader className="border-b border-quikle-silver/20">
        <CardTitle className="text-quikle-primary">Position & Role</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-quikle-charcoal font-medium">Job Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => onInputChange('title', e.target.value)}
              placeholder="e.g., Senior Developer"
              className="border-quikle-silver/50 focus:border-quikle-primary"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="designation" className="text-quikle-charcoal font-medium">Designation *</Label>
            <Input
              id="designation"
              value={formData.designation}
              onChange={(e) => onInputChange('designation', e.target.value)}
              placeholder="e.g., Software Engineer"
              className="border-quikle-silver/50 focus:border-quikle-primary"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="department" className="text-quikle-charcoal font-medium">Department</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => onInputChange('department', e.target.value)}
              placeholder="e.g., IT, Sales, HR"
              className="border-quikle-silver/50 focus:border-quikle-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role" className="text-quikle-charcoal font-medium">Role *</Label>
            <Select value={formData.role} onValueChange={(value) => onInputChange('role', value)}>
              <SelectTrigger className="border-quikle-silver/50 focus:border-quikle-primary bg-white">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-quikle-silver/30 shadow-luxury">
                <SelectItem value="admin" className="hover:bg-quikle-crystal">Admin</SelectItem>
                <SelectItem value="manager" className="hover:bg-quikle-crystal">Manager</SelectItem>
                <SelectItem value="supervisor" className="hover:bg-quikle-crystal">Supervisor</SelectItem>
                <SelectItem value="employee" className="hover:bg-quikle-crystal">Employee</SelectItem>
                <SelectItem value="intern" className="hover:bg-quikle-crystal">Intern</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status" className="text-quikle-charcoal font-medium">Status</Label>
            <Select value={formData.status} onValueChange={(value) => onInputChange('status', value)}>
              <SelectTrigger className="border-quikle-silver/50 focus:border-quikle-primary bg-white">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-quikle-silver/30 shadow-luxury">
                <SelectItem value="active" className="hover:bg-quikle-crystal">Active</SelectItem>
                <SelectItem value="inactive" className="hover:bg-quikle-crystal">Inactive</SelectItem>
                <SelectItem value="suspended" className="hover:bg-quikle-crystal">Suspended</SelectItem>
                <SelectItem value="terminated" className="hover:bg-quikle-crystal">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Label htmlFor="salary" className="text-quikle-charcoal font-medium">Salary (R)</Label>
            <Input
              id="salary"
              type="number"
              value={formData.salary}
              onChange={(e) => onInputChange('salary', e.target.value)}
              placeholder="e.g., 50000"
              className="border-quikle-silver/50 focus:border-quikle-primary"
              step="0.01"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeRoleInfo;
