
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, AlertTriangle, Eye } from 'lucide-react';
import DashboardEmailAutomation from './DashboardEmailAutomation';
import AnomalyDetection from './AnomalyDetection';
import ForecastUpdates from './ForecastUpdates';
import CompetitorAnalysis from './CompetitorAnalysis';
import { BusinessIntelligenceSettings } from './types';

const BusinessIntelligenceManager = () => {
  const [settings, setSettings] = useState<BusinessIntelligenceSettings>({
    anomalyDetection: {
      enabled: true,
      sensitivity: 'medium',
      metrics: ['revenue', 'customer_acquisition', 'ticket_volume'],
      alertThreshold: 0.15,
      checkFrequency: 'daily',
    },
    forecasting: {
      enabled: true,
      updateFrequency: 'daily',
      confidenceThreshold: 0.7,
      forecastHorizon: 30,
    },
    competitorTracking: {
      enabled: false,
      competitors: [],
      trackingAreas: ['pricing', 'features', 'reviews'],
      alertFrequency: 'daily',
    },
  });

  const updateSettings = (updates: Partial<BusinessIntelligenceSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500/20 via-blue-500/15 to-indigo-500/20 p-6 rounded-xl border border-white/20 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Business Intelligence
            </h2>
            <p className="text-muted-foreground mt-1">
              Automated insights, anomaly detection, and competitive intelligence
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant={settings.anomalyDetection.enabled ? "default" : "secondary"}>
              Anomaly Detection {settings.anomalyDetection.enabled ? 'ON' : 'OFF'}
            </Badge>
            <Badge variant={settings.forecasting.enabled ? "default" : "secondary"}>
              Forecasting {settings.forecasting.enabled ? 'ON' : 'OFF'}
            </Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Dashboard Emails
          </TabsTrigger>
          <TabsTrigger value="anomaly" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Anomaly Detection
          </TabsTrigger>
          <TabsTrigger value="forecast" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Forecasting
          </TabsTrigger>
          <TabsTrigger value="competitor" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Competitor Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <DashboardEmailAutomation />
        </TabsContent>

        <TabsContent value="anomaly">
          <AnomalyDetection 
            settings={settings.anomalyDetection}
            onUpdateSettings={(anomalySettings) => 
              updateSettings({ anomalyDetection: anomalySettings })
            }
          />
        </TabsContent>

        <TabsContent value="forecast">
          <ForecastUpdates 
            settings={settings.forecasting}
            onUpdateSettings={(forecastSettings) => 
              updateSettings({ forecasting: forecastSettings })
            }
          />
        </TabsContent>

        <TabsContent value="competitor">
          <CompetitorAnalysis 
            settings={settings.competitorTracking}
            onUpdateSettings={(competitorSettings) => 
              updateSettings({ competitorTracking: competitorSettings })
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessIntelligenceManager;
