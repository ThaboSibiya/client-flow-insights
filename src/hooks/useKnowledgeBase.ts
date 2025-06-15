
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  KnowledgeBaseFile,
  uploadKnowledgeBaseFile,
  listKnowledgeBaseFiles,
  deleteKnowledgeBaseFile,
} from '@/services/knowledgeBaseService';
import { useToast } from '@/hooks/use-toast';

export const useKnowledgeBase = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<KnowledgeBaseFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const fetchFiles = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const fetchedFiles = await listKnowledgeBaseFiles();
      setFiles(fetchedFiles);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Could not fetch knowledge base files.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleUpload = async (file: File) => {
    if (!user) return;
    setIsUploading(true);
    try {
      const newFile = await uploadKnowledgeBaseFile(file, user.id);
      setFiles((prevFiles) => [newFile, ...prevFiles]);
      toast({
        title: "Success",
        description: `File "${file.name}" uploaded successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Could not upload the file.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (file: KnowledgeBaseFile) => {
    try {
      await deleteKnowledgeBaseFile(file);
      setFiles((prevFiles) => prevFiles.filter((f) => f.id !== file.id));
      toast({
        title: "Success",
        description: `File "${file.file_name}" deleted successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message || `Could not delete "${file.file_name}".`,
        variant: "destructive",
      });
    }
  };

  return {
    files,
    isLoading,
    isUploading,
    handleUpload,
    handleDelete,
    refetch: fetchFiles,
  };
};
