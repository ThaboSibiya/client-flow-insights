
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
import { MessageSquare, Plus, Trash2, TrendingUp, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface SocialMonitor {
  id: string;
  name: string;
  platform: string;
  keywords: string[];
  sentiment: 'positive' | 'negative' | 'neutral' | 'all';
  isActive: boolean;
  mentionCount: number;
  lastMention?: string;
  webhookUrl?: string;
  alertThreshold: number;
}

interface Mention {
  id: string;
  platform: string;
  author: string;
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  timestamp: string;
  url: string;
  engagement: number;
}

const SocialMediaMonitoring = () => {
  const [monitors, setMonitors] = useState<SocialMonitor[]>([
    {
      id: '1',
      name: 'Brand Mentions',
      platform: 'twitter',
      keywords: ['Quikle', '@quikle', 'quikle.com'],
      sentiment: 'all',
      isActive: true,
      mentionCount: 23,
      lastMention: '2024-01-22T10:30:00Z',
      webhookUrl: 'https://hooks.zapier.com/hooks/catch/brand-mentions/',
      alertThreshold: 10
    },
    {
      id: '2',
      name: 'Competitor Analysis',
      platform: 'linkedin',
      keywords: ['competitors', 'CRM software', 'customer management'],
      sentiment: 'positive',
      isActive: true,
      mentionCount: 8,
      lastMention: '2024-01-21T15:45:00Z',
      alertThreshold: 5
    }
  ]);

  const [recentMentions] = useState<Mention[]>([
    {
      id: '1',
      platform: 'twitter',
      author: '@customer_success',
      content: 'Just started using Quikle for our customer management. The automation features are amazing!',
      sentiment: 'positive',
      timestamp: '2024-01-22T10:30:00Z',
      url: 'https://twitter.com/customer_success/status/123456',
      engagement: 15
    },
    {
      id: '2',
      platform: 'linkedin',
      author: 'Sarah Johnson',
      content: 'Looking for alternatives to our current CRM. Has anyone tried Quikle?',
      sentiment: 'neutral',
      timestamp: '2024-01-22T09:15:00Z',
      url: 'https://linkedin.com/posts/sarah-johnson-456789',
      engagement: 8
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [newMonitor, setNewMonitor] = useState({
    name: '',
    platform: 'twitter',
    keywords: [] as string[],
    sentiment: 'all' as const,
    webhookUrl: '',
    alertThreshold: 5
  });

  const platforms = [
    { value: 'twitter', label: 'Twitter', icon: '🐦' },
    { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
    { value: 'facebook', label: 'Facebook', icon: '📘' },
    { value: 'instagram', label: 'Instagram', icon: '📸' },
    { value: 'reddit', label: 'Reddit', icon: '🤖' },
    { value: 'youtube', label: 'YouTube', icon: '📹' }
  ];

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-blue-600';
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      case 'neutral': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const createMonitor = () => {
    if (!newMonitor.name || newMonitor.keywords.length === 0) {
      toast({
        title: "Error",
        description: "Please provide monitor name and keywords",
        variant: "destructive"
      });
      return;
    }

    const monitor: SocialMonitor = {
      id: Date.now().toString(),
      ...newMonitor,
      isActive: true,
      mentionCount: 0
    };

    setMonitors([...monitors, monitor]);
    setNewMonitor({
      name: '',
      platform: 'twitter',
      keywords: [],
      sentiment: 'all',
      webhookUrl: '',
      alertThreshold: 5
    });
    setIsCreating(false);
    
    toast({
      title: "Monitor Created",
      description: "Social media monitor has been created successfully"
    });
  };

  const toggleMonitor = (id: string) => {
    setMonitors(monitors.map(monitor => 
      monitor.id === id ? { ...monitor, isActive: !monitor.isActive } : monitor
    ));
  };

  const deleteMonitor = (id: string) => {
    setMonitors(monitors.filter(monitor => monitor.id !== id));
    toast({
      title: "Monitor Deleted",
      description: "Social media monitor has been removed"
    });
  };

  const addKeyword = (keyword: string) => {
    if (keyword && !newMonitor.keywords.includes(keyword)) {
      setNewMonitor({
        ...newMonitor,
        keywords: [...newMonitor.keywords, keyword]
      });
    }
  };

  const removeKeyword = (keyword: string) => {
    setNewMonitor({
      ...newMonitor,
      keywords: newMonitor.keywords.filter(k => k !== keyword)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Social Media Monitoring</h3>
          <p className="text-sm text-muted-foreground">
            Track brand mentions and engagement across social platforms
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Monitor
            </Button>
          </DialogTrigger>
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
                    onChange={(e) => setNewMonitor({ ...newMonitor, name: e.target.value })}
                    placeholder="e.g., Brand Mentions"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select 
                    value={newMonitor.platform} 
                    onValueChange={(value) => setNewMonitor({ ...newMonitor, platform: value })}
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
                    onValueChange={(value: 'positive' | 'negative' | 'neutral' | 'all') => 
                      setNewMonitor({ ...newMonitor, sentiment: value })
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
                    onChange={(e) => setNewMonitor({ 
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
                  onChange={(e) => setNewMonitor({ ...newMonitor, webhookUrl: e.target.value })}
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={createMonitor}>
                  Create Monitor
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-semibold">Active Monitors</h4>
          {monitors.map((monitor) => (
            <Card key={monitor.id}>
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
                      onCheckedChange={() => toggleMonitor(monitor.id)}
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
                    onClick={() => deleteMonitor(monitor.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Recent Mentions</h4>
            <Badge variant="outline">{recentMentions.length} new</Badge>
          </div>
          
          {recentMentions.map((mention) => (
            <Card key={mention.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {platforms.find(p => p.value === mention.platform)?.icon}
                      </span>
                      <span className="font-medium text-sm">{mention.author}</span>
                      <Badge className={`text-xs ${getSentimentBadge(mention.sentiment)}`}>
                        {mention.sentiment}
                      </Badge>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(mention.url, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {mention.content}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(mention.timestamp).toLocaleString()}</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {mention.engagement} engagement
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {monitors.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Social Monitors</h3>
            <p className="text-muted-foreground mb-4">
              Create your first social media monitor to track brand mentions
            </p>
            <Button onClick={() => setIsCreating(true)}>
              Create Your First Monitor
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SocialMediaMonitoring;
