
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Paperclip, Download, Trash2, Upload, Loader2, File } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import {
  uploadTicketAttachment,
  getTicketAttachments,
  deleteTicketAttachment,
  getAttachmentUrl,
  type TicketAttachment
} from '@/services/ticketAttachmentService';

interface TicketAttachmentsProps {
  ticketId: string;
}

const TicketAttachments = ({ ticketId }: TicketAttachmentsProps) => {
  const { user } = useAuth();
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && ticketId) {
      loadAttachments();
    }
  }, [user, ticketId]);

  const loadAttachments = async () => {
    setIsLoading(true);
    try {
      const data = await getTicketAttachments(ticketId);
      setAttachments(data);
    } catch (error) {
      console.error('Error loading attachments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const attachment = await uploadTicketAttachment(user.id, ticketId, file);
      if (attachment) {
        setAttachments(prev => [attachment, ...prev]);
        toast({
          title: "Success",
          description: "File uploaded successfully",
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleDelete = async (attachment: TicketAttachment) => {
    if (window.confirm(`Are you sure you want to delete ${attachment.file_name}?`)) {
      const success = await deleteTicketAttachment(attachment.id, attachment.file_path);
      if (success) {
        setAttachments(prev => prev.filter(a => a.id !== attachment.id));
        toast({
          title: "Success",
          description: "Attachment deleted successfully",
        });
      }
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  if (!user) return null;

  return (
    <div className="border-t pt-3 mt-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Paperclip className="h-4 w-4" />
          <span className="font-medium text-sm">Attachments</span>
          {attachments.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {attachments.length}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Input
            type="file"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
            id={`file-upload-${ticketId}`}
          />
          <Button
            size="sm"
            variant="outline"
            disabled={isUploading}
            onClick={() => document.getElementById(`file-upload-${ticketId}`)?.click()}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-3 w-3 mr-1" />
                Upload
              </>
            )}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-2">
          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
          <p className="text-xs text-gray-500 mt-1">Loading attachments...</p>
        </div>
      ) : attachments.length === 0 ? (
        <p className="text-xs text-gray-500 text-center py-2">No attachments</p>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="flex items-center justify-between bg-gray-50 p-2 rounded text-xs">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <File className="h-3 w-3 text-gray-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{attachment.file_name}</p>
                  <p className="text-gray-500">{formatFileSize(attachment.file_size)}</p>
                </div>
              </div>
              <div className="flex gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                  onClick={async () => {
                    try {
                      const url = await getAttachmentUrl(attachment.file_path);
                      window.open(url, '_blank', 'noopener,noreferrer');
                    } catch {
                      toast({ title: 'Error', description: 'Failed to get download link', variant: 'destructive' });
                    }
                  }}
                >
                  <Download className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                  onClick={() => handleDelete(attachment)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketAttachments;
