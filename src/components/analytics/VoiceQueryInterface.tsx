
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceQuery {
  id: string;
  query: string;
  response: string;
  timestamp: string;
}

const VoiceQueryInterface = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [queries, setQueries] = useState<VoiceQuery[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        toast.success('Voice recognition started');
      };

      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentTranscript(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (currentTranscript.trim()) {
          processVoiceQuery(currentTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast.error('Voice recognition error: ' + event.error);
        setIsListening(false);
      };

      recognitionRef.current.start();
    } else {
      toast.error('Voice recognition not supported in this browser');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const processVoiceQuery = async (query: string) => {
    setIsProcessing(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock response based on query keywords
    let response = '';
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('customer') && lowerQuery.includes('count')) {
      response = 'You currently have 247 customers in your system, with 32 new customers added this month.';
    } else if (lowerQuery.includes('revenue') || lowerQuery.includes('sales')) {
      response = 'Your total revenue this month is R124,500, which is 12% higher than last month.';
    } else if (lowerQuery.includes('ticket') || lowerQuery.includes('support')) {
      response = 'You have 18 open support tickets with an average resolution time of 2.4 hours.';
    } else if (lowerQuery.includes('conversion')) {
      response = 'Your current conversion rate is 23%, which is above the industry average of 18%.';
    } else if (lowerQuery.includes('top') && lowerQuery.includes('perform')) {
      response = 'Your top performing region is Gauteng with 45% of total sales, followed by Western Cape at 28%.';
    } else {
      response = 'I found some relevant data for your query. Please check the analytics dashboard for detailed insights.';
    }

    const newQuery: VoiceQuery = {
      id: Date.now().toString(),
      query: query,
      response: response,
      timestamp: new Date().toISOString(),
    };

    setQueries(prev => [newQuery, ...prev]);
    setCurrentTranscript('');
    setIsProcessing(false);
    
    // Speak the response
    speakResponse(response);
    toast.success('Query processed successfully');
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const sampleQueries = [
    "How many customers do we have?",
    "What's our revenue this month?",
    "Show me ticket statistics",
    "What's our conversion rate?",
    "Which region is performing best?",
  ];

  return (
    <div className="space-y-6">
      {/* Voice Interface */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-purple-600" />
            Voice Analytics Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              size="lg"
              className={`w-24 h-24 rounded-full ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {isProcessing ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : isListening ? (
                <MicOff className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              {isProcessing 
                ? 'Processing your query...' 
                : isListening 
                  ? 'Listening... Click to stop'
                  : 'Click to start voice query'
              }
            </p>
          </div>

          {currentTranscript && (
            <div className="p-3 bg-white rounded-lg border border-purple-200">
              <p className="text-sm text-muted-foreground mb-1">Current transcript:</p>
              <p className="font-medium">{currentTranscript}</p>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {sampleQueries.map((query, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-purple-100"
                  onClick={() => processVoiceQuery(query)}
                >
                  "{query}"
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Query History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-blue-600" />
            Recent Voice Queries ({queries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {queries.map((query) => (
              <div key={query.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">"{query.query}"</p>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {formatTimestamp(query.timestamp)}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => speakResponse(query.response)}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 mt-2">
                  <p className="text-sm text-muted-foreground">{query.response}</p>
                </div>
              </div>
            ))}

            {queries.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No voice queries yet. Try asking a question using the voice interface above.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceQueryInterface;
