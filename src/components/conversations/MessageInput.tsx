
import React from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from 'lucide-react';
import { useAttachments } from '@/hooks/useAttachments';
import FileUpload from './FileUpload';
import AttachmentPreview from './AttachmentPreview';

interface MessageInputProps {
  newMessage: string;
  isInternal: boolean;
  conversationId: string;
  onMessageChange: (value: string) => void;
  onInternalToggle: () => void;
  onSendMessage: (attachments?: any[]) => void;
}

const MessageInput = ({
  newMessage,
  isInternal,
  conversationId,
  onMessageChange,
  onInternalToggle,
  onSendMessage
}: MessageInputProps) => {
  const { attachments, uploading, handleUpload, handleDelete, clearAttachments } = useAttachments(conversationId);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSend();
    }
  };

  const handleSend = async () => {
    const attachmentData = attachments.map(att => ({
      name: att.name,
      size: att.size,
      type: att.type,
      url: att.url,
      path: att.path
    }));

    await onSendMessage(attachmentData);
    clearAttachments();
  };

  const handleFilesSelected = async (files: File[]) => {
    await handleUpload(files);
  };

  return (
    <div className="bg-white border-t border-quikle-silver/30 p-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant={isInternal ? "default" : "outline"}
            size="sm"
            onClick={onInternalToggle}
            className={isInternal ? "bg-gray-600 hover:bg-gray-700" : ""}
          >
            {isInternal ? "Internal Note" : "Public Reply"}
          </Button>
        </div>

        {attachments.length > 0 && (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {attachments.map((attachment) => (
              <AttachmentPreview
                key={attachment.id}
                attachment={attachment}
                showDelete
                onDelete={handleDelete}
                compact
              />
            ))}
          </div>
        )}
        
        <div className="flex gap-2">
          <Textarea
            placeholder={isInternal ? "Add an internal note..." : "Type your message..."}
            value={newMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            className="flex-1 min-h-[80px]"
            onKeyDown={handleKeyDown}
          />
          <div className="flex flex-col gap-2">
            <FileUpload
              onFilesSelected={handleFilesSelected}
              disabled={uploading}
              maxSize={10}
            />
            <Button 
              onClick={handleSend}
              disabled={(!newMessage.trim() && attachments.length === 0) || uploading}
              className="bg-quikle-primary hover:bg-quikle-primary/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
