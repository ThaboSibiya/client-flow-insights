import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Paperclip, Download, Trash2, Upload, Loader2, File } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  uploadTicketAttachment,
  getTicketAttachments,
  deleteTicketAttachment,
  getAttachmentUrl,
  type TicketAttachment,
} from '@/services/ticketAttachmentService';

interface TicketAttachmentsProps {
  ticketId: string;
}

const TicketAttachments = ({ ticketId }: TicketAttachmentsProps) => {
  const { user } = useAuth();
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<TicketAttachment | null>(null);

  useEffect(() => {
    if (user && ticketId) loadAttachments();
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
        toast({ title: "Success", description: "File uploaded successfully" });
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const success = await deleteTicketAttachment(deleteTarget.id, deleteTarget.file_path);
    if (success) {
      setAttachments(prev => prev.filter(a => a.id !== deleteTarget.id));
      toast({ title: "Success", description: "Attachment deleted" });
    }
    setDeleteTarget(null);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const kb = bytes / 1024;
    return kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(1)} MB`;
  };

  if (!user) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm text-foreground">Attachments</span>
          {attachments.length > 0 && (
            <Badge variant="outline" className="text-xs">{attachments.length}</Badge>
          )}
        </div>
        <div>
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
            className="h-7 text-xs"
            disabled={isUploading}
            onClick={() => document.getElementById(`file-upload-${ticketId}`)?.click()}
          >
            {isUploading ? (
              <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Uploading...</>
            ) : (
              <><Upload className="h-3 w-3 mr-1" />Upload</>
            )}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-2">
          <Loader2 className="h-4 w-4 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : attachments.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-3">No attachments</p>
      ) : (
        <div className="space-y-1.5">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="flex items-center justify-between bg-muted/50 p-2 rounded-md text-xs">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <File className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate">{attachment.file_name}</p>
                  <p className="text-muted-foreground">{formatFileSize(attachment.file_size)}</p>
                </div>
              </div>
              <div className="flex gap-0.5 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-primary hover:text-primary/80"
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
                  size="icon"
                  className="h-6 w-6 text-destructive hover:text-destructive/80"
                  onClick={() => setDeleteTarget(attachment)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Attachment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.file_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TicketAttachments;
