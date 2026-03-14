import { supabase } from '@/integrations/supabase/client';
import { Customer, CustomerStatus } from '@/types/customer';
import { toast } from '@/components/ui/use-toast';
import { logSecurityEvent, validateEmail, validatePhone, sanitizeInput } from './securityService';

export const addCustomer = async (
  customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>, 
  userId: string,
  workspaceId?: string | null
) => {
  if (!userId) {
    await logSecurityEvent({
      action: 'unauthorized_customer_add',
      resource_type: 'customers',
      success: false,
      error_message: 'No user ID provided'
    });
    toast({
      title: "Error",
      description: "You must be logged in to add customers",
      variant: "destructive",
    });
    return null;
  }

  // Validate input data
  if (!validateEmail(customerData.email)) {
    toast({
      title: "Error",
      description: "Please enter a valid email address",
      variant: "destructive",
    });
    return null;
  }

  if (!validatePhone(customerData.phone || '')) {
    toast({
      title: "Error",
      description: "Please enter a valid phone number",
      variant: "destructive",
    });
    return null;
  }
  
  try {
    console.log("Adding customer with data:", { ...customerData, user_id: userId });
    
    const sanitizedData: Record<string, any> = {
      name: sanitizeInput(customerData.name, 100),
      email: customerData.email.toLowerCase().trim(),
      phone: sanitizeInput(customerData.phone || '', 20),
      status: customerData.status,
      notes: sanitizeInput(customerData.notes || '', 500),
      user_id: userId,
    };

    if (workspaceId) {
      sanitizedData.workspace_id = workspaceId;
    }

    const { data, error } = await supabase
      .from('customers')
      .insert([sanitizedData as any])
      .select('*')
      .single();

    if (error) {
      console.error("Supabase error:", error);
      await logSecurityEvent({
        action: 'customer_add_failed',
        resource_type: 'customers',
        success: false,
        error_message: error.message
      });
      throw error;
    }
    
    if (data) {
      console.log("Customer added successfully:", data);
      
      const newCustomer: Customer = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        status: data.status as CustomerStatus,
        notes: data.notes || '',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        activeTickets: [],
        ticketCount: 0,
        lastTicketDate: undefined
      };

      await logSecurityEvent({
        action: 'customer_added',
        resource_type: 'customers',
        resource_id: data.id,
        success: true
      });
      
      toast({
        title: "Success",
        description: "Customer added successfully",
      });

      return newCustomer;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error adding customer:', error.message);
    await logSecurityEvent({
      action: 'customer_add_error',
      resource_type: 'customers',
      success: false,
      error_message: error.message
    });
    toast({
      title: "Error",
      description: `Failed to add customer: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
};

export const updateCustomerStatus = async (id: string, status: CustomerStatus, userId: string) => {
  if (!userId) {
    await logSecurityEvent({
      action: 'unauthorized_customer_status_update',
      resource_type: 'customers',
      resource_id: id,
      success: false,
      error_message: 'No user ID provided'
    });
    return false;
  }
  
  try {
    // Verify ownership before update
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existingCustomer || existingCustomer.user_id !== userId) {
      await logSecurityEvent({
        action: 'unauthorized_customer_update',
        resource_type: 'customers',
        resource_id: id,
        success: false,
        error_message: 'Customer not found or access denied'
      });
      toast({
        title: "Error",
        description: "Customer not found or access denied",
        variant: "destructive",
      });
      return false;
    }

    const { error } = await supabase
      .from('customers')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .eq('user_id', userId); // Double-check ownership

    if (error) {
      await logSecurityEvent({
        action: 'customer_status_update_failed',
        resource_type: 'customers',
        resource_id: id,
        success: false,
        error_message: error.message
      });
      throw error;
    }

    await logSecurityEvent({
      action: 'customer_status_updated',
      resource_type: 'customers',
      resource_id: id,
      success: true
    });
    
    toast({
      title: "Success",
      description: "Customer status updated",
    });
    
    return true;
  } catch (error: any) {
    console.error('Error updating customer status:', error.message);
    toast({
      title: "Error",
      description: "Failed to update customer status",
      variant: "destructive",
    });
    return false;
  }
};

export const updateCustomer = async (id: string, customerData: Partial<Customer>, userId: string) => {
  if (!userId) return false;
  
  try {
    // Validate input if email or phone is being updated
    if (customerData.email && !validateEmail(customerData.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    if (customerData.phone && !validatePhone(customerData.phone)) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return false;
    }

    // Verify ownership before update
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existingCustomer || existingCustomer.user_id !== userId) {
      await logSecurityEvent({
        action: 'unauthorized_customer_update',
        resource_type: 'customers',
        resource_id: id,
        success: false,
        error_message: 'Customer not found or access denied'
      });
      return false;
    }
    
    // Transform and sanitize data
    const dbData: any = { 
      ...customerData, 
      updated_at: new Date().toISOString() 
    };
    
    if (dbData.name) dbData.name = sanitizeInput(dbData.name, 100);
    if (dbData.email) dbData.email = dbData.email.toLowerCase().trim();
    if (dbData.phone) dbData.phone = sanitizeInput(dbData.phone, 20);
    if (dbData.notes) dbData.notes = sanitizeInput(dbData.notes, 500);
    
    // Remove fields that shouldn't be sent to the database
    if (dbData.createdAt) delete dbData.createdAt;
    if (dbData.updatedAt) delete dbData.updatedAt;

    const { error } = await supabase
      .from('customers')
      .update(dbData)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    await logSecurityEvent({
      action: 'customer_updated',
      resource_type: 'customers',
      resource_id: id,
      success: true
    });
    
    toast({
      title: "Success",
      description: "Customer updated successfully",
    });
    
    return true;
  } catch (error: any) {
    console.error('Error updating customer:', error.message);
    await logSecurityEvent({
      action: 'customer_update_error',
      resource_type: 'customers',
      resource_id: id,
      success: false,
      error_message: error.message
    });
    toast({
      title: "Error",
      description: "Failed to update customer",
      variant: "destructive",
    });
    return false;
  }
};

export const deleteCustomer = async (id: string, userId: string) => {
  if (!userId) return false;
  
  try {
    // Verify ownership before deletion
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existingCustomer || existingCustomer.user_id !== userId) {
      await logSecurityEvent({
        action: 'unauthorized_customer_delete',
        resource_type: 'customers',
        resource_id: id,
        success: false,
        error_message: 'Customer not found or access denied'
      });
      return false;
    }

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    await logSecurityEvent({
      action: 'customer_deleted',
      resource_type: 'customers',
      resource_id: id,
      success: true
    });
    
    toast({
      title: "Success",
      description: "Customer deleted successfully",
    });
    
    return true;
  } catch (error: any) {
    console.error('Error deleting customer:', error.message);
    await logSecurityEvent({
      action: 'customer_delete_error',
      resource_type: 'customers',
      resource_id: id,
      success: false,
      error_message: error.message
    });
    toast({
      title: "Error",
      description: "Failed to delete customer",
      variant: "destructive",
    });
    return false;
  }
};
