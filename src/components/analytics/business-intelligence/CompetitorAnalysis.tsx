
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Plus, ExternalLink, AlertTriangle, TrendingUp, DollarSign, Star } from 'lucide-react';
import { toast } from 'sonner';
import { CompetitorAlert, BusinessIntelligenceSettings } from './types';

interface CompetitorAnalysisProps {
  settings: BusinessIntelligenceSettings['competitorTracking'];
  onUpdateSettings: (settings: BusinessIntelligenceSettings['competitorTracking']) => void;
}

const CompetitorAnalysis = ({ settings, onUpdateSettings }: CompetitorAnalysisProps) => {
  const [alerts, setAlerts] = useState<CompetitorAlert[]>([
    {
      id: '1',
      competitor: 'TechCorp Solutions',
      alertType: 'pricing',
      title: 'Price reduction detected',
      description: 'TechCorp has reduced their premium plan pricing by 15%',
      source: 'Pricing API Monitor',
      impact: 'high',
      actionRequired: true,
      detectedAt: '2024-01-21T09:15:00Z',
      url: 'https://techcorp.com/pricing',
      data: { oldPrice: 99, newPrice: 84, change: -15 },
    },
    {
      id: '2',
      competitor: 'InnovateLabs',
      alertType: 'feature',
      title: 'New AI feature launched',
      description: 'InnovateLabs has released an AI-powered analytics dashboard',
      source: 'Product Hunt Monitor',
      impact: 'medium',
      actionRequired: true,
      detectedAt: '2024-01-20T14:30:00Z',
      url: 'https://innovatelabs.com/ai-dashboard',
    },
    {
      id: '3',
      competitor: 'MarketLeader Inc',
      alertType: 'review',
      title: 'Review score improvement',
      description: 'MarketLeader\'s average rating increased to 4.8/5',
      source: 'Review Aggregator',
      impact: 'medium',
      actionRequired: false,
      detectedAt: '2024-01-19T11:45:00Z',
      data: { oldRating: 4.5, newRating: 4.8, reviewCount: 1250 },
    },
  ]);

  const [newCompetitor, setNewCompetitor] = useState('');

  const updateSettings = (updates: Partial<BusinessIntelligenceSettings['competitorTracking']>) => {
    onUpdateSettings({ ...settings, ...updates });
  };

  const addCompetitor = () => {
    if (!newCompetitor.trim()) {
      toast.error('Please enter a competitor name');
      return;
    }

    const updatedCompetitors = [...settings.competitors, newCompetitor.trim()];
    updateSettings({ competitors: updatedCompetitors });
    setNewCompetitor('');
    toast.success(`Added ${newCompetitor} to competitor tracking`);
  };

  const removeCompetitor = (competitor: string) => {
    const updatedCompetitors = settings.competitors.filter(c => c !== competitor);
    updateSettings({ competitors: updatedCompetitors });
    toast.success(`Removed ${competitor} from tracking`);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'pricing': return <DollarSign className="h-4 w-4" />;
      case 'feature': return <TrendingUp className="h-4 w-4" />;
      case 'review': return <Star className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const markAsActionTaken = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, actionRequired: false } : alert
      )
    );
    toast.success('Alert marked as actioned');
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-purple-600" />
            Competitor Tracking Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="tracking-enabled">Enable Competitor Tracking</Label>
            <Switch
              id="tracking-enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) => updateSettings({ enabled: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label>Alert Frequency</Label>
            <Select value={settings.alertFrequency} onValueChange={(value: any) => updateSettings({ alertFrequency: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="daily">Daily Summary</SelectItem>
                <SelectItem value="weekly">Weekly Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Tracked Competitors</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter competitor name"
                value={newCompetitor}
                onChange={(e) => setNewCompetitor(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCompetitor()}
              />
              <Button onClick={addCompetitor}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {settings.competitors.map((competitor) => (
                <Badge
                  key={competitor}
                  variant="secondary"
                  className="cursor-pointer hover:bg-red-100 hover:text-red-800"
                  onClick={() => removeCompetitor(competitor)}
                >
                  {competitor} ×
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Recent Competitor Alerts ({alerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getAlertIcon(alert.alertType)}
                    <div>
                      <h4 className="font-medium">{alert.competitor}</h4>
                      <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={getImpactColor(alert.impact)}>
                      {alert.impact.toUpperCase()} Impact
                    </Badge>
                    {alert.actionRequired && (
                      <Badge variant="destructive">Action Required</Badge>
                    )}
                  </div>
                </div>

                {alert.data && (
                  <div className="mb-3 p-3 bg-gray-50 rounded text-sm">
                    {alert.alertType === 'pricing' && (
                      <div className="flex gap-4">
                        <span>Old Price: ${alert.data.oldPrice}</span>
                        <span>New Price: ${alert.data.newPrice}</span>
                        <span className="text-red-600">Change: {alert.data.change}%</span>
                      </div>
                    )}
                    {alert.alertType === 'review' && (
                      <div className="flex gap-4">
                        <span>Previous: {alert.data.oldRating}/5</span>
                        <span>Current: {alert.data.newRating}/5</span>
                        <span>Reviews: {alert.data.reviewCount}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Source: {alert.source}</span>
                    <span>Detected: {new Date(alert.detectedAt).toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2">
                    {alert.url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={alert.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {alert.actionRequired && (
                      <Button size="sm" onClick={() => markAsActionTaken(alert.id)}>
                        Mark Actioned
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {alerts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No competitor alerts yet. Enable tracking to start monitoring.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompetitorAnalysis;
