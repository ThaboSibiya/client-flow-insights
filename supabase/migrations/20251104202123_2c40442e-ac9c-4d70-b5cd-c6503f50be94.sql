-- Fix RLS policies for customer_finance_summary table
-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own finance summaries" ON customer_finance_summary;
DROP POLICY IF EXISTS "Users can insert their own finance summaries" ON customer_finance_summary;
DROP POLICY IF EXISTS "Users can update their own finance summaries" ON customer_finance_summary;
DROP POLICY IF EXISTS "Users can delete their own finance summaries" ON customer_finance_summary;

-- Create comprehensive RLS policies for customer_finance_summary
CREATE POLICY "Users can view their own finance summaries"
  ON customer_finance_summary
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own finance summaries"
  ON customer_finance_summary
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own finance summaries"
  ON customer_finance_summary
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own finance summaries"
  ON customer_finance_summary
  FOR DELETE
  USING (auth.uid() = user_id);