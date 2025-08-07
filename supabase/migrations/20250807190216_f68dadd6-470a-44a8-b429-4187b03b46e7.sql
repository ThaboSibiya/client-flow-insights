
-- Fix the ambiguous column reference in employee number generation
CREATE OR REPLACE FUNCTION public.generate_employee_number()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
    next_number INTEGER;
    employee_number TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(e.employee_number FROM 4) AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.employees e
    WHERE e.employee_number LIKE 'EMP%';
    
    employee_number := 'EMP' || LPAD(next_number::TEXT, 4, '0');
    RETURN employee_number;
END;
$function$;

-- Update the trigger function to avoid ambiguous references
CREATE OR REPLACE FUNCTION public.set_employee_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    IF NEW.employee_number IS NULL OR NEW.employee_number = '' THEN
        NEW.employee_number := generate_employee_number();
    END IF;
    NEW.updated_at := now();
    RETURN NEW;
END;
$function$;
