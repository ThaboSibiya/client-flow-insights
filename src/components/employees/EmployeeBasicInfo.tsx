
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeFormData } from './types';

interface EmployeeBasicInfoProps {
  formData: EmployeeFormData;
  onInputChange: (field: string, value: string) => void;
}

const EmployeeBasicInfo = ({ formData, onInputChange }: EmployeeBasicInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-quikle-charcoal">Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name" className="text-quikle-charcoal">First Name *</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => onInputChange('first_name', e.target.value)}
              placeholder="Enter first name"
              className="border-quikle-silver"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name" className="text-quikle-charcoal">Last Name *</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => onInputChange('last_name', e.target.value)}
              placeholder="Enter last name"
              className="border-quikle-silver"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-quikle-charcoal">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onInputChange('email', e.target.value)}
              placeholder="employee@company.com"
              className="border-quikle-silver"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-quikle-charcoal">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => onInputChange('phone', e.target.value)}
              placeholder="+27123456789"
              className="border-quikle-silver"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeBasicInfo;
