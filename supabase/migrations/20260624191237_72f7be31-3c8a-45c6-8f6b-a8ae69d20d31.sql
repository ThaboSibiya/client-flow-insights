
CREATE OR REPLACE FUNCTION public.create_workspace_trial_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.workspace_subscriptions (
    workspace_id, user_id, plan_name, status, trial_ends_at
  )
  VALUES (
    NEW.id, NEW.created_by, 'free', 'trialing', now() + interval '14 days'
  )
  ON CONFLICT (workspace_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_create_workspace_trial ON public.workspaces;
CREATE TRIGGER trg_create_workspace_trial
AFTER INSERT ON public.workspaces
FOR EACH ROW
EXECUTE FUNCTION public.create_workspace_trial_subscription();

-- Backfill workspaces missing a subscription row
INSERT INTO public.workspace_subscriptions (
  workspace_id, user_id, plan_name, status, trial_ends_at
)
SELECT
  w.id,
  w.created_by,
  'free',
  CASE WHEN (w.created_at + interval '14 days') > now() THEN 'trialing' ELSE 'past_due' END,
  w.created_at + interval '14 days'
FROM public.workspaces w
LEFT JOIN public.workspace_subscriptions ws ON ws.workspace_id = w.id
WHERE ws.id IS NULL;

-- Backfill free rows missing trial_ends_at
UPDATE public.workspace_subscriptions
SET trial_ends_at = created_at + interval '14 days',
    status = CASE WHEN (created_at + interval '14 days') > now() THEN 'trialing' ELSE 'past_due' END
WHERE plan_name = 'free' AND trial_ends_at IS NULL;
