
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { uploadAttachment, deleteAttachment, AttachmentFile } from '@/services/attachmentService';

export const useAttachments = (conversationId: string) => {
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleUpload = async (files: File[]): Promise<AttachmentFile[]> => {
    if (!user) return [];

    setUploading(true);
    const uploadedFiles: AttachmentFile[] = [];

    try {
      for (const file of files) {
        const result = await uploadAttachment(file, conversationId, user.id);
        if (result) {
          uploadedFiles.push(result);
        }
      }

      setAttachments(prev => [...prev, ...uploadedFiles]);
      
      if (uploadedFiles.length > 0) {
        toast({
          title: "Success",
          description: `${uploadedFiles.length} file(s) uploaded successfully`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }

    return uploadedFiles;
  };

  const handleDelete = async (filePath: string) => {
    const success = await deleteAttachment(filePath);
    if (success) {
      setAttachments(prev => prev.filter(file => file.path !== filePath));
      toast({
        title: "Success",
        description: "Attachment deleted successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete attachment",
        variant: "destructive",
      });
    }
  };

  const clearAttachments = () => {
    setAttachments([]);
  };

  return {
    attachments,
    uploading,
    handleUpload,
    handleDelete,
    clearAttachments,
  };
};
