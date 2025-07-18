
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// NOTE: The RealtimeChat and AudioRecorder classes were moved here from a read-only file
// to fix a bug with the OpenAI model configuration.

class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(private onAudioData: (audioData: Float32Array) => void) {}

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      this.audioContext = new AudioContext({ sampleRate: 24000 });
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        this.onAudioData(new Float32Array(inputData));
      };
      
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  stop() {
    if (this.source) this.source.disconnect();
    if (this.processor) this.processor.disconnect();
    if (this.stream) this.stream.getTracks().forEach(track => track.stop());
    if (this.audioContext) this.audioContext.close();
  }
}

class RealtimeChat {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private audioEl: HTMLAudioElement;
  private recorder: AudioRecorder | null = null;

  constructor(private onMessage: (message: any) => void) {
    this.audioEl = document.createElement("audio");
    this.audioEl.autoplay = true;
    document.body.appendChild(this.audioEl);
  }

  private encodeAudioData(float32Array: Float32Array): string {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
        const s = Math.max(-1, Math.min(1, float32Array[i]));
        int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    const uint8Array = new Uint8Array(int16Array.buffer);
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    return btoa(binary);
  }

  async init() {
    try {
      const { data: tokenData, error: tokenError } = await supabase.functions.invoke("openai-session");
      if (tokenError || !tokenData?.client_secret?.value) {
        throw new Error(`Failed to get ephemeral token: ${tokenError?.message || 'No client secret'}`);
      }

      const EPHEMERAL_KEY = tokenData.client_secret.value;

      this.pc = new RTCPeerConnection();
      this.pc.ontrack = e => this.audioEl.srcObject = e.streams[0];

      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.pc.addTrack(ms.getTracks()[0]);

      this.dc = this.pc.createDataChannel("oai-events");
      this.dc.addEventListener("message", (e) => {
        try {
          const event = JSON.parse(e.data);
          this.onMessage(event);
        } catch (error) {
          console.error("Failed to parse message from data channel", error);
        }
      });

      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o";
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp"
        },
      });

      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text();
        throw new Error(`Failed to get SDP from OpenAI: ${sdpResponse.status} ${errorText}`);
      }
      
      const answer = {
        type: "answer" as RTCSdpType,
        sdp: await sdpResponse.text(),
      };
      
      await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
      console.log("WebRTC connection established");

      this.recorder = new AudioRecorder((audioData) => {
        if (this.dc?.readyState === 'open') {
          this.dc.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: this.encodeAudioData(audioData)
          }));
        }
      });
      await this.recorder.start();

    } catch (error) {
      console.error("Error initializing chat:", error);
      this.disconnect();
      throw error;
    }
  }

  disconnect() {
    this.recorder?.stop();
    this.dc?.close();
    this.pc?.close();
    if (this.audioEl.parentNode) {
      this.audioEl.parentNode.removeChild(this.audioEl);
    }
  }
}


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

  const handleMakeCall = async (phoneNumber: string, customerId?: string) => {
    toast({
        title: "Initiating Call...",
        description: `Placing a call to ${phoneNumber}.`,
    });
    
    console.log(`Requesting call to ${phoneNumber} for customer ${customerId}`);

    const { error } = await supabase.functions.invoke('make-call', {
        body: { phoneNumber, customerId }
    });

    if (error) {
        toast({ title: "Call Failed", description: error.message, variant: "destructive" });
    } else {
        toast({ title: "Call Initiated", description: `Call to ${phoneNumber} is being placed.` });
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
        if (toolCall) {
            if (toolCall.function.name === 'navigateTo') {
                try {
                    const args = JSON.parse(event.arguments);
                    handleNavigation(args.page);
                    // Clear pending tool call after execution
                    pendingToolCallsRef.current = pendingToolCallsRef.current.filter(tc => tc.id !== event.call_id);
                } catch (e) {
                    console.error("Failed to parse tool call arguments:", e);
                    toast({ title: "Error", description: "Could not execute AI command.", variant: "destructive" });
                }
            } else if (toolCall.function.name === 'makeCall') {
                 try {
                    const args = JSON.parse(event.arguments);
                    handleMakeCall(args.phoneNumber, args.customerId);
                    // Clear pending tool call after execution
                    pendingToolCallsRef.current = pendingToolCallsRef.current.filter(tc => tc.id !== event.call_id);
                } catch (e) {
                    console.error("Failed to parse tool call arguments:", e);
                    toast({ title: "Error", description: "Could not execute AI command.", variant: "destructive" });
                }
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
