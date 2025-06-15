import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { useNavigate } from 'react-router-dom';

interface VoiceInterfaceProps {
  onSpeakingChange: (speaking: boolean) => void;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ onSpeakingChange }) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const chatRef = useRef<RealtimeChat | null>(null);
  const navigate = useNavigate();
  const pendingToolCallsRef = useRef<any[]>([]);

  const handleNavigation = (page: string) => {
    let path = '';
    const pageLower = page.toLowerCase();

    // Map enum values from tool definition to routes
    if (pageLower === 'dashboard') path = '/dashboard';
    else if (pageLower === 'conversations') path = '/conversations';
    else if (pageLower === 'customers') path = '/customers';
    else if (pageLower === 'pipeline') path = '/pipeline';
    else if (pageLower === 'analytics') path = '/analytics';
    else if (pageLower === 'quoteinvoice') path = '/quote-invoice';
    else if (pageLower === 'employees') path = '/employees';
    
    if (path) {
      toast({
        title: "Navigating...",
        description: `Going to the ${page} page.`,
      });
      navigate(path);
    } else {
      toast({
        title: "Navigation Error",
        description: `Sorry, I can't navigate to "${page}".`,
        variant: "destructive",
      });
    }
  };

  const handleMessage = (event: any) => {
    console.log('Received message:', event);
    
    if (event.type === 'response.audio.delta') {
      onSpeakingChange(true);
    } else if (event.type === 'response.audio.done') {
      onSpeakingChange(false);
    } else if (event.type === 'conversation.item.create' && event.item?.type === 'tool_calls') {
      // Store tool calls to be executed when arguments are received
      pendingToolCallsRef.current = event.item.tool_calls;
    } else if (event.type === 'response.function_call_arguments.done') {
        const toolCall = pendingToolCallsRef.current.find(tc => tc.id === event.call_id);
        if (toolCall && toolCall.function.name === 'navigateTo') {
            try {
                const args = JSON.parse(event.arguments);
                handleNavigation(args.page);
                // Clear pending tool call after execution
                pendingToolCallsRef.current = pendingToolCallsRef.current.filter(tc => tc.id !== event.call_id);
            } catch (e) {
                console.error("Failed to parse tool call arguments:", e);
                toast({ title: "Error", description: "Could not execute AI command.", variant: "destructive" });
            }
        }
    }
  };

  const startConversation = async () => {
    try {
      chatRef.current = new RealtimeChat(handleMessage);
      await chatRef.current.init();
      setIsConnected(true);
      
      toast({
        title: "Connected",
        description: "Voice interface is ready. Start speaking!",
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to start conversation',
        variant: "destructive",
      });
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    setIsConnected(false);
    onSpeakingChange(false);
    pendingToolCallsRef.current = [];
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      {!isConnected ? (
        <Button 
          onClick={startConversation}
          className="bg-quikle-primary hover:bg-quikle-primary/90 text-white rounded-full h-14 w-14 shadow-lg"
        >
          Talk
        </Button>
      ) : (
        <Button 
          onClick={endConversation}
          variant="destructive"
          className="rounded-full h-14 w-14 shadow-lg"
        >
          End
        </Button>
      )}
    </div>
  );
};

export default VoiceInterface;
