
-- Create table to log employee login history
CREATE TABLE public.employee_login_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    login_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    ip_address TEXT,
    user_agent TEXT
);
COMMENT ON TABLE public.employee_login_history IS 'Records each time an employee logs into the system.';
COMMENT ON COLUMN public.employee_login_history.employee_id IS 'The employee who logged in.';
COMMENT ON COLUMN public.employee_login_history.login_timestamp IS 'When the login occurred.';
COMMENT ON COLUMN public.employee_login_history.ip_address IS 'The IP address of the login request.';
COMMENT ON COLUMN public.employee_login_history.user_agent IS 'The browser/client user agent string of the login request.';

-- Create table to log file access
CREATE TABLE public.file_access_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    action TEXT NOT NULL, -- e.g., 'upload', 'download', 'delete', 'view'
    accessed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.file_access_history IS 'Records access to sensitive files and attachments.';
COMMENT ON COLUMN public.file_access_history.employee_id IS 'The employee who accessed the file.';
COMMENT ON COLUMN public.file_access_history.file_path IS 'The storage path of the accessed file.';
COMMENT ON COLUMN public.file_access_history.action IS 'The action performed (e.g., upload, download, delete, view).';
COMMENT ON COLUMN public.file_access_history.accessed_at IS 'When the file was accessed.';

-- Enable Row Level Security on both tables
ALTER TABLE public.employee_login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_access_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employee_login_history
-- Allow admins to view all login history
CREATE POLICY "Admins can view login history"
ON public.employee_login_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.employees
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow system to insert login records.
CREATE POLICY "Employees can insert their own login records"
ON public.employee_login_history
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.employees
    WHERE id = employee_id AND user_id = auth.uid()
  )
);

-- RLS Policies for file_access_history
-- Allow admins to view all file access history
CREATE POLICY "Admins can view file access history"
ON public.file_access_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.employees
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow employees to log their own file access events.
CREATE POLICY "Employees can log their own file access"
ON public.file_access_history
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.employees
    WHERE id = employee_id AND user_id = auth.uid()
  )
);
