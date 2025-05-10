
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, File as FileIcon, Trash2, Download, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import {
  uploadCustomerFile,
  listCustomerFiles,
  deleteCustomerFile
} from '@/services/storageService';

interface CustomerFileUploadProps {
  customerId: string;
}

interface CustomerFile {
  name: string;
  path: string;
  url: string;
}

const CustomerFileUpload = ({ customerId }: CustomerFileUploadProps) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<CustomerFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && customerId) {
      loadCustomerFiles();
    }
  }, [user, customerId]);

  const loadCustomerFiles = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const customerFiles = await listCustomerFiles(user.id, customerId);
      setFiles(customerFiles);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile || !user) return;

    setIsUploading(true);
    try {
      await uploadCustomerFile(user.id, customerId, uploadedFile);
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
      await loadCustomerFiles(); // Reload the files list
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Upload failed: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleFileDelete = async (fileName: string) => {
    if (!user) return;
    
    if (window.confirm(`Are you sure you want to delete ${fileName}?`)) {
      try {
        await deleteCustomerFile(user.id, customerId, fileName);
        toast({
          title: "Success",
          description: "File deleted successfully",
        });
        await loadCustomerFiles(); // Reload the files list
      } catch (error: any) {
        toast({
          title: "Error",
          description: `Deletion failed: ${error.message}`,
          variant: "destructive",
        });
      }
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">You must be logged in to manage customer documents.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileIcon className="h-5 w-5 text-broker-primary" />
          Customer Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              type="file"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="flex-1"
            />
            <Button 
              variant="outline" 
              disabled={isUploading} 
              className="flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </div>
          
          <div className="border rounded-md divide-y">
            {isLoading ? (
              <div className="p-4 text-center">
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">Loading documents...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No documents uploaded yet
              </div>
            ) : (
              files.map((file, index) => (
                <div key={index} className="p-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{file.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <a 
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleFileDelete(file.name)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerFileUpload;
