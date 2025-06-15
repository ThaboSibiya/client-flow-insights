import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Copy, Eye, EyeOff, Plus, Trash2, Webhook, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  secret: string;
  isActive: boolean;
  events: string[];
  lastTriggered?: string;
  triggerCount: number;
}

const WebhookManager = () => {
  const { toast } = useToast();
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: [] as string[]
  });
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const availableEvents = [
    'customer.created', 'customer.updated', 'customer.deleted',
    'ticket.created', 'ticket.updated', 'ticket.resolved',
    'automation.triggered', 'conversation.started', 'message.received'
  ];

  const generateSecret = () => {
    return 'whsec_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const createWebhook = () => {
    if (!newWebhook.name || !newWebhook.url) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const webhook: WebhookEndpoint = {
      id: Date.now().toString(),
      name: newWebhook.name,
      url: newWebhook.url,
      secret: generateSecret(),
      isActive: true,
      events: newWebhook.events,
      triggerCount: 0
    };

    setWebhooks([...webhooks, webhook]);
    setNewWebhook({ name: '', url: '', events: [] });
    setIsCreating(false);
    
    toast({
      title: "Webhook Created",
      description: "New webhook endpoint has been created successfully"
    });
  };

  const toggleWebhook = (id: string) => {
    setWebhooks(webhooks.map(webhook => 
      webhook.id === id ? { ...webhook, isActive: !webhook.isActive } : webhook
    ));
  };

  const deleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter(webhook => webhook.id !== id));
    toast({
      title: "Webhook Deleted",
      description: "Webhook endpoint has been removed"
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard"
    });
  };

  const testWebhook = async (webhook: WebhookEndpoint) => {
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': webhook.secret
        },
        body: JSON.stringify({
          event: 'webhook.test',
          timestamp: new Date().toISOString(),
          data: { test: true }
        })
      });

      if (response.ok) {
        toast({
          title: "Test Successful",
          description: "Webhook endpoint responded successfully"
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to reach webhook endpoint",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Webhook Endpoints</h3>
          <p className="text-sm text-muted-foreground">
            Manage external integrations and webhook endpoints
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Webhook
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Webhook</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Webhook Name</Label>
                <Input
                  value={newWebhook.name}
                  onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                  placeholder="e.g., Zapier Integration"
                />
              </div>
              <div className="space-y-2">
                <Label>Endpoint URL</Label>
                <Input
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                  placeholder="https://your-endpoint.com/webhook"
                />
              </div>
              <div className="space-y-2">
                <Label>Events to Subscribe</Label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {availableEvents.map(event => (
                    <label key={event} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newWebhook.events.includes(event)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewWebhook({
                              ...newWebhook,
                              events: [...newWebhook.events, event]
                            });
                          } else {
                            setNewWebhook({
                              ...newWebhook,
                              events: newWebhook.events.filter(e => e !== event)
                            });
                          }
                        }}
                      />
                      <span className="text-sm">{event}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={createWebhook}>
                  Create Webhook
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {webhooks.map((webhook) => (
          <Card key={webhook.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Webhook className="h-5 w-5 text-blue-500" />
                  <div>
                    <CardTitle className="text-base">{webhook.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {webhook.triggerCount} triggers • Last: {webhook.lastTriggered ? 
                        new Date(webhook.lastTriggered).toLocaleDateString() : 'Never'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={webhook.isActive ? 'default' : 'secondary'}>
                    {webhook.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Switch
                    checked={webhook.isActive}
                    onCheckedChange={() => toggleWebhook(webhook.id)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Endpoint URL</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    value={webhook.url} 
                    readOnly 
                    className="font-mono text-xs"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(webhook.url)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Webhook Secret</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    value={showSecrets[webhook.id] ? webhook.secret : '••••••••••••••••'} 
                    readOnly 
                    className="font-mono text-xs"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowSecrets({
                      ...showSecrets,
                      [webhook.id]: !showSecrets[webhook.id]
                    })}
                  >
                    {showSecrets[webhook.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(webhook.secret)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Subscribed Events</Label>
                <div className="flex flex-wrap gap-1">
                  {webhook.events.map(event => (
                    <Badge key={event} variant="outline" className="text-xs">
                      {event}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => testWebhook(webhook)}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Test
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => deleteWebhook(webhook.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {webhooks.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Webhook className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Webhooks Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first webhook to integrate with external systems
            </p>
            <Button onClick={() => setIsCreating(true)}>
              Create Your First Webhook
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WebhookManager;
