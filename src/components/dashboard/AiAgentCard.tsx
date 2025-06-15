
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone } from 'lucide-react';
import AiVoiceSessionDialog from '@/components/voice/AiVoiceSessionDialog';

const AiAgentCard = () => {
  const [isSessionOpen, setIsSessionOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="text-quikle-primary" />
            <span>AI Voice Agent</span>
          </Title>
          <CardDescription>Engage with customers via our AI-powered voice agent.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-quikle-slate mb-4">
            Initiate a real-time voice conversation powered by AI to handle customer queries, provide support, or gather information.
          </p>
          <Button onClick={() => setIsSessionOpen(true)}>
            <Phone size={16} className="mr-2" />
            Start New Session
          </Button>
        </CardContent>
      </Card>
      <AiVoiceSessionDialog isOpen={isSessionOpen} onOpenChange={setIsSessionOpen} />
    </>
  );
};

export default AiAgentCard;
