
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Plus, Paperclip, Mic, Smile } from 'lucide-react';
import { useAttachments } from '@/hooks/useAttachments';
import FileUpload from './FileUpload';
import AttachmentPreview from './AttachmentPreview';
import VoiceMessage from './VoiceMessage';
import SmartSuggestions from './SmartSuggestions';
import ConversationTemplates from './ConversationTemplates';
import { cn } from "@/lib/utils";

interface EnhancedMessageInputProps {
  newMessage: string;
  isInternal: boolean;
  conversationId: string;
  conversationType: string;
  lastMessage?: string;
  onMessageChange: (value: string) => void;
  onInternalToggle: () => void;
  onSendMessage: (attachments?: any[]) => void;
  disabled?: boolean;
}

const EnhancedMessageInput = ({
  newMessage,
  isInternal,
  conversationId,
  conversationType,
  lastMessage = '',
  onMessageChange,
  onInternalToggle,
  onSendMessage,
  disabled = false
}: EnhancedMessageInputProps) => {
  const [showVoiceMessage, setShowVoiceMessage] = useState(false);
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
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
    setShowVoiceMessage(false);
    setShowSmartSuggestions(false);
  };

  const handleVoiceSend = async (audioBlob: Blob, duration: number) => {
    // Here you would upload the audio blob and include it as an attachment
    console.log('Voice message:', { audioBlob, duration });
    // For now, we'll just close the voice interface
    setShowVoiceMessage(false);
  };

  const handleFilesSelected = async (files: File[]) => {
    await handleUpload(files);
    setShowMoreOptions(false);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    onMessageChange(suggestion);
    setShowSmartSuggestions(false);
  };

  const handleTemplateSelect = (content: string) => {
    onMessageChange(content);
  };

  const hasContent = newMessage.trim() || attachments.length > 0;

  return (
    <div className="bg-white border-t border-quikle-silver/30">
      {/* Smart Suggestions */}
      {showSmartSuggestions && lastMessage && (
        <SmartSuggestions
          lastMessage={lastMessage}
          conversationType={conversationType}
          onSelectSuggestion={handleSuggestionSelect}
        />
      )}

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="p-3 border-b border-quikle-silver/20">
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
        </div>
      )}

      <div className="p-4">
        {/* Voice Message Interface */}
        {showVoiceMessage ? (
          <div className="mb-3">
            <VoiceMessage
              onSend={handleVoiceSend}
              onCancel={() => setShowVoiceMessage(false)}
              disabled={disabled}
            />
          </div>
        ) : (
          <>
            {/* Main Input Area */}
            <div className="flex gap-2 mb-3">
              {/* Mobile: More Options Button */}
              <div className="md:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMoreOptions(!showMoreOptions)}
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Message Input */}
              <div className="flex-1 relative">
                <Textarea
                  placeholder={isInternal ? "Add an internal note..." : "Type your message..."}
                  value={newMessage}
                  onChange={(e) => onMessageChange(e.target.value)}
                  className={cn(
                    "min-h-[80px] resize-none pr-12",
                    "md:min-h-[60px]" // Smaller on desktop
                  )}
                  onKeyDown={handleKeyDown}
                  disabled={disabled}
                />
                
                {/* Desktop: Emoji Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-8 w-8 p-0 hidden md:flex"
                  onClick={() => {/* Add emoji picker */}}
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </div>

              {/* Send Button */}
              <Button 
                onClick={handleSend}
                disabled={!hasContent || uploading || disabled}
                className={cn(
                  "shrink-0 h-auto",
                  hasContent ? "bg-quikle-primary hover:bg-quikle-primary/90" : ""
                )}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Internal/Public Toggle */}
                <Button
                  variant={isInternal ? "default" : "outline"}
                  size="sm"
                  onClick={onInternalToggle}
                  className={cn(
                    "text-xs",
                    isInternal && "bg-gray-600 hover:bg-gray-700"
                  )}
                >
                  {isInternal ? "Internal" : "Public"}
                </Button>

                {/* Desktop: Action Buttons */}
                <div className="hidden md:flex items-center gap-2">
                  <FileUpload
                    onFilesSelected={handleFilesSelected}
                    disabled={uploading || disabled}
                    maxSize={10}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVoiceMessage(true)}
                    disabled={disabled}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                  <ConversationTemplates onSelectTemplate={handleTemplateSelect} />
                </div>
              </div>

              {/* Smart Suggestions Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSmartSuggestions(!showSmartSuggestions)}
                className="text-xs"
              >
                Smart Replies
              </Button>
            </div>

            {/* Mobile: Expanded Options */}
            {showMoreOptions && (
              <div className="md:hidden mt-3 pt-3 border-t border-quikle-silver/20">
                <div className="flex items-center gap-2 flex-wrap">
                  <FileUpload
                    onFilesSelected={handleFilesSelected}
                    disabled={uploading || disabled}
                    maxSize={10}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowVoiceMessage(true);
                      setShowMoreOptions(false);
                    }}
                    disabled={disabled}
                  >
                    <Mic className="h-4 w-4 mr-2" />
                    Voice
                  </Button>
                  <ConversationTemplates onSelectTemplate={handleTemplateSelect} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EnhancedMessageInput;
