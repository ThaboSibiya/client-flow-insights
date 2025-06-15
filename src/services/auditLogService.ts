import { supabase } from '@/integrations/supabase/client';

const getEmployeeIdFromUserId = async (userId: string): Promise<string | null> => {
  if (!userId) {
    console.error('Audit log: No user ID provided.');
    return null;
  }
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // Ignore 'exact one row not found'
      throw error;
    }
    if (!data) {
      return null; // User might not be an employee
    }

    return data.id;
  } catch (error: any) {
    console.error('Audit log: Error fetching employee ID:', error.message);
    return null;
  }
};

export const logLoginHistory = async (userId: string) => {
  const employeeId = await getEmployeeIdFromUserId(userId);
  if (!employeeId) {
    // Not an employee, so no need to log in employee_login_history
    return;
  }

  try {
    const { error } = await supabase.from('employee_login_history').insert({
      employee_id: employeeId,
      user_agent: navigator.userAgent,
    });
    if (error) throw error;
  } catch (error: any) {
    console.error('Error logging login history:', error.message);
  }
};

type FileAction = 'upload' | 'delete';

export const logFileAccess = async (filePath: string, action: FileAction) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error('Audit log: No user found for file access logging.');
        return;
    }
    
    const employeeId = await getEmployeeIdFromUserId(user.id);
    if (!employeeId) {
      // Not an employee, so no need to log in file_access_history
      return;
    }
    
    const { error } = await supabase.from('file_access_history').insert({
      employee_id: employeeId,
      file_path: filePath,
      action: action,
    });
    if (error) throw error;
  } catch (error: any) {
    console.error(`Error logging file ${action} event:`, error.message);
  }
};

export const getLoginHistory = async () => {
  const { data, error } = await supabase
    .from('employee_login_history')
    .select(`
      id,
      login_timestamp,
      ip_address,
      user_agent,
      employees (
        first_name,
        last_name,
        email
      )
    `)
    .order('login_timestamp', { ascending: false });

  if (error) throw error;
  return data;
};

export const getFileAccessHistory = async () => {
  const { data, error } = await supabase
    .from('file_access_history')
    .select(`
      id,
      accessed_at,
      file_path,
      action,
      employees (
        first_name,
        last_name,
        email
      )
    `)
    .order('accessed_at', { ascending: false });

  if (error) throw error;
  return data;
};
