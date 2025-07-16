
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingDown, Target, DollarSign } from 'lucide-react';
import SatisfactionSurveys from './SatisfactionSurveys';
import ChurnPredictionDashboard from './ChurnPredictionDashboard';
import CrossSellOpportunities from './CrossSellOpportunities';
import CustomerLifetimeValueAnalytics from './CustomerLifetimeValueAnalytics';
import { CustomerInsightsSettings } from './types';

const CustomerInsightsManager = () => {
  const [settings, setSettings] = useState<CustomerInsightsSettings>({
    satisfactionSurveys: {
      enabled: true,
      autoSendAfterCompletion: true,
      surveyDelay: 2,
      reminderFrequency: 3,
      maxReminders: 2,
      expiryDays: 14,
    },
    churnPrediction: {
      enabled: true,
      updateFrequency: 'daily',
      riskThreshold: 0.7,
      factorsToTrack: ['last_interaction', 'service_issues', 'payment_delays', 'support_tickets'],
    },
    crossSell: {
      enabled: true,
      minProbability: 0.6,
      updateFrequency: 'weekly',
      opportunityTypes: ['product_upgrade', 'additional_service', 'premium_plan'],
    },
    ltvCalculation: {
      enabled: true,
      calculationMethod: 'both',
      updateFrequency: 'weekly',
      includeProfitMargin: true,
    },
  });

  const updateSettings = (updates: Partial<CustomerInsightsSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500/20 via-purple-500/15 to-pink-500/20 p-6 rounded-xl border border-white/20 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Customer Insights
            </h2>
            <p className="text-muted-foreground mt-1">
              Advanced analytics for customer satisfaction, churn prediction, and lifetime value
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant={settings.satisfactionSurveys.enabled ? "default" : "secondary"}>
              Surveys {settings.satisfactionSurveys.enabled ? 'ON' : 'OFF'}
            </Badge>
            <Badge variant={settings.churnPrediction.enabled ? "default" : "secondary"}>
              Churn Prediction {settings.churnPrediction.enabled ? 'ON' : 'OFF'}
            </Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="satisfaction" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="satisfaction" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Satisfaction
          </TabsTrigger>
          <TabsTrigger value="churn" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Churn Risk
          </TabsTrigger>
          <TabsTrigger value="crosssell" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Cross-sell
          </TabsTrigger>
          <TabsTrigger value="ltv" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Lifetime Value
          </TabsTrigger>
        </TabsList>

        <TabsContent value="satisfaction">
          <SatisfactionSurveys 
            settings={settings.satisfactionSurveys}
            onUpdateSettings={(satisfactionSettings) => 
              updateSettings({ satisfactionSurveys: satisfactionSettings })
            }
          />
        </TabsContent>

        <TabsContent value="churn">
          <ChurnPredictionDashboard 
            settings={settings.churnPrediction}
            onUpdateSettings={(churnSettings) => 
              updateSettings({ churnPrediction: churnSettings })
            }
          />
        </TabsContent>

        <TabsContent value="crosssell">
          <CrossSellOpportunities 
            settings={settings.crossSell}
            onUpdateSettings={(crossSellSettings) => 
              updateSettings({ crossSell: crossSellSettings })
            }
          />
        </TabsContent>

        <TabsContent value="ltv">
          <CustomerLifetimeValueAnalytics 
            settings={settings.ltvCalculation}
            onUpdateSettings={(ltvSettings) => 
              updateSettings({ ltvCalculation: ltvSettings })
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerInsightsManager;
