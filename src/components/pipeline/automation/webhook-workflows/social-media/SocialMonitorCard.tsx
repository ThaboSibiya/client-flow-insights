
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MessageSquare, Trash2 } from 'lucide-react';
import { SocialMonitor } from './types';

interface SocialMonitorCardProps {
  monitor: SocialMonitor;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const SocialMonitorCard: React.FC<SocialMonitorCardProps> = ({
  monitor,
  onToggle,
  onDelete
}) => {
  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      case 'neutral': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle className="text-base">{monitor.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {monitor.mentionCount} mentions • Platform: {monitor.platform}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={monitor.isActive ? 'default' : 'secondary'}>
              {monitor.isActive ? 'Active' : 'Inactive'}
            </Badge>
            <Switch
              checked={monitor.isActive}
              onCheckedChange={() => onToggle(monitor.id)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-medium">Keywords</Label>
          <div className="flex flex-wrap gap-1">
            {monitor.keywords.map(keyword => (
              <Badge key={keyword} variant="outline" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-medium">Sentiment Filter</Label>
            <Badge className={`text-xs ${getSentimentBadge(monitor.sentiment)}`}>
              {monitor.sentiment}
            </Badge>
          </div>
          <div>
            <Label className="text-xs font-medium">Alert Threshold</Label>
            <p className="text-sm">{monitor.alertThreshold} mentions</p>
          </div>
        </div>

        {monitor.lastMention && (
          <p className="text-xs text-muted-foreground">
            Last mention: {new Date(monitor.lastMention).toLocaleString()}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button 
            size="sm" 
            variant="destructive"
            onClick={() => onDelete(monitor.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialMonitorCard;
