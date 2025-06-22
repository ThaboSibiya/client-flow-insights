
import { useState } from 'react';
import { toast } from 'sonner';
import { ZapierConnection, NewZapierConnection } from './types';

export const useZapierConnections = () => {
  const [connections, setConnections] = useState<ZapierConnection[]>([
    {
      id: '1',
      name: 'Customer to Slack Notification',
      platform: 'zapier',
      webhookUrl: 'https://hooks.zapier.com/hooks/catch/12345/abcdef/',
      isActive: true,
      triggerCount: 156,
      lastTriggered: '2024-01-22T10:30:00Z',
      apps: ['Slack', 'Gmail', 'Google Sheets']
    },
    {
      id: '2',
      name: 'Quote to CRM Sync',
      platform: 'make',
      webhookUrl: 'https://hook.us1.make.com/webhook/abc123',
      isActive: true,
      triggerCount: 89,
      lastTriggered: '2024-01-21T15:45:00Z',
      apps: ['Salesforce', 'HubSpot']
    }
  ]);

  const testWebhook = async (connection: ZapierConnection) => {
    try {
      const response = await fetch(connection.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          source: 'quikle_test',
          data: {
            customer_name: 'Test Customer',
            message: 'This is a test webhook trigger'
          }
        })
      });

      toast.success("Test webhook sent successfully. Check your automation platform.");
    } catch (error) {
      toast.error("Failed to send test webhook");
    }
  };

  const createConnection = (newConnection: NewZapierConnection) => {
    if (!newConnection.name || !newConnection.webhookUrl) {
      toast.error("Please fill in all required fields");
      return false;
    }

    const connection: ZapierConnection = {
      id: Date.now().toString(),
      ...newConnection,
      isActive: true,
      triggerCount: 0
    };

    setConnections([...connections, connection]);
    toast.success("New webhook integration has been created successfully");
    return true;
  };

  const toggleConnection = (id: string) => {
    setConnections(connections.map(conn => 
      conn.id === id ? { ...conn, isActive: !conn.isActive } : conn
    ));
  };

  const deleteConnection = (id: string) => {
    setConnections(connections.filter(conn => conn.id !== id));
    toast.success("Webhook integration has been removed");
  };

  return {
    connections,
    testWebhook,
    createConnection,
    toggleConnection,
    deleteConnection
  };
};
