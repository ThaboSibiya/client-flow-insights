

export type EmployeeRole = 'admin' | 'manager' | 'employee';
export type EmployeeStatus = 'active' | 'inactive' | 'suspended' | 'terminated';

export interface EmployeeFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  designation: string;
  title: string;
  department: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  hire_date: string;
  salary: string;
}

export interface EmployeeFormProps {
  employee?: any;
  onSave: () => void;
  onCancel: () => void;
  companyName?: string;
}
