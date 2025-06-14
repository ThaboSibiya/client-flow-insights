
-- Create enum types for employee roles and privileges
CREATE TYPE public.employee_role AS ENUM ('admin', 'manager', 'supervisor', 'employee', 'intern');
CREATE TYPE public.employee_status AS ENUM ('active', 'inactive', 'suspended', 'terminated');

-- Create employees table
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  employee_number TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  designation TEXT NOT NULL,
  title TEXT NOT NULL,
  department TEXT,
  role employee_role NOT NULL DEFAULT 'employee',
  status employee_status NOT NULL DEFAULT 'active',
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  salary DECIMAL(12,2),
  manager_id UUID REFERENCES public.employees(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employee privileges table
CREATE TABLE public.employee_privileges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  privilege_name TEXT NOT NULL,
  privilege_description TEXT,
  can_view_customers BOOLEAN DEFAULT false,
  can_edit_customers BOOLEAN DEFAULT false,
  can_delete_customers BOOLEAN DEFAULT false,
  can_view_quotes BOOLEAN DEFAULT false,
  can_create_quotes BOOLEAN DEFAULT false,
  can_edit_quotes BOOLEAN DEFAULT false,
  can_delete_quotes BOOLEAN DEFAULT false,
  can_view_analytics BOOLEAN DEFAULT false,
  can_manage_employees BOOLEAN DEFAULT false,
  can_manage_company_settings BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employee attendance table (optional for future use)
CREATE TABLE public.employee_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  hours_worked DECIMAL(4,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_privileges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_attendance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employees table
CREATE POLICY "Company owners can manage all employees" 
  ON public.employees 
  FOR ALL 
  USING (auth.uid() = company_owner_id);

CREATE POLICY "Employees can view their own record" 
  ON public.employees 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Managers can view their team members" 
  ON public.employees 
  FOR SELECT 
  USING (manager_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));

-- RLS Policies for employee privileges table
CREATE POLICY "Company owners can manage all privileges" 
  ON public.employee_privileges 
  FOR ALL 
  USING (employee_id IN (SELECT id FROM public.employees WHERE company_owner_id = auth.uid()));

CREATE POLICY "Employees can view their own privileges" 
  ON public.employee_privileges 
  FOR SELECT 
  USING (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));

-- RLS Policies for attendance table
CREATE POLICY "Company owners can view all attendance" 
  ON public.employee_attendance 
  FOR ALL 
  USING (employee_id IN (SELECT id FROM public.employees WHERE company_owner_id = auth.uid()));

CREATE POLICY "Employees can manage their own attendance" 
  ON public.employee_attendance 
  FOR ALL 
  USING (employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_employees_company_owner ON public.employees(company_owner_id);
CREATE INDEX idx_employees_user_id ON public.employees(user_id);
CREATE INDEX idx_employees_manager ON public.employees(manager_id);
CREATE INDEX idx_employee_privileges_employee ON public.employee_privileges(employee_id);
CREATE INDEX idx_attendance_employee ON public.employee_attendance(employee_id);
CREATE INDEX idx_attendance_date ON public.employee_attendance(date);

-- Function to generate employee numbers
CREATE OR REPLACE FUNCTION generate_employee_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    employee_number TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(employee_number FROM 4) AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.employees
    WHERE employee_number LIKE 'EMP%';
    
    employee_number := 'EMP' || LPAD(next_number::TEXT, 4, '0');
    RETURN employee_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate employee numbers
CREATE OR REPLACE FUNCTION set_employee_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.employee_number IS NULL OR NEW.employee_number = '' THEN
        NEW.employee_number := generate_employee_number();
    END IF;
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_employee_number
    BEFORE INSERT OR UPDATE ON public.employees
    FOR EACH ROW EXECUTE FUNCTION set_employee_number();
