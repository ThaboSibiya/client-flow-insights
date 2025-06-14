
import React from 'react';
import MessageThreadContainer from './MessageThreadContainer';

interface MessageThreadProps {
  conversationId: string;
}

const MessageThread = ({ conversationId }: MessageThreadProps) => {
  return <MessageThreadContainer conversationId={conversationId} />;
};

export default MessageThread;
