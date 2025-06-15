import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { logFileAccess } from './auditLogService';

/**
 * Upload a file to the customer-docs bucket
 * Files are stored in a user-specific folder structure: {userId}/{customerId}/{filename}
 */
export const uploadCustomerFile = async (
  userId: string,
  customerId: string,
  file: File
): Promise<string | null> => {
  try {
    // Create a path with user ID as the first folder to maintain RLS security
    const filePath = `${userId}/${customerId}/${file.name}`;

    const { data, error } = await supabase.storage
      .from('customer-docs')
      .upload(filePath, file, {
        upsert: true,
        cacheControl: '3600'
      });

    if (error) {
      console.error('Error uploading file:', error.message);
      throw error;
    }

    await logFileAccess(data.path, 'upload');

    // Return the path to the uploaded file
    return data.path;
  } catch (error: any) {
    console.error('Error in uploadCustomerFile:', error.message);
    toast({
      title: "Error",
      description: `Failed to upload file: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
};

/**
 * List all files for a specific customer
 */
export const listCustomerFiles = async (
  userId: string,
  customerId: string
): Promise<{ name: string, path: string, url: string }[]> => {
  try {
    // List files in the customer's folder
    const { data, error } = await supabase.storage
      .from('customer-docs')
      .list(`${userId}/${customerId}`);

    if (error) {
      console.error('Error listing files:', error.message);
      throw error;
    }

    if (!data) {
      return [];
    }

    // Create URLs for each file
    return data.filter(item => !item.id.endsWith('/')).map(item => {
      const path = `${userId}/${customerId}/${item.name}`;
      const url = supabase.storage
        .from('customer-docs')
        .getPublicUrl(path).data.publicUrl;
      
      return {
        name: item.name,
        path: path,
        url: url
      };
    });
  } catch (error: any) {
    console.error('Error in listCustomerFiles:', error.message);
    toast({
      title: "Error",
      description: `Failed to list files: ${error.message}`,
      variant: "destructive",
    });
    return [];
  }
};

/**
 * Delete a customer file
 */
export const deleteCustomerFile = async (
  userId: string,
  customerId: string,
  fileName:string
): Promise<boolean> => {
  try {
    const filePath = `${userId}/${customerId}/${fileName}`;
    
    const { error } = await supabase.storage
      .from('customer-docs')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error.message);
      throw error;
    }

    await logFileAccess(filePath, 'delete');

    return true;
  } catch (error: any) {
    console.error('Error in deleteCustomerFile:', error.message);
    toast({
      title: "Error",
      description: `Failed to delete file: ${error.message}`,
      variant: "destructive",
    });
    return false;
  }
};
