
-- Add missing INSERT policy for profiles table
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (( SELECT auth.uid() AS uid) = id);
