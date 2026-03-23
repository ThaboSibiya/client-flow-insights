-- Add ownership-based RLS policies for tables that only have finance-admin policies

-- customer_transactions: add owner-based CRUD
CREATE POLICY "Users can view own transactions"
  ON public.customer_transactions FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.customer_transactions FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own transactions"
  ON public.customer_transactions FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own transactions"
  ON public.customer_transactions FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- finance_notes: add owner-based CRUD
CREATE POLICY "Users can view own finance notes"
  ON public.finance_notes FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own finance notes"
  ON public.finance_notes FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own finance notes"
  ON public.finance_notes FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own finance notes"
  ON public.finance_notes FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- account_flags: add owner-based CRUD
CREATE POLICY "Users can view own account flags"
  ON public.account_flags FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own account flags"
  ON public.account_flags FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own account flags"
  ON public.account_flags FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own account flags"
  ON public.account_flags FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);