
import { useState } from 'react';
import { toast } from 'sonner';
import { CustomApiTrigger, NewCustomApiTrigger } from './types';

export const useCustomApiTriggers = () => {
  const [triggers, setTriggers] = useState<CustomApiTrigger[]>([
    {
      id: '1',
      name: 'Customer Status Update',
      endpoint: '/api/webhooks/customer-status',
      method: 'POST',
      isActive: true,
      authType: 'bearer',
      headers: { 'Content-Type': 'application/json' },
      samplePayload: JSON.stringify({
        customer_id: "12345",
        status: "active",
        timestamp: "2024-01-22T10:30:00Z"
      }, null, 2),
      triggerCount: 234,
      lastTriggered: '2024-01-22T10:30:00Z',
      description: 'Triggered when customer status changes'
    },
    {
      id: '2',
      name: 'New Lead Notification',
      endpoint: '/api/webhooks/new-lead',
      method: 'POST',
      isActive: true,
      authType: 'apikey',
      headers: { 'Content-Type': 'application/json' },
      samplePayload: JSON.stringify({
        lead_source: "website",
        contact_info: {
          name: "John Doe",
          email: "john@example.com"
        }
      }, null, 2),
      triggerCount: 89,
      lastTriggered: '2024-01-21T15:45:00Z',
      description: 'Triggered when new lead is captured'
    }
  ]);

  const generateEndpoint = () => {
    const randomId = Math.random().toString(36).substring(2, 8);
    return `/api/webhooks/${randomId}`;
  };

  const createTrigger = (newTrigger: NewCustomApiTrigger) => {
    if (!newTrigger.name || !newTrigger.endpoint) {
      toast.error("Please fill in required fields");
      return false;
    }

    const trigger: CustomApiTrigger = {
      id: Date.now().toString(),
      ...newTrigger,
      isActive: true,
      headers: { 'Content-Type': 'application/json' },
      triggerCount: 0
    };

    setTriggers([...triggers, trigger]);
    toast.success("New custom API trigger has been created");
    return true;
  };

  const toggleTrigger = (id: string) => {
    setTriggers(triggers.map(trigger => 
      trigger.id === id ? { ...trigger, isActive: !trigger.isActive } : trigger
    ));
  };

  const deleteTrigger = (id: string) => {
    setTriggers(triggers.filter(trigger => trigger.id !== id));
    toast.success("Custom API trigger has been removed");
  };

  const copyEndpoint = (endpoint: string) => {
    const fullUrl = `${window.location.origin}${endpoint}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("API endpoint copied to clipboard");
  };

  const testTrigger = async (trigger: CustomApiTrigger) => {
    const fullUrl = `${window.location.origin}${trigger.endpoint}`;
    
    try {
      const response = await fetch(fullUrl, {
        method: trigger.method,
        headers: trigger.headers,
        body: trigger.method !== 'GET' ? trigger.samplePayload : undefined
      });

      if (response.ok) {
        setTriggers(triggers.map(t => 
          t.id === trigger.id ? { 
            ...t, 
            triggerCount: t.triggerCount + 1,
            lastTriggered: new Date().toISOString()
          } : t
        ));
        
        toast.success("API trigger test completed successfully");
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      toast.error("Failed to test API trigger");
    }
  };

  return {
    triggers,
    generateEndpoint,
    createTrigger,
    toggleTrigger,
    deleteTrigger,
    copyEndpoint,
    testTrigger
  };
};
