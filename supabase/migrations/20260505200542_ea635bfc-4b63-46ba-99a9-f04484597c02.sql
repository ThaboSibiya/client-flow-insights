
DROP POLICY IF EXISTS "Users can manage their own rate limits" ON public.rate_limiting;

CREATE POLICY "Users can view their own rate limits"
ON public.rate_limiting
FOR SELECT
TO authenticated
USING (user_id IS NOT NULL AND user_id = auth.uid());
