
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeFormData } from './types';

interface EmployeeBasicInfoProps {
  formData: EmployeeFormData;
  onInputChange: (field: string, value: string) => void;
}

const EmployeeBasicInfo: React.FC<EmployeeBasicInfoProps> = ({ formData, onInputChange }) => {
  return (
    <Card>
      <CardHeader className="border-b border-border">
        <CardTitle className="text-primary">Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name" className="text-foreground font-medium">
              First Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('first_name', e.target.value)}
              placeholder="Enter first name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name" className="text-foreground font-medium">
              Last Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('last_name', e.target.value)}
              placeholder="Enter last name"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('email', e.target.value)}
              placeholder="member@company.com"
              required
            />
            <p className="text-xs text-muted-foreground">
              This email will be used for team member invitations
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-foreground font-medium">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('phone', e.target.value)}
              placeholder="+27123456789"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="designation" className="text-foreground font-medium">
              Designation <span className="text-destructive">*</span>
            </Label>
            <Input
              id="designation"
              value={formData.designation}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('designation', e.target.value)}
              placeholder="e.g., Software Developer"
              required
            />
            <p className="text-xs text-muted-foreground">
              Job position or role designation
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground font-medium">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('title', e.target.value)}
              placeholder="e.g., Senior Developer"
              required
            />
            <p className="text-xs text-muted-foreground">
              Professional title or level
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="department" className="text-foreground font-medium">Department</Label>
          <Input
            id="department"
            value={formData.department}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('department', e.target.value)}
            placeholder="e.g., Engineering, Sales, HR"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeBasicInfo;
