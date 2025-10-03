-- ============================================
-- SECURITY FIX: Implement Proper RBAC System
-- ============================================

-- Step 1: Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'employee');

-- Step 2: Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ,
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Step 4: Create RLS policies for user_roles
CREATE POLICY "Company owners can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  granted_by = auth.uid() OR
  EXISTS (SELECT 1 FROM public.employees WHERE company_owner_id = auth.uid() AND auth_user_id = user_roles.user_id)
)
WITH CHECK (
  granted_by = auth.uid() OR
  EXISTS (SELECT 1 FROM public.employees WHERE company_owner_id = auth.uid())
);

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Step 5: Create role change audit table
CREATE TABLE public.role_change_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    old_role app_role,
    new_role app_role NOT NULL,
    changed_by UUID NOT NULL REFERENCES auth.users(id),
    reason TEXT,
    changed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.role_change_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company owners can view role changes"
ON public.role_change_audit
FOR SELECT
TO authenticated
USING (
  changed_by = auth.uid() OR
  EXISTS (SELECT 1 FROM public.employees WHERE company_owner_id = auth.uid() AND auth_user_id = role_change_audit.user_id)
);

-- Step 6: Migrate existing employee roles to user_roles
INSERT INTO public.user_roles (user_id, role, granted_by)
SELECT 
  e.auth_user_id, 
  e.role::text::app_role,
  e.company_owner_id
FROM public.employees e
WHERE e.auth_user_id IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================
-- SECURITY FIX: Fix Audit Log Tampering
-- ============================================

-- Drop the insecure policy
DROP POLICY IF EXISTS "Allow insert for security audit logs" ON public.security_audit_logs;

-- Create restricted policy - only authenticated users can log their own events
CREATE POLICY "Users can create their own audit logs"
ON public.security_audit_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Create secure logging function
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_error_message TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.security_audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    success,
    metadata,
    error_message,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_success,
    p_metadata,
    p_error_message,
    p_ip_address,
    p_user_agent
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.log_security_event TO authenticated;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_role_change_audit_user_id ON public.role_change_audit(user_id);