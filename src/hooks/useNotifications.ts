
import { useCallback } from 'react';

interface NotificationData {
  conversationId: string;
  messageId: string;
  senderName: string;
  content: string;
  type: string;
  recipientId: string;
}

export const useNotifications = () => {
  const sendMessageNotification = useCallback((data: NotificationData) => {
    // Simple notification implementation
    console.log('New message notification:', data);
  }, []);

  return {
    sendMessageNotification,
  };
};
