
import React, { useState } from 'react';
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Trash2, UploadCloud, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const KnowledgeBaseManager = () => {
  const { files, isLoading, isUploading, handleUpload, handleDelete } = useKnowledgeBase();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      // Check file type and size
      const allowedTypes = ['application/pdf', 'text/plain', 'text/markdown', 'text/csv'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF, TXT, MD, or CSV file.",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({
          title: "File Too Large",
          description: "File size cannot exceed 5MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const onUpload = async () => {
    if (selectedFile) {
      await handleUpload(selectedFile);
      setSelectedFile(null);
      // Clear the input
      const input = document.getElementById('knowledge-base-file-input') as HTMLInputElement;
      if (input) {
          input.value = '';
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Knowledge Base</CardTitle>
        <CardDescription>
          Upload documents (PDF, TXT, MD, CSV) to provide context to the AI agent. Max file size: 5MB.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Input id="knowledge-base-file-input" type="file" onChange={onFileChange} accept=".pdf,.txt,.md,.csv" />
          <Button onClick={onUpload} disabled={!selectedFile || isUploading}>
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="mr-2 h-4 w-4" />
            )}
            Upload
          </Button>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files</h4>
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading files...</span>
            </div>
          ) : files.length === 0 ? (
            <p className="text-sm text-muted-foreground">No files uploaded yet.</p>
          ) : (
            <ul className="rounded-md border">
              {files.map((file) => (
                <li key={file.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">{file.file_name}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(file)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KnowledgeBaseManager;
