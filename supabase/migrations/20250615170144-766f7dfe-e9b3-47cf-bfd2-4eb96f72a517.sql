
-- This index will speed up fetching and sorting customers for each user.
CREATE INDEX IF NOT EXISTS idx_customers_user_id_created_at ON public.customers (user_id, created_at DESC);
