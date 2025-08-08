
import { EmployeeFormData } from '@/components/employees/types';

export const validateEmployeeForm = (formData: EmployeeFormData): string[] => {
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
  if (formData.phone && formData.phone.trim() && formData.phone.trim().length < 10) {
    errors.push('Phone number must be at least 10 digits');
  }

  // Salary validation (if provided)
  if (formData.salary && formData.salary.trim()) {
    const salary = parseFloat(formData.salary);
    if (isNaN(salary) || salary < 0) {
      errors.push('Please enter a valid salary amount');
    }
  }
  
  return errors;
};
