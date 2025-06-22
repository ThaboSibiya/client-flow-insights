
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Play, Plus, Trash2, Code, Key } from 'lucide-react';
import { toast } from 'sonner';

interface CustomApiTrigger {
  id: string;
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  isActive: boolean;
  authType: 'none' | 'bearer' | 'apikey' | 'basic';
  headers: Record<string, string>;
  samplePayload: string;
  triggerCount: number;
  lastTriggered?: string;
  description: string;
}

const CustomApiTriggers = () => {
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

  const [isCreating, setIsCreating] = useState(false);
  const [newTrigger, setNewTrigger] = useState({
    name: '',
    endpoint: '',
    method: 'POST' as 'GET' | 'POST' | 'PUT' | 'DELETE',
    authType: 'bearer' as 'none' | 'bearer' | 'apikey' | 'basic',
    description: '',
    samplePayload: ''
  });

  const generateEndpoint = () => {
    const randomId = Math.random().toString(36).substring(2, 8);
    return `/api/webhooks/${randomId}`;
  };

  const createTrigger = () => {
    if (!newTrigger.name || !newTrigger.endpoint) {
      toast.error("Please fill in required fields");
      return;
    }

    const trigger: CustomApiTrigger = {
      id: Date.now().toString(),
      ...newTrigger,
      isActive: true,
      headers: { 'Content-Type': 'application/json' },
      triggerCount: 0
    };

    setTriggers([...triggers, trigger]);
    setNewTrigger({
      name: '',
      endpoint: '',
      method: 'POST',
      authType: 'bearer',
      description: '',
      samplePayload: ''
    });
    setIsCreating(false);
    
    toast.success("New custom API trigger has been created");
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Custom API Triggers</h3>
          <p className="text-sm text-muted-foreground">
            Create specialized webhook endpoints for custom integrations
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create API Trigger
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create Custom API Trigger</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Trigger Name</Label>
                  <Input
                    value={newTrigger.name}
                    onChange={(e) => setNewTrigger({ ...newTrigger, name: e.target.value })}
                    placeholder="e.g., Order Completed"
                  />
                </div>
                <div className="space-y-2">
                  <Label>HTTP Method</Label>
                  <Select 
                    value={newTrigger.method} 
                    onValueChange={(value) => 
                      setNewTrigger({ ...newTrigger, method: value as 'GET' | 'POST' | 'PUT' | 'DELETE' })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>API Endpoint</Label>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setNewTrigger({ ...newTrigger, endpoint: generateEndpoint() })}
                  >
                    Generate
                  </Button>
                </div>
                <Input
                  value={newTrigger.endpoint}
                  onChange={(e) => setNewTrigger({ ...newTrigger, endpoint: e.target.value })}
                  placeholder="/api/webhooks/your-endpoint"
                />
              </div>

              <div className="space-y-2">
                <Label>Authentication Type</Label>
                <Select 
                  value={newTrigger.authType} 
                  onValueChange={(value) => 
                    setNewTrigger({ ...newTrigger, authType: value as 'none' | 'bearer' | 'apikey' | 'basic' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Authentication</SelectItem>
                    <SelectItem value="bearer">Bearer Token</SelectItem>
                    <SelectItem value="apikey">API Key</SelectItem>
                    <SelectItem value="basic">Basic Auth</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newTrigger.description}
                  onChange={(e) => setNewTrigger({ ...newTrigger, description: e.target.value })}
                  placeholder="Describe when this trigger should be used..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Sample Payload (JSON)</Label>
                <Textarea
                  value={newTrigger.samplePayload}
                  onChange={(e) => setNewTrigger({ ...newTrigger, samplePayload: e.target.value })}
                  placeholder='{"key": "value", "timestamp": "2024-01-22T10:30:00Z"}'
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={createTrigger}>
                  Create Trigger
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {triggers.map((trigger) => (
          <Card key={trigger.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Code className="h-5 w-5 text-purple-600" />
                  <div>
                    <CardTitle className="text-base">{trigger.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {trigger.triggerCount} calls • Method: {trigger.method}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {trigger.authType}
                  </Badge>
                  <Badge variant={trigger.isActive ? 'default' : 'secondary'}>
                    {trigger.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Switch
                    checked={trigger.isActive}
                    onCheckedChange={() => toggleTrigger(trigger.id)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium">API Endpoint</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {trigger.method}
                  </Badge>
                  <Input 
                    value={`${window.location.origin}${trigger.endpoint}`}
                    readOnly 
                    className="font-mono text-xs"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyEndpoint(trigger.endpoint)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {trigger.description && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground">{trigger.description}</p>
                </div>
              )}

              {trigger.samplePayload && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Sample Payload</Label>
                  <pre className="text-xs bg-gray-50 p-2 rounded border overflow-x-auto">
                    {trigger.samplePayload}
                  </pre>
                </div>
              )}

              {trigger.lastTriggered && (
                <p className="text-xs text-muted-foreground">
                  Last triggered: {new Date(trigger.lastTriggered).toLocaleString()}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => testTrigger(trigger)}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Test
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => deleteTrigger(trigger.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {triggers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Code className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Custom Triggers</h3>
            <p className="text-muted-foreground mb-4">
              Create your first custom API trigger for specialized integrations
            </p>
            <Button onClick={() => setIsCreating(true)}>
              Create Your First Trigger
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomApiTriggers;
