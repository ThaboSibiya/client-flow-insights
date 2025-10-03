-- =====================================================
-- CRITICAL SECURITY FIX: Employee Invitation Tokens
-- =====================================================
-- This migration secures the employee_invitations table to prevent
-- unauthorized access to invitation tokens and email addresses.

-- Step 1: Ensure RLS is enabled on employee_invitations
ALTER TABLE public.employee_invitations ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop any existing overly permissive policies
DROP POLICY IF EXISTS "Company owners can manage invitations" ON public.employee_invitations;
DROP POLICY IF EXISTS "Public read access" ON public.employee_invitations;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.employee_invitations;

-- Step 3: Create secure, restrictive policies

-- Policy 1: Company owners can view invitations they created
CREATE POLICY "Company owners can view their invitations"
ON public.employee_invitations
FOR SELECT
TO authenticated
USING (
  created_by IN (
    SELECT id FROM public.employees 
    WHERE company_owner_id = auth.uid()
  )
);

-- Policy 2: Company owners can create invitations for their employees
CREATE POLICY "Company owners can create invitations"
ON public.employee_invitations
FOR INSERT
TO authenticated
WITH CHECK (
  created_by IN (
    SELECT id FROM public.employees 
    WHERE company_owner_id = auth.uid()
  )
);

-- Policy 3: Company owners can update invitations they created
CREATE POLICY "Company owners can update their invitations"
ON public.employee_invitations
FOR UPDATE
TO authenticated
USING (
  created_by IN (
    SELECT id FROM public.employees 
    WHERE company_owner_id = auth.uid()
  )
)
WITH CHECK (
  created_by IN (
    SELECT id FROM public.employees 
    WHERE company_owner_id = auth.uid()
  )
);

-- Policy 4: Company owners can delete invitations they created
CREATE POLICY "Company owners can delete their invitations"
ON public.employee_invitations
FOR DELETE
TO authenticated
USING (
  created_by IN (
    SELECT id FROM public.employees 
    WHERE company_owner_id = auth.uid()
  )
);

-- Step 4: Update the validate_invitation_token function to use SECURITY DEFINER
-- This allows the function to bypass RLS while still being secure
DROP FUNCTION IF EXISTS public.validate_invitation_token(text);

CREATE OR REPLACE FUNCTION public.validate_invitation_token(p_token text)
RETURNS TABLE(
  employee_id uuid,
  email text,
  is_valid boolean,
  employee_data jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER  -- This allows the function to bypass RLS securely
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ei.employee_id,
    ei.email,
    (ei.expires_at > now() AND NOT COALESCE(ei.is_used, false)) AS is_valid,
    jsonb_build_object(
      'first_name', e.first_name,
      'last_name', e.last_name,
      'employee_number', e.employee_number,
      'designation', e.designation,
      'title', e.title,
      'department', e.department,
      'role', e.role
    ) AS employee_data
  FROM public.employee_invitations ei
  JOIN public.employees e ON ei.employee_id = e.id
  WHERE ei.invitation_token = p_token
  LIMIT 1;  -- Security: Only return one result
END;
$$;

-- Step 5: Create a secure function for completing employee registration
-- This ensures the invitation token validation and employee update happen securely
DROP FUNCTION IF EXISTS public.complete_employee_registration(text, uuid);

CREATE OR REPLACE FUNCTION public.complete_employee_registration(
  p_token text,
  p_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_employee_id UUID;
  v_is_valid BOOLEAN;
BEGIN
  -- Validate token and get employee ID
  SELECT employee_id, (expires_at > now() AND NOT COALESCE(is_used, false))
  INTO v_employee_id, v_is_valid
  FROM public.employee_invitations
  WHERE invitation_token = p_token;
  
  IF NOT v_is_valid OR v_employee_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Update employee with auth user ID
  UPDATE public.employees 
  SET 
    auth_user_id = p_user_id,
    last_login_at = now(),
    updated_at = now()
  WHERE id = v_employee_id;
  
  -- Mark invitation as used
  UPDATE public.employee_invitations 
  SET 
    is_used = true,
    accepted_at = now()
  WHERE invitation_token = p_token;
  
  -- Log the registration completion
  INSERT INTO public.security_audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    success,
    metadata
  ) VALUES (
    p_user_id,
    'employee_registration_completed',
    'employee',
    v_employee_id::text,
    true,
    jsonb_build_object(
      'employee_id', v_employee_id,
      'timestamp', now()
    )
  );
  
  RETURN true;
END;
$$;

-- Step 6: Add index for performance on token lookups
CREATE INDEX IF NOT EXISTS idx_employee_invitations_token 
ON public.employee_invitations(invitation_token) 
WHERE is_used = false;

-- Step 7: Add a comment documenting the security model
COMMENT ON TABLE public.employee_invitations IS 
'Employee invitation tokens. Access is restricted via RLS policies to company owners only. Public validation is done through the validate_invitation_token() security definer function.';

COMMENT ON FUNCTION public.validate_invitation_token(text) IS
'Security definer function to validate invitation tokens without exposing the employee_invitations table publicly. This is the only way to verify invitation tokens.';

COMMENT ON FUNCTION public.complete_employee_registration(text, uuid) IS
'Security definer function to complete employee registration with an invitation token. Validates the token and links the employee to their auth account securely.';