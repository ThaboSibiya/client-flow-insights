
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { EmployeeFormData, EmployeeRole, EmployeeStatus } from '@/components/employees/types';
import { validateEmployeeForm } from '@/utils/employeeValidation';
import { checkEmailUniqueness, createEmployee, updateEmployee } from '@/services/employeeService';

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
    salary: '',
    photo_url: ''
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
        salary: employee.salary || '',
        photo_url: employee.photo_url || ''
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
      // Validate form
      const validationErrors = validateEmployeeForm(formData);
      if (validationErrors.length > 0) {
        toast({
          title: "Validation Error",
          description: validationErrors.join(', '),
          variant: "destructive"
        });
        return;
      }

      // Check email uniqueness
      const isEmailUnique = await checkEmailUniqueness(
        formData.email.toLowerCase(), 
        employee?.id
      );
      
      if (!isEmailUnique) {
        toast({
          title: "Error",
          description: "An employee with this email already exists",
          variant: "destructive"
        });
        return;
      }

      if (employee) {
        await updateEmployee(employee.id, formData);
        toast({
          title: "Success",
          description: "Employee updated successfully"
        });
      } else {
        await createEmployee(formData);
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
        description: error.message || "Failed to save employee. Please try again.",
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
