
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from 'lucide-react';

interface TypingIndicatorProps {
  typingUsers: Array<{ user_name: string }>;
}

const TypingIndicator = ({ typingUsers }: TypingIndicatorProps) => {
  if (typingUsers.length === 0) return null;

  return (
    <div className="flex gap-3 justify-start">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-blue-100 text-blue-600">
          <User className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <Card className="bg-gray-100">
        <CardContent className="p-3">
          <div className="text-sm text-gray-600">
            {typingUsers.map(u => u.user_name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
          <div className="flex space-x-1 mt-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TypingIndicator;
