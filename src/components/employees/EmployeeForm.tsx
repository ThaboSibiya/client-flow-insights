
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import PrivilegesManager from './PrivilegesManager';

interface EmployeeFormProps {
  employee?: any;
  onSave: () => void;
  onCancel: () => void;
}

const EmployeeForm = ({ employee, onSave, onCancel }: EmployeeFormProps) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    designation: '',
    title: '',
    department: '',
    role: 'employee',
    status: 'active',
    hire_date: new Date().toISOString().split('T')[0],
    salary: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        designation: employee.designation || '',
        title: employee.title || '',
        department: employee.department || '',
        role: employee.role || 'employee',
        status: employee.status || 'active',
        hire_date: employee.hire_date ? employee.hire_date.split('T')[0] : new Date().toISOString().split('T')[0],
        salary: employee.salary || ''
      });
    }
  }, [employee]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to manage employees",
          variant: "destructive"
        });
        return;
      }

      const employeeData = {
        ...formData,
        company_owner_id: user.id,
        user_id: user.id, // For now, we'll use the same user ID. In a real app, this would be the employee's user ID
        salary: formData.salary ? parseFloat(formData.salary) : null
      };

      if (employee) {
        // Update existing employee
        const { error } = await supabase
          .from('employees')
          .update(employeeData)
          .eq('id', employee.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Employee updated successfully"
        });
      } else {
        // Create new employee
        const { error } = await supabase
          .from('employees')
          .insert([employeeData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Employee created successfully"
        });
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving employee:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save employee",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="role" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Role & Status
          </TabsTrigger>
          <TabsTrigger value="privileges" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privileges
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
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
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
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
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
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
                    onChange={(e) => handleInputChange('email', e.target.value)}
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
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+27123456789"
                    className="border-quikle-silver"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="role" className="space-y-4">
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
                    onChange={(e) => handleInputChange('title', e.target.value)}
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
                    onChange={(e) => handleInputChange('designation', e.target.value)}
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
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    placeholder="e.g., IT, Sales, HR"
                    className="border-quikle-silver"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-quikle-charcoal">Role *</Label>
                  <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
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
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
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
                    onChange={(e) => handleInputChange('hire_date', e.target.value)}
                    className="border-quikle-silver"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary" className="text-quikle-charcoal">Salary (R)</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => handleInputChange('salary', e.target.value)}
                    placeholder="e.g., 50000"
                    className="border-quikle-silver"
                    step="0.01"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privileges">
          <PrivilegesManager employeeId={employee?.id} />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 pt-6 border-t border-quikle-silver">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-quikle-silver text-quikle-charcoal hover:bg-quikle-crystal"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-quikle-primary hover:bg-quikle-secondary text-white"
        >
          {loading ? 'Saving...' : employee ? 'Update Employee' : 'Create Employee'}
        </Button>
      </div>
    </form>
  );
};

export default EmployeeForm;
