
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface KnowledgeBaseFile {
  id: string;
  file_name: string;
  file_path: string;
  created_at: string;
}

const BUCKET_NAME = 'knowledge_base';

/**
 * Upload a file to the knowledge base.
 */
export const uploadKnowledgeBaseFile = async (
  file: File,
  userId: string
): Promise<KnowledgeBaseFile | null> => {
  const { toast } = useToast();
  try {
    const filePath = `${userId}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data, error: dbError } = await supabase
      .from('knowledge_base_files')
      .insert({
        user_id: userId,
        file_name: file.name,
        file_path: filePath,
      })
      .select()
      .single();

    if (dbError) {
      // If DB insert fails, try to remove the uploaded file
      await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      throw dbError;
    }
    
    toast({
        title: "Success",
        description: `File "${file.name}" uploaded successfully.`,
    });

    return data;
  } catch (error: any) {
    console.error('Error uploading knowledge base file:', error);
    toast({
      title: "Upload Failed",
      description: error.message || "Could not upload the file.",
      variant: "destructive",
    });
    return null;
  }
};

/**
 * List all files in the knowledge base for the current user.
 */
export const listKnowledgeBaseFiles = async (): Promise<KnowledgeBaseFile[]> => {
  const { toast } = useToast();
  try {
    const { data, error } = await supabase
      .from('knowledge_base_files')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error: any) {
    console.error('Error listing knowledge base files:', error);
    toast({
      title: "Error",
      description: "Could not fetch knowledge base files.",
      variant: "destructive",
    });
    return [];
  }
};

/**
 * Delete a file from the knowledge base.
 */
export const deleteKnowledgeBaseFile = async (file: KnowledgeBaseFile): Promise<boolean> => {
  const { toast } = useToast();
  try {
    // First, delete from storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([file.file_path]);

    if (storageError) {
      // Log error but attempt to delete DB record anyway
      console.error('Error deleting file from storage:', storageError);
    }
    
    // Then, delete from database
    const { error: dbError } = await supabase
      .from('knowledge_base_files')
      .delete()
      .eq('id', file.id);

    if (dbError) {
      throw dbError;
    }

    toast({
      title: "Success",
      description: `File "${file.file_name}" deleted successfully.`,
    });
    return true;
  } catch (error: any) {
    console.error('Error deleting knowledge base file:', error);
    toast({
      title: "Deletion Failed",
      description: error.message || `Could not delete "${file.file_name}".`,
      variant: "destructive",
    });
    return false;
  }
};
