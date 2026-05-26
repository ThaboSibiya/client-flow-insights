
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import QuikleVoiceSession from './QuikleVoiceSession';
import { Mic, Bot } from 'lucide-react';

interface AiVoiceSessionDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const AiVoiceSessionDialog: React.FC<AiVoiceSessionDialogProps> = ({ isOpen, onOpenChange }) => {
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot />
            Quikle Voice Agent
          </DialogTitle>
          <DialogDescription>
            Powered by Groq Whisper + OpenRouter free models. Hold the mic to speak.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6 space-y-4 min-h-[220px]">
          {isAgentSpeaking ? (
            <div className="flex flex-col items-center text-center text-primary animate-pulse">
              <Bot size={40} />
              <p className="mt-2 text-sm font-medium">Agent is speaking…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center text-muted-foreground">
              <Mic size={40} />
            </div>
          )}
          <QuikleVoiceSession onSpeakingChange={setIsAgentSpeaking} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AiVoiceSessionDialog;
