
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Clock, MessageCircle } from 'lucide-react';

interface SmartSuggestionsProps {
  lastMessage: string;
  conversationType: string;
  onSelectSuggestion: (suggestion: string) => void;
}

const SmartSuggestions = ({ lastMessage, conversationType, onSelectSuggestion }: SmartSuggestionsProps) => {
  const generateSuggestions = () => {
    const baseQuickReplies = [
      "Thank you for contacting us!",
      "I'll look into this right away.",
      "Could you provide more details?",
      "I'll escalate this to our technical team.",
      "We appreciate your patience.",
    ];

    const emailSuggestions = [
      "Thank you for your email. We'll respond within 24 hours.",
      "I've forwarded your request to the appropriate department.",
      "Please find the requested information attached.",
    ];

    const whatsappSuggestions = [
      "Hi! How can I help you today? 👋",
      "Thanks for reaching out! Let me check that for you.",
      "I understand your concern. Let me assist you.",
    ];

    const contextualSuggestions = [];

    // Context-based suggestions
    if (lastMessage.toLowerCase().includes('problem') || lastMessage.toLowerCase().includes('issue')) {
      contextualSuggestions.push(
        "I'm sorry to hear you're experiencing issues. Let me help resolve this.",
        "Can you describe the problem in more detail?",
        "When did this issue first occur?"
      );
    }

    if (lastMessage.toLowerCase().includes('thank')) {
      contextualSuggestions.push(
        "You're welcome! Is there anything else I can help with?",
        "Happy to help! Let me know if you need anything else.",
      );
    }

    if (lastMessage.toLowerCase().includes('urgent') || lastMessage.toLowerCase().includes('asap')) {
      contextualSuggestions.push(
        "I understand this is urgent. I'm prioritizing your request.",
        "Let me escalate this immediately for faster resolution.",
      );
    }

    // Combine suggestions based on conversation type
    let suggestions = [...baseQuickReplies];
    
    if (conversationType === 'email') {
      suggestions = [...emailSuggestions, ...contextualSuggestions];
    } else if (conversationType === 'whatsapp') {
      suggestions = [...whatsappSuggestions, ...contextualSuggestions];
    } else {
      suggestions = [...contextualSuggestions, ...baseQuickReplies];
    }

    return suggestions.slice(0, 4); // Limit to 4 suggestions
  };

  const suggestions = generateSuggestions();

  if (suggestions.length === 0) return null;

  return (
    <div className="p-3 border-t border-quikle-silver/30 bg-quikle-crystal/30">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="h-4 w-4 text-quikle-primary" />
        <span className="text-sm font-medium text-quikle-charcoal">Smart Suggestions</span>
        <Badge variant="outline" className="text-xs">
          AI-powered
        </Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="text-left justify-start text-xs h-auto p-2 hover:bg-quikle-crystal"
            onClick={() => onSelectSuggestion(suggestion)}
          >
            <MessageCircle className="h-3 w-3 mr-2 shrink-0" />
            <span className="truncate">{suggestion}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SmartSuggestions;
