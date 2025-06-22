
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NewSocialMonitor, Platform } from './types';

interface SocialMonitorFormProps {
  isOpen: boolean;
  onClose: () => void;
  newMonitor: NewSocialMonitor;
  onMonitorChange: (monitor: NewSocialMonitor) => void;
  onCreate: () => void;
  platforms: Platform[];
}

const SocialMonitorForm: React.FC<SocialMonitorFormProps> = ({
  isOpen,
  onClose,
  newMonitor,
  onMonitorChange,
  onCreate,
  platforms
}) => {
  const addKeyword = (keyword: string) => {
    if (keyword && !newMonitor.keywords.includes(keyword)) {
      onMonitorChange({
        ...newMonitor,
        keywords: [...newMonitor.keywords, keyword]
      });
    }
  };

  const removeKeyword = (keyword: string) => {
    onMonitorChange({
      ...newMonitor,
      keywords: newMonitor.keywords.filter(k => k !== keyword)
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Social Media Monitor</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Monitor Name</Label>
              <Input
                value={newMonitor.name}
                onChange={(e) => onMonitorChange({ ...newMonitor, name: e.target.value })}
                placeholder="e.g., Brand Mentions"
              />
            </div>
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select 
                value={newMonitor.platform} 
                onValueChange={(value) => onMonitorChange({ ...newMonitor, platform: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map(platform => (
                    <SelectItem key={platform.value} value={platform.value}>
                      <span className="flex items-center gap-2">
                        <span>{platform.icon}</span>
                        {platform.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Keywords to Monitor</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {newMonitor.keywords.map(keyword => (
                <Badge 
                  key={keyword} 
                  variant="secondary" 
                  className="cursor-pointer"
                  onClick={() => removeKeyword(keyword)}
                >
                  {keyword} ×
                </Badge>
              ))}
            </div>
            <Input
              placeholder="Add keyword and press Enter"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addKeyword(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sentiment Filter</Label>
              <Select 
                value={newMonitor.sentiment} 
                onValueChange={(value) => 
                  onMonitorChange({ ...newMonitor, sentiment: value as 'positive' | 'negative' | 'neutral' | 'all' })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sentiments</SelectItem>
                  <SelectItem value="positive">Positive Only</SelectItem>
                  <SelectItem value="negative">Negative Only</SelectItem>
                  <SelectItem value="neutral">Neutral Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Alert Threshold</Label>
              <Input
                type="number"
                value={newMonitor.alertThreshold}
                onChange={(e) => onMonitorChange({ 
                  ...newMonitor, 
                  alertThreshold: parseInt(e.target.value) || 5 
                })}
                placeholder="5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Webhook URL (Optional)</Label>
            <Input
              value={newMonitor.webhookUrl}
              onChange={(e) => onMonitorChange({ ...newMonitor, webhookUrl: e.target.value })}
              placeholder="https://hooks.zapier.com/hooks/catch/..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onCreate}>
              Create Monitor
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SocialMonitorForm;
