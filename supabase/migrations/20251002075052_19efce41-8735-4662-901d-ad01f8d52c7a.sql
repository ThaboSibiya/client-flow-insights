-- Create table for user-specific OAuth app configurations
CREATE TABLE public.user_oauth_apps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  client_secret TEXT NOT NULL,
  redirect_uri TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider_id)
);

-- Add Row Level Security
ALTER TABLE public.user_oauth_apps ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own OAuth apps" 
  ON public.user_oauth_apps 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own OAuth apps" 
  ON public.user_oauth_apps 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own OAuth apps" 
  ON public.user_oauth_apps 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own OAuth apps" 
  ON public.user_oauth_apps 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_oauth_apps_updated_at
  BEFORE UPDATE ON public.user_oauth_apps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();