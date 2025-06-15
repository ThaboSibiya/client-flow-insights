
-- This trigger will automatically generate an employee number 
-- for a new employee before they are saved to the database.
CREATE TRIGGER set_employee_number_before_insert
BEFORE INSERT ON public.employees
FOR EACH ROW
EXECUTE FUNCTION public.set_employee_number();
