
-- Enable Row Level Security on the employees table
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Create policy that allows company owners to view their employees
CREATE POLICY "Company owners can view their employees" 
  ON public.employees 
  FOR SELECT 
  USING (auth.uid() = company_owner_id);

-- Create policy that allows company owners to insert employees
CREATE POLICY "Company owners can create employees" 
  ON public.employees 
  FOR INSERT 
  WITH CHECK (auth.uid() = company_owner_id);

-- Create policy that allows company owners to update their employees
CREATE POLICY "Company owners can update their employees" 
  ON public.employees 
  FOR UPDATE 
  USING (auth.uid() = company_owner_id);

-- Create policy that allows company owners to delete their employees
CREATE POLICY "Company owners can delete their employees" 
  ON public.employees 
  FOR DELETE 
  USING (auth.uid() = company_owner_id);
