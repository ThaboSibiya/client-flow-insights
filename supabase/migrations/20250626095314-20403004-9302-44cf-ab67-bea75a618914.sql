
-- Add authentication fields to employees table
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_invited BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS invitation_token TEXT,
ADD COLUMN IF NOT EXISTS invitation_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS invitation_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- Create employee invitation table for tracking invitations
CREATE TABLE IF NOT EXISTS public.employee_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  invitation_token TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES public.employees(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  is_used BOOLEAN DEFAULT false
);

-- Enable RLS on employee_invitations
ALTER TABLE public.employee_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for employee_invitations
CREATE POLICY "Company owners can manage invitations"
  ON public.employee_invitations
  FOR ALL
  TO authenticated
  USING (
    created_by IN (
      SELECT id FROM public.employees WHERE company_owner_id = auth.uid()
    )
  );

-- Function to generate secure invitation token
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$ LANGUAGE plpgsql;

-- Function to create employee invitation
CREATE OR REPLACE FUNCTION create_employee_invitation(
  p_employee_id UUID,
  p_email TEXT,
  p_created_by UUID
)
RETURNS TEXT AS $$
DECLARE
  v_token TEXT;
BEGIN
  v_token := generate_invitation_token();
  
  INSERT INTO public.employee_invitations (
    employee_id, email, invitation_token, created_by
  ) VALUES (
    p_employee_id, p_email, v_token, p_created_by
  );
  
  -- Update employee record
  UPDATE public.employees 
  SET 
    is_invited = true,
    invitation_token = v_token,
    invitation_sent_at = now(),
    invitation_expires_at = now() + interval '7 days'
  WHERE id = p_employee_id;
  
  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate invitation token
CREATE OR REPLACE FUNCTION validate_invitation_token(p_token TEXT)
RETURNS TABLE(
  employee_id UUID,
  email TEXT,
  is_valid BOOLEAN,
  employee_data JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ei.employee_id,
    ei.email,
    (ei.expires_at > now() AND NOT ei.is_used) AS is_valid,
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
  WHERE ei.invitation_token = p_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete employee registration
CREATE OR REPLACE FUNCTION complete_employee_registration(
  p_token TEXT,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_employee_id UUID;
  v_is_valid BOOLEAN;
BEGIN
  -- Validate token and get employee ID
  SELECT employee_id, (expires_at > now() AND NOT is_used)
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
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_employees_auth_user_id ON public.employees(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_employee_invitations_token ON public.employee_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_employee_invitations_employee ON public.employee_invitations(employee_id);
