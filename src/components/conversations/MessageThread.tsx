
import React from 'react';
import MessageThreadContainerOptimized from './MessageThreadContainerOptimized';

interface MessageThreadProps {
  conversationId: string;
  onBack?: () => void;
}

const MessageThread = ({ conversationId, onBack }: MessageThreadProps) => {
  return <MessageThreadContainerOptimized conversationId={conversationId} onBack={onBack} />;
};

export default MessageThread;
