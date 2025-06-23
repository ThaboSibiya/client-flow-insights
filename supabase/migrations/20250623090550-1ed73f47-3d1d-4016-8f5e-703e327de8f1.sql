
-- Add new granular privileges to employee_privileges table
ALTER TABLE public.employee_privileges 
ADD COLUMN can_view_automations BOOLEAN DEFAULT false,
ADD COLUMN can_create_automations BOOLEAN DEFAULT false,
ADD COLUMN can_edit_automations BOOLEAN DEFAULT false,
ADD COLUMN can_delete_automations BOOLEAN DEFAULT false,
ADD COLUMN can_execute_automations BOOLEAN DEFAULT false,
ADD COLUMN can_manage_automation_permissions BOOLEAN DEFAULT false,
ADD COLUMN automation_scope TEXT DEFAULT 'own_customers', -- 'own_customers', 'department', 'all_company'
ADD COLUMN can_access_sensitive_automations BOOLEAN DEFAULT false,
ADD COLUMN can_view_company_settings BOOLEAN DEFAULT false,
ADD COLUMN can_edit_basic_settings BOOLEAN DEFAULT false,
ADD COLUMN can_edit_integration_settings BOOLEAN DEFAULT false,
ADD COLUMN can_edit_security_settings BOOLEAN DEFAULT false,
ADD COLUMN can_edit_billing_settings BOOLEAN DEFAULT false,
ADD COLUMN can_manage_employee_settings BOOLEAN DEFAULT false,
ADD COLUMN customer_access_scope TEXT DEFAULT 'assigned_only', -- 'assigned_only', 'team', 'department', 'all_company'
ADD COLUMN can_access_customer_pii BOOLEAN DEFAULT false,
ADD COLUMN can_export_customer_data BOOLEAN DEFAULT false,
ADD COLUMN can_access_financial_automations BOOLEAN DEFAULT false,
ADD COLUMN can_modify_pricing_automations BOOLEAN DEFAULT false,
ADD COLUMN requires_financial_approval BOOLEAN DEFAULT true;

-- Create automation permissions table for individual automation access control
CREATE TABLE public.automation_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id TEXT NOT NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  permission_level TEXT NOT NULL DEFAULT 'view', -- 'view', 'execute', 'edit', 'admin'
  granted_by UUID REFERENCES public.employees(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(automation_id, employee_id)
);

ALTER TABLE public.automation_permissions ENABLE ROW LEVEL SECURITY;

-- Create privilege change audit table
CREATE TABLE public.privilege_change_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  changed_by UUID REFERENCES public.employees(id) NOT NULL,
  privilege_name TEXT NOT NULL,
  old_value BOOLEAN,
  new_value BOOLEAN,
  reason TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.privilege_change_audit ENABLE ROW LEVEL SECURITY;

-- RLS policies for automation permissions
CREATE POLICY "Company owners can manage automation permissions"
  ON public.automation_permissions
  FOR ALL
  TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM public.employees WHERE company_owner_id = auth.uid()
    )
  );

CREATE POLICY "Employees can view their automation permissions"
  ON public.automation_permissions
  FOR SELECT
  TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
  );

-- RLS policies for privilege change audit
CREATE POLICY "Company owners can view privilege audit logs"
  ON public.privilege_change_audit
  FOR SELECT
  TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM public.employees WHERE company_owner_id = auth.uid()
    )
  );

-- Function to log privilege changes
CREATE OR REPLACE FUNCTION public.log_privilege_change(
  p_employee_id UUID,
  p_privilege_name TEXT,
  p_old_value BOOLEAN,
  p_new_value BOOLEAN,
  p_reason TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.privilege_change_audit (
    employee_id, changed_by, privilege_name, old_value, new_value, reason
  ) VALUES (
    p_employee_id, auth.uid(), p_privilege_name, p_old_value, p_new_value, p_reason
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for performance
CREATE INDEX idx_automation_permissions_employee ON public.automation_permissions(employee_id);
CREATE INDEX idx_automation_permissions_automation ON public.automation_permissions(automation_id);
CREATE INDEX idx_privilege_audit_employee ON public.privilege_change_audit(employee_id);
CREATE INDEX idx_privilege_audit_created_at ON public.privilege_change_audit(created_at);
