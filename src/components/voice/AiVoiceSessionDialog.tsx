
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import VoiceInterface from './VoiceInterface';
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
            AI Voice Agent
          </DialogTitle>
          <DialogDescription>
            The AI agent is ready. Start the conversation to interact.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-8 space-y-4 min-h-[200px]">
          {isAgentSpeaking ? (
             <div className="flex flex-col items-center text-center text-quikle-primary animate-pulse">
                <Bot size={48} />
                <p className="mt-2 font-semibold">Agent is speaking...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center text-quikle-slate">
                <Mic size={48} />
                <p className="mt-2">Agent is listening...</p>
            </div>
          )}
        </div>
        <div className="flex justify-center pb-4">
            <VoiceInterface onSpeakingChange={setIsAgentSpeaking} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AiVoiceSessionDialog;
