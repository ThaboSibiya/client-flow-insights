
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, TrendingUp, TrendingDown, Users, BarChart3 } from 'lucide-react';
import { CustomerLifetimeValue, CustomerInsightsSettings } from './types';

interface CustomerLifetimeValueAnalyticsProps {
  settings: CustomerInsightsSettings['ltvCalculation'];
  onUpdateSettings: (settings: CustomerInsightsSettings['ltvCalculation']) => void;
}

const CustomerLifetimeValueAnalytics = ({ settings, onUpdateSettings }: CustomerLifetimeValueAnalyticsProps) => {
  const [customers, setCustomers] = useState<CustomerLifetimeValue[]>([
    {
      id: '1',
      customerId: 'cust-1',
      customerName: 'Acme Corporation',
      currentLTV: 12500,
      predictedLTV: 18000,
      acquisitionCost: 500,
      totalRevenue: 15000,
      averageOrderValue: 2500,
      purchaseFrequency: 6,
      customerLifespan: 24,
      profitMargin: 0.35,
      ltv_cac_ratio: 25.0,
      segment: 'high_value',
      trends: [
        { month: '2023-10', revenue: 2000, orders: 1 },
        { month: '2023-11', revenue: 2500, orders: 1 },
        { month: '2023-12', revenue: 3000, orders: 2 },
        { month: '2024-01', revenue: 2500, orders: 1 }
      ]
    },
    {
      id: '2',
      customerId: 'cust-2',
      customerName: 'Tech Solutions Ltd',
      currentLTV: 8500,
      predictedLTV: 11000,
      acquisitionCost: 750,
      totalRevenue: 9200,
      averageOrderValue: 1840,
      purchaseFrequency: 5,
      customerLifespan: 18,
      profitMargin: 0.28,
      ltv_cac_ratio: 11.3,
      segment: 'medium_value',
      trends: [
        { month: '2023-10', revenue: 1800, orders: 1 },
        { month: '2023-11', revenue: 1900, orders: 1 },
        { month: '2023-12', revenue: 1700, orders: 1 },
        { month: '2024-01', revenue: 2000, orders: 1 }
      ]
    },
    {
      id: '3',
      customerId: 'cust-3',
      customerName: 'Global Industries',
      currentLTV: 22000,
      predictedLTV: 28000,
      acquisitionCost: 1200,
      totalRevenue: 25000,
      averageOrderValue: 5000,
      purchaseFrequency: 5,
      customerLifespan: 36,
      profitMargin: 0.42,
      ltv_cac_ratio: 18.3,
      segment: 'high_value',
      trends: [
        { month: '2023-10', revenue: 4500, orders: 1 },
        { month: '2023-11', revenue: 5200, orders: 1 },
        { month: '2023-12', revenue: 4800, orders: 1 },
        { month: '2024-01', revenue: 5500, orders: 1 }
      ]
    },
    {
      id: '4',
      customerId: 'cust-4',
      customerName: 'Startup Inc',
      currentLTV: 3200,
      predictedLTV: 4500,
      acquisitionCost: 400,
      totalRevenue: 3800,
      averageOrderValue: 950,
      purchaseFrequency: 4,
      customerLifespan: 12,
      profitMargin: 0.25,
      ltv_cac_ratio: 8.0,
      segment: 'at_risk',
      trends: [
        { month: '2023-10', revenue: 800, orders: 1 },
        { month: '2023-11', revenue: 900, orders: 1 },
        { month: '2023-12', revenue: 1100, orders: 1 },
        { month: '2024-01', revenue: 950, orders: 1 }
      ]
    }
  ]);

  const updateSettings = (updates: Partial<CustomerInsightsSettings['ltvCalculation']>) => {
    onUpdateSettings({ ...settings, ...updates });
  };

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'high_value': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium_value': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low_value': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'at_risk': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSegmentIcon = (segment: string) => {
    switch (segment) {
      case 'high_value': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'medium_value': return <BarChart3 className="h-4 w-4 text-blue-600" />;
      case 'low_value': return <TrendingDown className="h-4 w-4 text-yellow-600" />;
      case 'at_risk': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const totalLTV = customers.reduce((sum, customer) => sum + customer.currentLTV, 0);
  const averageLTV = totalLTV / customers.length;
  const highValueCustomers = customers.filter(c => c.segment === 'high_value').length;
  const atRiskCustomers = customers.filter(c => c.segment === 'at_risk').length;

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            LTV Calculation Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="ltv-enabled">Enable LTV Calculations</Label>
            <Switch
              id="ltv-enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) => updateSettings({ enabled: checked })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Calculation Method</Label>
              <Select value={settings.calculationMethod} onValueChange={(value: any) => updateSettings({ calculationMethod: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="historical">Historical</SelectItem>
                  <SelectItem value="predictive">Predictive</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Update Frequency</Label>
              <Select value={settings.updateFrequency} onValueChange={(value: any) => updateSettings({ updateFrequency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Switch
                checked={settings.includeProfitMargin}
                onCheckedChange={(checked) => updateSettings({ includeProfitMargin: checked })}
              />
              <Label>Include Profit Margin</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">${Math.round(totalLTV).toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total LTV</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">${Math.round(averageLTV).toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Average LTV</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{highValueCustomers}</div>
            <div className="text-sm text-muted-foreground">High Value</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{atRiskCustomers}</div>
            <div className="text-sm text-muted-foreground">At Risk</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Customer Lifetime Value Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customers.map((customer) => (
              <div key={customer.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{customer.customerName}</h4>
                    <Badge className={getSegmentColor(customer.segment)}>
                      {getSegmentIcon(customer.segment)}
                      <span className="ml-1 capitalize">{customer.segment.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    LTV:CAC Ratio: {customer.ltv_cac_ratio.toFixed(1)}:1
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">
                      ${customer.currentLTV.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Current LTV</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">
                      ${customer.predictedLTV.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Predicted LTV</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">
                      ${customer.averageOrderValue.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Order Value</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-xl font-bold text-orange-600">
                      {customer.customerLifespan}
                    </div>
                    <div className="text-sm text-muted-foreground">Months Lifespan</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 text-sm">
                  <div>
                    <span className="font-medium">Total Revenue:</span> ${customer.totalRevenue.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Acquisition Cost:</span> ${customer.acquisitionCost.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Purchase Frequency:</span> {customer.purchaseFrequency} times/year
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t">
                  <h6 className="font-medium text-sm mb-2">Recent Revenue Trend</h6>
                  <div className="flex gap-4">
                    {customer.trends.map((trend, index) => (
                      <div key={index} className="text-center">
                        <div className="text-sm font-medium">${trend.revenue.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{trend.month}</div>
                      </div>
                    ))}
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

export default CustomerLifetimeValueAnalytics;
