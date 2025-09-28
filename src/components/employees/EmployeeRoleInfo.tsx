
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmployeeFormData } from './types';

interface EmployeeRoleInfoProps {
  formData: EmployeeFormData;
  onInputChange: (field: string, value: string) => void;
}

const EmployeeRoleInfo: React.FC<EmployeeRoleInfoProps> = ({ formData, onInputChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="role" className="text-quikle-charcoal font-medium">
          Role *
        </Label>
        <Select value={formData.role} onValueChange={(value) => onInputChange('role', value)}>
          <SelectTrigger className="border-quikle-silver/50 focus:border-quikle-primary focus:ring-quikle-primary/20">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="employee">Employee</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status" className="text-quikle-charcoal font-medium">
          Status *
        </Label>
        <Select value={formData.status} onValueChange={(value) => onInputChange('status', value)}>
          <SelectTrigger className="border-quikle-silver/50 focus:border-quikle-primary focus:ring-quikle-primary/20">
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

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="hire_date" className="text-quikle-charcoal font-medium">
          Hire Date *
        </Label>
        <Input
          id="hire_date"
          type="date"
          value={formData.hire_date}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('hire_date', e.target.value)}
          className="border-quikle-silver/50 focus:border-quikle-primary focus:ring-quikle-primary/20"
          required
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="salary" className="text-quikle-charcoal font-medium">
          Salary
        </Label>
        <Input
          id="salary"
          type="number"
          step="0.01"
          min="0"
          placeholder="Enter salary amount"
          value={formData.salary}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('salary', e.target.value)}
          className="border-quikle-silver/50 focus:border-quikle-primary focus:ring-quikle-primary/20"
        />
      </div>
    </div>
  );
};

export default EmployeeRoleInfo;
