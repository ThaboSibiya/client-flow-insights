-- Create vault helper functions for secure secret management
-- These wrap the pgsodium vault functions for easier use

-- Function to insert a secret into the vault
CREATE OR REPLACE FUNCTION public.vault_insert_secret(
  new_secret text,
  new_name text,
  new_description text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  secret_id uuid;
BEGIN
  INSERT INTO vault.secrets (secret, name, description)
  VALUES (new_secret, new_name, new_description)
  RETURNING id INTO secret_id;
  
  RETURN secret_id;
END;
$$;

-- Function to read a secret from the vault by name
CREATE OR REPLACE FUNCTION public.vault_read_secret(secret_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  secret_value text;
BEGIN
  SELECT decrypted_secret INTO secret_value
  FROM vault.decrypted_secrets
  WHERE name = secret_name
  LIMIT 1;
  
  RETURN secret_value;
END;
$$;

-- Function to delete a secret from the vault by name
CREATE OR REPLACE FUNCTION public.vault_delete_secret(secret_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM vault.secrets WHERE name = secret_name;
  RETURN FOUND;
END;
$$;

-- Function to update a secret in the vault
CREATE OR REPLACE FUNCTION public.vault_update_secret(
  secret_name text,
  new_secret text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE vault.secrets
  SET secret = new_secret, updated_at = now()
  WHERE name = secret_name;
  
  RETURN FOUND;
END;
$$;

-- Grant execute to authenticated users (actual access control is in edge function)
GRANT EXECUTE ON FUNCTION public.vault_insert_secret TO service_role;
GRANT EXECUTE ON FUNCTION public.vault_read_secret TO service_role;
GRANT EXECUTE ON FUNCTION public.vault_delete_secret TO service_role;
GRANT EXECUTE ON FUNCTION public.vault_update_secret TO service_role;

-- Add comment explaining security model
COMMENT ON FUNCTION public.vault_insert_secret IS 'Securely stores a secret in Supabase Vault. Only accessible via service_role through edge functions.';
COMMENT ON FUNCTION public.vault_read_secret IS 'Retrieves a decrypted secret from Supabase Vault. Only accessible via service_role through edge functions.';
COMMENT ON FUNCTION public.vault_delete_secret IS 'Deletes a secret from Supabase Vault. Only accessible via service_role through edge functions.';
COMMENT ON FUNCTION public.vault_update_secret IS 'Updates an existing secret in Supabase Vault. Only accessible via service_role through edge functions.';