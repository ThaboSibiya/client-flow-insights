
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ExternalLink, Play, Trash2 } from 'lucide-react';
import { ZapierConnection } from './types';

interface ZapierConnectionCardProps {
  connection: ZapierConnection;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onTest: (connection: ZapierConnection) => void;
}

const ZapierConnectionCard: React.FC<ZapierConnectionCardProps> = ({
  connection,
  onToggle,
  onDelete,
  onTest
}) => {
  const platformIcons = {
    zapier: '⚡',
    make: '🔄',
    n8n: '🔗'
  };

  return (
    <Card>
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
              onCheckedChange={() => onToggle(connection.id)}
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
              onClick={() => window.open(connection.webhookUrl, '_blank', 'noopener,noreferrer')}
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
            onClick={() => onTest(connection)}
          >
            <Play className="h-4 w-4 mr-1" />
            Test
          </Button>
          <Button 
            size="sm" 
            variant="destructive"
            onClick={() => onDelete(connection.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ZapierConnectionCard;
