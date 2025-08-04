import { supabase } from '@/integrations/supabase/client';
import { EmployeeFormData } from '@/components/employees/types';

export const checkEmailUniqueness = async (email: string, excludeId?: string): Promise<boolean> => {
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

export const createEmployee = async (formData: EmployeeFormData): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('You must be logged in to manage employees');
  }

  const employeeData = {
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
    user_id: user.id,
    employee_number: '' // Will be overwritten by database trigger
  };

  const { error } = await supabase
    .from('employees')
    .insert(employeeData);

  if (error) {
    console.error('Database error:', error);
    
    // Handle specific database errors
    if (error.code === '23505') { // Unique constraint violation
      throw new Error('An employee with this email already exists');
    }
    
    throw new Error(error.message);
  }
};

export const updateEmployee = async (employeeId: string, formData: EmployeeFormData): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('You must be logged in to manage employees');
  }

  const employeeData = {
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

  const { error } = await supabase
    .from('employees')
    .update(employeeData)
    .eq('id', employeeId)
    .eq('company_owner_id', user.id);

  if (error) {
    console.error('Database error:', error);
    throw new Error(error.message);
  }
};
