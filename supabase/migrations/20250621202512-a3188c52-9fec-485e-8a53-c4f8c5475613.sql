
-- Add new privilege for on-site teams
ALTER TABLE public.employee_privileges 
ADD COLUMN can_update_customer_status_onsite boolean DEFAULT false;

-- Add a new role type for on-site workers
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employee_role_updated') THEN
        -- First, let's see what the current enum values are and recreate with the new value
        ALTER TYPE employee_role ADD VALUE IF NOT EXISTS 'onsite_worker';
    END IF;
END $$;

-- Create a table for job completion tracking
CREATE TABLE IF NOT EXISTS public.job_completions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
    employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
    completed_at timestamp with time zone DEFAULT now(),
    notes text,
    before_status text,
    after_status text,
    location_lat decimal(10, 8),
    location_lng decimal(11, 8),
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on job_completions
ALTER TABLE public.job_completions ENABLE ROW LEVEL SECURITY;

-- Create policy for job completions - employees can only see their own company's data
CREATE POLICY "Employees can manage job completions for their company" 
ON public.job_completions
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.employees e
        WHERE e.user_id = auth.uid()
        AND e.id = job_completions.employee_id
    )
    OR
    EXISTS (
        SELECT 1 FROM public.customers c
        JOIN public.employees e ON c.user_id = e.company_owner_id
        WHERE c.id = job_completions.customer_id
        AND e.user_id = auth.uid()
    )
);
