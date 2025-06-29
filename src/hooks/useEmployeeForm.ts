
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

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.first_name.trim()) errors.push('First name is required');
    if (!formData.last_name.trim()) errors.push('Last name is required');
    if (!formData.email.trim()) errors.push('Email is required');
    if (!formData.designation.trim()) errors.push('Designation is required');
    if (!formData.title.trim()) errors.push('Title is required');
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }
    
    // Phone validation (if provided)
    if (formData.phone && formData.phone.length < 10) {
      errors.push('Phone number must be at least 10 digits');
    }
    
    return errors;
  };

  const checkEmailUniqueness = async (email: string, excludeId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      let query = supabase
        .from('employees')
        .select('id')
        .eq('company_owner_id', user.id)
        .eq('email', email.toLowerCase());

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error checking email uniqueness:', error);
        return false;
      }
      
      return data && data.length === 0;
    } catch (error) {
      console.error('Error checking email uniqueness:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        toast({
          title: "Validation Error",
          description: validationErrors.join(', '),
          variant: "destructive"
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to manage employees",
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

      // Prepare employee data - exclude employee_number for new employees as it's auto-generated
      const baseEmployeeData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone?.trim() || null,
        designation: formData.designation.trim(),
        title: formData.title.trim(),
        department: formData.department?.trim() || null,
        role: formData.role,
        status: formData.status,
        hire_date: formData.hire_date,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        company_owner_id: user.id,
        user_id: user.id
      };

      if (employee) {
        // Update existing employee - keep existing employee_number
        const { error } = await supabase
          .from('employees')
          .update(baseEmployeeData)
          .eq('id', employee.id)
          .eq('company_owner_id', user.id);

        if (error) {
          console.error('Database error:', error);
          throw new Error(error.message);
        }

        toast({
          title: "Success",
          description: "Employee updated successfully"
        });
      } else {
        // Create new employee - provide placeholder employee_number that will be overwritten by trigger
        const employeeDataWithNumber = {
          ...baseEmployeeData,
          employee_number: '' // Placeholder - will be overwritten by database trigger
        };

        const { error } = await supabase
          .from('employees')
          .insert([employeeDataWithNumber]);

        if (error) {
          console.error('Database error:', error);
          
          // Handle specific database errors
          if (error.code === '23505') { // Unique constraint violation
            toast({
              title: "Error",
              description: "An employee with this email already exists",
              variant: "destructive"
            });
            return;
          }
          
          throw new Error(error.message);
        }

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
