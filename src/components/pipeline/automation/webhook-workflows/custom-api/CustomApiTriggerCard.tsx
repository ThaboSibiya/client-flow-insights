
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Copy, Play, Trash2, Code } from 'lucide-react';
import { CustomApiTrigger } from './types';

interface CustomApiTriggerCardProps {
  trigger: CustomApiTrigger;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onTest: (trigger: CustomApiTrigger) => void;
  onCopyEndpoint: (endpoint: string) => void;
}

const CustomApiTriggerCard: React.FC<CustomApiTriggerCardProps> = ({
  trigger,
  onToggle,
  onDelete,
  onTest,
  onCopyEndpoint
}) => {
  return (
    <Card>
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
              onCheckedChange={() => onToggle(trigger.id)}
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
              onClick={() => onCopyEndpoint(trigger.endpoint)}
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
            onClick={() => onTest(trigger)}
          >
            <Play className="h-4 w-4 mr-1" />
            Test
          </Button>
          <Button 
            size="sm" 
            variant="destructive"
            onClick={() => onDelete(trigger.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomApiTriggerCard;
