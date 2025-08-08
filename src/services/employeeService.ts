
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

export const createEmployee = async (formData: EmployeeFormData): Promise<any> => {
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

  const { data, error } = await supabase
    .from('employees')
    .insert(employeeData)
    .select()
    .single();

  if (error) {
    console.error('Database error:', error);
    
    // Handle specific database errors
    if (error.code === '23505') { // Unique constraint violation
      throw new Error('An employee with this email already exists');
    }
    
    throw new Error(error.message);
  }

  return data;
};

export const sendEmployeeInvitation = async (
  employeeId: string, 
  email: string, 
  firstName: string, 
  lastName: string, 
  companyName: string
): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-employee-invitation', {
      body: {
        employeeId,
        email,
        firstName,
        lastName,
        companyName
      }
    });

    if (error) throw error;

    return data?.invitationToken || '';
  } catch (error: any) {
    console.error('Error sending invitation:', error);
    throw new Error(error.message || 'Failed to send invitation');
  }
};

export interface EmployeeCreationResult {
  employee: any;
  invitationSent: boolean;
  invitationToken?: string;
  error?: string;
}

export const createEmployeeWithInvitation = async (
  formData: EmployeeFormData, 
  companyName: string
): Promise<EmployeeCreationResult> => {
  try {
    // Step 1: Create employee record
    const employee = await createEmployee(formData);
    
    try {
      // Step 2: Send invitation immediately
      const invitationToken = await sendEmployeeInvitation(
        employee.id,
        employee.email,
        employee.first_name,
        employee.last_name,
        companyName
      );

      return {
        employee,
        invitationSent: true,
        invitationToken
      };
    } catch (invitationError: any) {
      // Employee was created but invitation failed
      console.error('Invitation failed after employee creation:', invitationError);
      
      return {
        employee,
        invitationSent: false,
        error: `Employee created successfully, but invitation failed: ${invitationError.message}`
      };
    }
  } catch (employeeError: any) {
    // Employee creation failed
    throw employeeError;
  }
};

export const retryInvitation = async (
  employeeId: string,
  email: string,
  firstName: string,
  lastName: string,
  companyName: string
): Promise<void> => {
  await sendEmployeeInvitation(employeeId, email, firstName, lastName, companyName);
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
