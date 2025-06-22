
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, TrendingDown, Users, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { ChurnPrediction, CustomerInsightsSettings } from './types';

interface ChurnPredictionDashboardProps {
  settings: CustomerInsightsSettings['churnPrediction'];
  onUpdateSettings: (settings: CustomerInsightsSettings['churnPrediction']) => void;
}

const ChurnPredictionDashboard = ({ settings, onUpdateSettings }: ChurnPredictionDashboardProps) => {
  const [predictions, setPredictions] = useState<ChurnPrediction[]>([
    {
      id: '1',
      customerId: 'cust-1',
      customerName: 'Tech Solutions Ltd',
      churnRisk: 'critical',
      churnScore: 85,
      lastInteraction: '2024-01-10T10:00:00Z',
      predictedChurnDate: '2024-02-15T00:00:00Z',
      confidence: 0.92,
      riskFactors: [
        { factor: 'No recent interactions', impact: 0.4, description: '15+ days since last contact' },
        { factor: 'Multiple support tickets', impact: 0.3, description: '5 unresolved issues in past month' },
        { factor: 'Payment delays', impact: 0.15, description: 'Late payments in last 2 months' }
      ],
      recommendations: [
        'Schedule urgent check-in call',
        'Offer premium support package',
        'Provide immediate resolution for open tickets'
      ]
    },
    {
      id: '2',
      customerId: 'cust-2',
      customerName: 'Global Industries',
      churnRisk: 'high',
      churnScore: 72,
      lastInteraction: '2024-01-15T14:30:00Z',
      predictedChurnDate: '2024-03-01T00:00:00Z',
      confidence: 0.78,
      riskFactors: [
        { factor: 'Declining usage', impact: 0.35, description: '40% decrease in service usage' },
        { factor: 'Budget constraints', impact: 0.25, description: 'Mentioned cost concerns in last meeting' },
        { factor: 'Competitor interest', impact: 0.12, description: 'Researching alternative solutions' }
      ],
      recommendations: [
        'Propose cost-effective alternative plans',
        'Highlight unique value propositions',
        'Schedule business review meeting'
      ]
    },
    {
      id: '3',
      customerId: 'cust-3',
      customerName: 'Startup Inc',
      churnRisk: 'medium',
      churnScore: 45,
      lastInteraction: '2024-01-18T09:15:00Z',
      predictedChurnDate: '2024-04-10T00:00:00Z',
      confidence: 0.65,
      riskFactors: [
        { factor: 'Growth stage concerns', impact: 0.2, description: 'Rapidly scaling business needs' },
        { factor: 'Feature requests', impact: 0.15, description: 'Requesting features not in current plan' },
        { factor: 'Response time issues', impact: 0.1, description: 'Occasional delays in support response' }
      ],
      recommendations: [
        'Discuss upgrade options',
        'Improve support response times',
        'Provide growth-oriented solutions'
      ]
    }
  ]);

  const updateSettings = (updates: Partial<CustomerInsightsSettings['churnPrediction']>) => {
    onUpdateSettings({ ...settings, ...updates });
  };

  const takeAction = (predictionId: string, action: string) => {
    toast.success(`Action taken: ${action}`);
    console.log(`Taking action for prediction ${predictionId}: ${action}`);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high': return <TrendingDown className="h-4 w-4 text-orange-600" />;
      case 'medium': return <Users className="h-4 w-4 text-yellow-600" />;
      case 'low': return <Users className="h-4 w-4 text-green-600" />;
      default: return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const criticalRisk = predictions.filter(p => p.churnRisk === 'critical').length;
  const highRisk = predictions.filter(p => p.churnRisk === 'high').length;
  const mediumRisk = predictions.filter(p => p.churnRisk === 'medium').length;
  const totalAtRisk = criticalRisk + highRisk + mediumRisk;

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            Churn Prediction Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="churn-enabled">Enable Churn Prediction</Label>
            <Switch
              id="churn-enabled"
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
              <Label>Risk Threshold</Label>
              <Select 
                value={settings.riskThreshold.toString()} 
                onValueChange={(value) => updateSettings({ riskThreshold: parseFloat(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">50% (Low)</SelectItem>
                  <SelectItem value="0.7">70% (Medium)</SelectItem>
                  <SelectItem value="0.8">80% (High)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{criticalRisk}</div>
            <div className="text-sm text-muted-foreground">Critical Risk</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{highRisk}</div>
            <div className="text-sm text-muted-foreground">High Risk</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{mediumRisk}</div>
            <div className="text-sm text-muted-foreground">Medium Risk</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{totalAtRisk}</div>
            <div className="text-sm text-muted-foreground">Total At Risk</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Customer Churn Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predictions.map((prediction) => (
              <div key={prediction.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{prediction.customerName}</h4>
                    <Badge className={getRiskColor(prediction.churnRisk)}>
                      {getRiskIcon(prediction.churnRisk)}
                      <span className="ml-1 capitalize">{prediction.churnRisk} Risk</span>
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      Score: {prediction.churnScore}% | Confidence: {Math.round(prediction.confidence * 100)}%
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Predicted: {new Date(prediction.predictedChurnDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-sm mb-2">Risk Factors</h5>
                    <div className="space-y-2">
                      {prediction.riskFactors.map((factor, index) => (
                        <div key={index} className="text-sm">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">{factor.factor}</span>
                            <span className="text-muted-foreground">{Math.round(factor.impact * 100)}%</span>
                          </div>
                          <p className="text-muted-foreground text-xs">{factor.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-sm mb-2">Recommendations</h5>
                    <div className="space-y-2">
                      {prediction.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-blue-500 text-xs mt-1">•</span>
                          <span className="text-sm">{rec}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm" 
                        onClick={() => takeAction(prediction.id, 'Schedule call')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Schedule Call
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => takeAction(prediction.id, 'Send email')}
                      >
                        Send Email
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChurnPredictionDashboard;
