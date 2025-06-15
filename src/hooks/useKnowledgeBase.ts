
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  KnowledgeBaseFile,
  uploadKnowledgeBaseFile,
  listKnowledgeBaseFiles,
  deleteKnowledgeBaseFile,
} from '@/services/knowledgeBaseService';

export const useKnowledgeBase = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<KnowledgeBaseFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fetchFiles = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const fetchedFiles = await listKnowledgeBaseFiles();
    setFiles(fetchedFiles);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleUpload = async (file: File) => {
    if (!user) return;
    setIsUploading(true);
    const newFile = await uploadKnowledgeBaseFile(file, user.id);
    if (newFile) {
      setFiles((prevFiles) => [newFile, ...prevFiles]);
    }
    setIsUploading(false);
  };

  const handleDelete = async (file: KnowledgeBaseFile) => {
    const success = await deleteKnowledgeBaseFile(file);
    if (success) {
      setFiles((prevFiles) => prevFiles.filter((f) => f.id !== file.id));
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
