
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { EmployeeFormData, EmployeeRole, EmployeeStatus } from '@/components/employees/types';

export const useEmployeeForm = (employee?: any, onSave?: () => void) => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    designation: '',
    title: '',
    department: '',
    role: 'employee' as EmployeeRole,
    status: 'active' as EmployeeStatus,
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
        role: (employee.role as EmployeeRole) || 'employee',
        status: (employee.status as EmployeeStatus) || 'active',
        hire_date: employee.hire_date ? employee.hire_date.split('T')[0] : new Date().toISOString().split('T')[0],
        salary: employee.salary || ''
      });
    }
  }, [employee]);

  const handleInputChange = (field: string, value: string) => {
    if (field === 'role') {
      setFormData(prev => ({ ...prev, [field]: value as EmployeeRole }));
    } else if (field === 'status') {
      setFormData(prev => ({ ...prev, [field]: value as EmployeeStatus }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
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
        // Create new employee - remove employee_number since it's auto-generated
        const { employee_number, ...insertData } = employeeData as any;
        const { error } = await supabase
          .from('employees')
          .insert(insertData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Employee created successfully"
        });
      }

      if (onSave) onSave();
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

  return {
    formData,
    loading,
    handleInputChange,
    handleSubmit
  };
};
