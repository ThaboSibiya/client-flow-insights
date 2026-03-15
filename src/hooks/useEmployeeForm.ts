
import { useState, useEffect, useCallback } from 'react';
import { toast } from "@/hooks/use-toast";
import { EmployeeFormData, EmployeeRole, EmployeeStatus } from '@/components/employees/types';
import { validateEmployeeForm } from '@/utils/employeeValidation';
import { 
  checkEmailUniqueness, 
  createEmployeeWithInvitation, 
  updateEmployee,
  retryInvitation,
  EmployeeCreationResult
} from '@/services/employeeService';
import { useActiveWorkspaceId } from '@/hooks/useActiveWorkspaceId';

export const useEmployeeForm = (employee?: any, onSave?: () => void, companyName?: string) => {
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
  const [creationResult, setCreationResult] = useState<EmployeeCreationResult | null>(null);

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
        salary: employee.salary?.toString() || ''
      });
    }
  }, [employee]);

  const handleInputChange = useCallback((field: string, value: string) => {
    if (field === 'role') {
      setFormData(prev => ({ ...prev, [field]: value as EmployeeRole }));
    } else if (field === 'status') {
      setFormData(prev => ({ ...prev, [field]: value as EmployeeStatus }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  }, []);

  const retryEmployeeInvitation = useCallback(async () => {
    if (!creationResult?.employee || creationResult.invitationSent) return;

    setLoading(true);
    try {
      await retryInvitation(
        creationResult.employee.id,
        creationResult.employee.email,
        creationResult.employee.first_name,
        creationResult.employee.last_name,
        companyName || 'Your Company'
      );

      toast({
        title: "Success",
        description: "Invitation sent successfully"
      });

      setCreationResult(prev => prev ? {
        ...prev,
        invitationSent: true,
        error: undefined
      } : null);

    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to send invitation: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [creationResult, companyName]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
        // Update existing employee
        await updateEmployee(employee.id, formData);
        toast({
          title: "Success",
          description: "Employee updated successfully"
        });
        
        if (onSave) onSave();
      } else {
        // Create new employee with invitation
        const result = await createEmployeeWithInvitation(formData, companyName || 'Your Company');
        setCreationResult(result);

        if (result.invitationSent) {
          toast({
            title: "Success",
            description: `${formData.first_name} ${formData.last_name} has been created and invitation sent to ${formData.email}`
          });
          
          if (onSave) onSave();
        } else {
          toast({
            title: "Partial Success",
            description: result.error || "Employee created but invitation failed",
            variant: "destructive"
          });
          // Don't close form - allow retry
        }
      }
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
  }, [formData, employee, onSave, companyName]);

  return {
    formData,
    loading,
    creationResult,
    handleInputChange,
    handleSubmit,
    retryEmployeeInvitation
  };
};
