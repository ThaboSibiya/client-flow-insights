
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, File, Trash2, Download } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { CustomerFile } from '@/types/customer';
import {
  uploadCustomerFile,
  listCustomerFiles,
  deleteCustomerFile,
  getFileUrl
} from '@/services/storageService';

interface CustomerFileUploadProps {
  customerId: string;
}

const CustomerFileUpload = ({ customerId }: CustomerFileUploadProps) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<CustomerFile[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (customerId) {
      loadFiles();
    }
  }, [customerId]);

  const loadFiles = async () => {
    try {
      const fileList = await listCustomerFiles(customerId);
      // Transform the file objects to match CustomerFile interface
      const transformedFiles: CustomerFile[] = (fileList || []).map((fileObj: any) => ({
        name: fileObj.name,
        path: fileObj.name, // Use name as path fallback
        size: fileObj.metadata?.size,
        created_at: fileObj.created_at ? new Date(fileObj.created_at) : undefined,
        content_type: fileObj.metadata?.mimetype
      }));
      setFiles(transformedFiles);
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      await uploadCustomerFile(file, customerId, user.id);
      await loadFiles();
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDeleteFile = async (filePath: string) => {
    if (!user) return;
    
    try {
      await deleteCustomerFile(filePath, user.id);
      await loadFiles();
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
    }
  };

  const handleDownloadFile = async (fileName: string) => {
    const filePath = `customers/${customerId}/${fileName}`;
    const url = await getFileUrl(filePath);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="h-5 w-5" />
          Customer Files
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="customer-file-upload"
          />
          <Button
            onClick={() => document.getElementById('customer-file-upload')?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
        </div>

        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm">{file.name}</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownloadFile(file.name)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteFile(`customers/${customerId}/${file.name}`)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {files.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">No files uploaded</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerFileUpload;
