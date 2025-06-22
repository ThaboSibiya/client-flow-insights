
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Minus, RefreshCw, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { ForecastData, BusinessIntelligenceSettings } from './types';

interface ForecastUpdatesProps {
  settings: BusinessIntelligenceSettings['forecasting'];
  onUpdateSettings: (settings: BusinessIntelligenceSettings['forecasting']) => void;
}

const ForecastUpdates = ({ settings, onUpdateSettings }: ForecastUpdatesProps) => {
  const [forecasts, setForecasts] = useState<ForecastData[]>([
    {
      id: '1',
      metric: 'Monthly Revenue',
      period: 'month',
      currentValue: 125000,
      forecastValue: 138000,
      confidence: 0.85,
      trend: 'up',
      updatedAt: '2024-01-21T10:00:00Z',
      factors: ['Seasonal increase', 'New product launch', 'Marketing campaign'],
      recommendations: ['Increase inventory', 'Prepare customer support', 'Monitor conversion rates'],
    },
    {
      id: '2',
      metric: 'Customer Acquisition',
      period: 'week',
      currentValue: 45,
      forecastValue: 38,
      confidence: 0.72,
      trend: 'down',
      updatedAt: '2024-01-21T09:30:00Z',
      factors: ['Market saturation', 'Competitor campaigns', 'Budget constraints'],
      recommendations: ['Review marketing strategy', 'Optimize ad spend', 'Improve conversion funnel'],
    },
    {
      id: '3',
      metric: 'Ticket Volume',
      period: 'week',
      currentValue: 180,
      forecastValue: 182,
      confidence: 0.91,
      trend: 'stable',
      updatedAt: '2024-01-21T08:45:00Z',
      factors: ['Stable user base', 'Product reliability', 'Support efficiency'],
      recommendations: ['Maintain current staffing', 'Monitor for spikes', 'Continue process improvements'],
    },
  ]);

  const updateSettings = (updates: Partial<BusinessIntelligenceSettings['forecasting']>) => {
    onUpdateSettings({ ...settings, ...updates });
  };

  const refreshForecast = (forecastId: string) => {
    setForecasts(prev =>
      prev.map(forecast =>
        forecast.id === forecastId
          ? { ...forecast, updatedAt: new Date().toISOString() }
          : forecast
      )
    );
    toast.success('Forecast updated successfully');
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case '': return <Minus className="h-4 w-4 text-gray-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatValue = (value: number, metric: string) => {
    if (metric.toLowerCase().includes('revenue')) {
      return `$${value.toLocaleString()}`;
    }
    return value.toString();
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Forecasting Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="forecast-enabled">Enable Automated Forecasting</Label>
            <Switch
              id="forecast-enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) => updateSettings({ enabled: checked })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Update Frequency</Label>
              <Select value={settings.updateFrequency} onValueChange={(value: any) => updateSettings({ updateFrequency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Forecast Horizon (days)</Label>
              <Select 
                value={settings.forecastHorizon.toString()} 
                onValueChange={(value) => updateSettings({ forecastHorizon: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {forecasts.map((forecast) => (
          <Card key={forecast.id} className="shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getTrendIcon(forecast.trend)}
                  {forecast.metric}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getConfidenceColor(forecast.confidence)}>
                    {Math.round(forecast.confidence * 100)}% confidence
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => refreshForecast(forecast.id)}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatValue(forecast.currentValue, forecast.metric)}
                  </div>
                  <div className="text-sm text-muted-foreground">Current</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900">
                    {formatValue(forecast.forecastValue, forecast.metric)}
                  </div>
                  <div className="text-sm text-muted-foreground">Forecast</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-900">
                    {forecast.forecastValue > forecast.currentValue ? '+' : ''}
                    {Math.round(((forecast.forecastValue - forecast.currentValue) / forecast.currentValue) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Change</div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-2">Key Factors</h4>
                  <div className="flex flex-wrap gap-2">
                    {forecast.factors.map((factor, index) => (
                      <Badge key={index} variant="secondary">{factor}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {forecast.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground pt-3 border-t">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Updated: {new Date(forecast.updatedAt).toLocaleString()}
                </span>
                <span>Period: {forecast.period}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ForecastUpdates;
