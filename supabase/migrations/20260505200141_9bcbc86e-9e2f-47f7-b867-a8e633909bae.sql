
CREATE OR REPLACE FUNCTION public.create_employee_invitation(p_employee_id uuid, p_email text, p_created_by uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_token TEXT;
  v_owner UUID;
BEGIN
  v_token := generate_invitation_token();

  INSERT INTO public.employee_invitations (
    employee_id, email, invitation_token, created_by
  ) VALUES (
    p_employee_id, p_email, v_token, p_created_by
  );

  -- Mark the employee as invited
  UPDATE public.employees
  SET is_invited = true
  WHERE id = p_employee_id
  RETURNING company_owner_id INTO v_owner;

  -- Persist invitation metadata in the owner-only side table
  INSERT INTO public.employee_sensitive (
    employee_id, company_owner_id, invitation_token, invitation_sent_at, invitation_expires_at
  ) VALUES (
    p_employee_id, COALESCE(v_owner, p_created_by), v_token, now(), now() + interval '7 days'
  )
  ON CONFLICT (employee_id) DO UPDATE
  SET invitation_token = EXCLUDED.invitation_token,
      invitation_sent_at = EXCLUDED.invitation_sent_at,
      invitation_expires_at = EXCLUDED.invitation_expires_at;

  RETURN v_token;
END;
$function$;
