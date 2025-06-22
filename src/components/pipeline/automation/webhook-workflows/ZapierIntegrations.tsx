
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
import { Zap, ExternalLink, Play, Trash2, Plus, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface ZapierConnection {
  id: string;
  name: string;
  platform: 'zapier' | 'make' | 'n8n';
  webhookUrl: string;
  isActive: boolean;
  triggerCount: number;
  lastTriggered?: string;
  apps: string[];
}

const ZapierIntegrations = () => {
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

  const [isCreating, setIsCreating] = useState(false);
  const [newConnection, setNewConnection] = useState({
    name: '',
    platform: 'zapier' as const,
    webhookUrl: '',
    apps: [] as string[]
  });

  const platformIcons = {
    zapier: '⚡',
    make: '🔄',
    n8n: '🔗'
  };

  const popularApps = [
    'Slack', 'Gmail', 'Google Sheets', 'Salesforce', 'HubSpot', 'Trello',
    'Asana', 'Monday.com', 'Mailchimp', 'Shopify', 'WordPress', 'Dropbox'
  ];

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

      toast({
        title: "Test Sent",
        description: "Test webhook sent successfully. Check your automation platform."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test webhook",
        variant: "destructive"
      });
    }
  };

  const createConnection = () => {
    if (!newConnection.name || !newConnection.webhookUrl) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const connection: ZapierConnection = {
      id: Date.now().toString(),
      ...newConnection,
      isActive: true,
      triggerCount: 0
    };

    setConnections([...connections, connection]);
    setNewConnection({ name: '', platform: 'zapier', webhookUrl: '', apps: [] });
    setIsCreating(false);
    
    toast({
      title: "Integration Created",
      description: "New webhook integration has been created successfully"
    });
  };

  const toggleConnection = (id: string) => {
    setConnections(connections.map(conn => 
      conn.id === id ? { ...conn, isActive: !conn.isActive } : conn
    ));
  };

  const deleteConnection = (id: string) => {
    setConnections(connections.filter(conn => conn.id !== id));
    toast({
      title: "Integration Deleted",
      description: "Webhook integration has been removed"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Zapier, Make & N8N Integrations</h3>
          <p className="text-sm text-muted-foreground">
            Connect with 1000+ apps using popular automation platforms
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Integration</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Integration Name</Label>
                  <Input
                    value={newConnection.name}
                    onChange={(e) => setNewConnection({ ...newConnection, name: e.target.value })}
                    placeholder="e.g., Customer to Slack"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select 
                    value={newConnection.platform} 
                    onValueChange={(value: 'zapier' | 'make' | 'n8n') => 
                      setNewConnection({ ...newConnection, platform: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zapier">⚡ Zapier</SelectItem>
                      <SelectItem value="make">🔄 Make (Integromat)</SelectItem>
                      <SelectItem value="n8n">🔗 n8n</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <Input
                  value={newConnection.webhookUrl}
                  onChange={(e) => setNewConnection({ ...newConnection, webhookUrl: e.target.value })}
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                />
              </div>

              <div className="space-y-2">
                <Label>Connected Apps (Optional)</Label>
                <div className="grid grid-cols-3 gap-2">
                  {popularApps.map(app => (
                    <label key={app} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newConnection.apps.includes(app)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewConnection({
                              ...newConnection,
                              apps: [...newConnection.apps, app]
                            });
                          } else {
                            setNewConnection({
                              ...newConnection,
                              apps: newConnection.apps.filter(a => a !== app)
                            });
                          }
                        }}
                      />
                      <span className="text-sm">{app}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={createConnection}>
                  Create Integration
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {connections.map((connection) => (
          <Card key={connection.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{platformIcons[connection.platform]}</span>
                  <div>
                    <CardTitle className="text-base">{connection.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {connection.triggerCount} triggers • Platform: {connection.platform}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={connection.isActive ? 'default' : 'secondary'}>
                    {connection.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Switch
                    checked={connection.isActive}
                    onCheckedChange={() => toggleConnection(connection.id)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Webhook URL</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    value={connection.webhookUrl} 
                    readOnly 
                    className="font-mono text-xs"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(connection.webhookUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {connection.apps.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Connected Apps</Label>
                  <div className="flex flex-wrap gap-1">
                    {connection.apps.map(app => (
                      <Badge key={app} variant="outline" className="text-xs">
                        {app}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {connection.lastTriggered && (
                <p className="text-xs text-muted-foreground">
                  Last triggered: {new Date(connection.lastTriggered).toLocaleString()}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => testWebhook(connection)}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Test
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => deleteConnection(connection.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {connections.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Integrations Yet</h3>
            <p className="text-muted-foreground mb-4">
              Connect your first automation platform to start building workflows
            </p>
            <Button onClick={() => setIsCreating(true)}>
              Create Your First Integration
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ZapierIntegrations;
