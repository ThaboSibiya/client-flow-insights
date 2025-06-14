
import React from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send } from 'lucide-react';

interface MessageInputProps {
  newMessage: string;
  isInternal: boolean;
  onMessageChange: (value: string) => void;
  onInternalToggle: () => void;
  onSendMessage: () => void;
}

const MessageInput = ({
  newMessage,
  isInternal,
  onMessageChange,
  onInternalToggle,
  onSendMessage
}: MessageInputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      onSendMessage();
    }
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
        
        <div className="flex gap-2">
          <Textarea
            placeholder={isInternal ? "Add an internal note..." : "Type your message..."}
            value={newMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            className="flex-1 min-h-[80px]"
            onKeyDown={handleKeyDown}
          />
          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button 
              onClick={onSendMessage}
              disabled={!newMessage.trim()}
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
