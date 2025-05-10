
import { supabase } from '@/integrations/supabase/client';
import { Customer, CustomerStatus } from '@/types/customer';
import { toast } from '@/components/ui/use-toast';

export const addCustomer = async (
  customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>, 
  userId: string
) => {
  if (!userId) {
    toast({
      title: "Error",
      description: "You must be logged in to add customers",
      variant: "destructive",
    });
    return null;
  }
  
  try {
    console.log("Adding customer with data:", { ...customerData, user_id: userId });
    
    const { data, error } = await supabase
      .from('customers')
      .insert([
        { 
          ...customerData,
          user_id: userId
        }
      ])
      .select('*')
      .single();

    if (error) {
      console.error("Supabase error:", error);
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
      };
      
      toast({
        title: "Success",
        description: "Customer added successfully",
      });

      return newCustomer;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error adding customer:', error.message);
    toast({
      title: "Error",
      description: `Failed to add customer: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
};

export const updateCustomerStatus = async (id: string, status: CustomerStatus, userId: string) => {
  if (!userId) return false;
  
  try {
    const { error } = await supabase
      .from('customers')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    
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
    // Transform to database format
    const dbData: any = { ...customerData, updated_at: new Date().toISOString() };
    
    // Remove fields that shouldn't be sent to the database
    if (dbData.createdAt) delete dbData.createdAt;
    if (dbData.updatedAt) delete dbData.updatedAt;
    
    const { error } = await supabase
      .from('customers')
      .update(dbData)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Customer updated successfully",
    });
    
    return true;
  } catch (error: any) {
    console.error('Error updating customer:', error.message);
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
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Customer deleted successfully",
    });
    
    return true;
  } catch (error: any) {
    console.error('Error deleting customer:', error.message);
    toast({
      title: "Error",
      description: "Failed to delete customer",
      variant: "destructive",
    });
    return false;
  }
};
