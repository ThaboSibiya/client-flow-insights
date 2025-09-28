
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, TrendingUp, TrendingDown, Activity, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AnomalyAlert, BusinessIntelligenceSettings } from './types';

interface AnomalyDetectionProps {
  settings: BusinessIntelligenceSettings['anomalyDetection'];
  onUpdateSettings: (settings: BusinessIntelligenceSettings['anomalyDetection']) => void;
}

const AnomalyDetection = ({ settings, onUpdateSettings }: AnomalyDetectionProps) => {
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([
    {
      id: '1',
      type: 'spike',
      metric: 'New Customer Registrations',
      description: 'Unusual spike in new customer registrations detected',
      severity: 'medium',
      detectedAt: '2024-01-21T09:30:00Z',
      currentValue: 45,
      expectedValue: 12,
      deviation: 2.75,
      isResolved: false,
      affectedArea: 'Customer Acquisition',
    },
    {
      id: '2',
      type: 'drop',
      metric: 'Ticket Response Time',
      description: 'Response time has increased significantly',
      severity: 'high',
      detectedAt: '2024-01-21T08:15:00Z',
      currentValue: 180,
      expectedValue: 45,
      deviation: 3.0,
      isResolved: false,
      affectedArea: 'Customer Support',
    },
    {
      id: '3',
      type: 'trend_change',
      metric: 'Revenue Growth',
      description: 'Revenue growth trend has changed direction',
      severity: 'critical',
      detectedAt: '2024-01-20T16:45:00Z',
      currentValue: -2.1,
      expectedValue: 5.2,
      deviation: 2.1,
      isResolved: true,
      affectedArea: 'Sales Performance',
    },
  ]);

  const updateSettings = (updates: Partial<BusinessIntelligenceSettings['anomalyDetection']>) => {
    onUpdateSettings({ ...settings, ...updates });
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, isResolved: true } : alert
      )
    );
    toast.success('Anomaly alert marked as resolved');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'spike': return <TrendingUp className="h-4 w-4" />;
      case 'drop': return <TrendingDown className="h-4 w-4" />;
      case 'trend_change': return <Activity className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const activeAlerts = alerts.filter(alert => !alert.isResolved);
  const resolvedAlerts = alerts.filter(alert => alert.isResolved);

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Anomaly Detection Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="anomaly-enabled">Enable Anomaly Detection</Label>
            <Switch
              id="anomaly-enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) => updateSettings({ enabled: checked })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Detection Sensitivity</Label>
              <Select value={settings.sensitivity} onValueChange={(value: 'low' | 'medium' | 'high') => updateSettings({ sensitivity: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (Less Sensitive)</SelectItem>
                  <SelectItem value="medium">Medium (Balanced)</SelectItem>
                  <SelectItem value="high">High (More Sensitive)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Check Frequency</Label>
              <Select value={settings.checkFrequency} onValueChange={(value: 'hourly' | 'daily') => updateSettings({ checkFrequency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Active Anomaly Alerts ({activeAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeAlerts.map((alert) => (
              <div key={alert.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(alert.type)}
                    <div>
                      <h4 className="font-medium">{alert.metric}</h4>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                    </div>
                  </div>
                  <Badge className={getSeverityColor(alert.severity)}>
                    {alert.severity.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-3 text-sm">
                  <div>
                    <span className="font-medium">Current:</span> {alert.currentValue}
                  </div>
                  <div>
                    <span className="font-medium">Expected:</span> {alert.expectedValue}
                  </div>
                  <div>
                    <span className="font-medium">Deviation:</span> {alert.deviation}σ
                  </div>
                  <div>
                    <span className="font-medium">Area:</span> {alert.affectedArea}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Detected: {new Date(alert.detectedAt).toLocaleString()}
                  </span>
                  <Button size="sm" onClick={() => resolveAlert(alert.id)}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark Resolved
                  </Button>
                </div>
              </div>
            ))}

            {activeAlerts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
                <p>No active anomaly alerts. Your systems are running normally.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {resolvedAlerts.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Recently Resolved ({resolvedAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resolvedAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="p-3 border rounded-lg bg-green-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{alert.metric}</span>
                    </div>
                    <Badge variant="outline" className="text-green-700">
                      Resolved
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnomalyDetection;
