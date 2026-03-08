CREATE OR REPLACE FUNCTION public.increment_trigger_count(trigger_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE api_triggers
  SET 
    trigger_count = COALESCE(trigger_count, 0) + 1,
    last_triggered_at = now()
  WHERE id = trigger_id;
END;
$$;