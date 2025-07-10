
import React from 'react';
import MessageThreadContainerOptimized from './MessageThreadContainerOptimized';

interface MessageThreadProps {
  conversationId: string;
}

const MessageThread = ({ conversationId }: MessageThreadProps) => {
  return <MessageThreadContainerOptimized conversationId={conversationId} />;
};

export default MessageThread;
