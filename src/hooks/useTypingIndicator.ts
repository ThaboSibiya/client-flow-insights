
import { useState, useEffect } from 'react';

export const useTypingIndicator = (conversationId: string) => {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  return {
    typingUsers,
  };
};
