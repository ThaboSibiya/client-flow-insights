
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Download, Share2, Filter } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import TouchOptimizedChart from './TouchOptimizedChart';
import { generateReportData } from '@/utils/customer-analytics';

const MobileAnalyticsView = () => {
  const { customers } = useCRM();
  const [currentMetricIndex, setCurrentMetricIndex] = useState(0);
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'quarterly'>('monthly');

  const reportData = generateReportData(customers, 'monthly');

  const metrics = [
    {
      id: 'customer-growth',
      title: 'Customer Growth',
      description: 'Track customer acquisition over time',
      data: reportData.map(item => ({
        name: item.name,
        value: item.new,
        trend: item.conversionRate
      })),
      type: 'combo' as const,
    },
    {
      id: 'conversion-rates',
      title: 'Conversion Rates',
      description: 'Monitor conversion performance',
      data: reportData.map(item => ({
        name: item.name,
        value: item.conversionRate,
      })),
      type: 'line' as const,
    },
    {
      id: 'status-distribution',
      title: 'Customer Status',
      description: 'Current customer status breakdown',
      data: [
        { name: 'New', value: customers.filter(c => c.status === 'new').length },
        { name: 'Existing', value: customers.filter(c => c.status === 'existing').length },
        { name: 'Pending', value: customers.filter(c => c.status === 'pending').length },
        { name: 'Finalised', value: customers.filter(c => c.status === 'finalised').length },
      ],
      type: 'pie' as const,
    },
    {
      id: 'monthly-activity',
      title: 'Monthly Activity',
      description: 'Customer activity by month',
      data: reportData.map(item => ({
        name: item.name,
        value: item.new + item.existing + item.pending + item.finalised,
      })),
      type: 'bar' as const,
    },
  ];

  const currentMetric = metrics[currentMetricIndex];

  const navigatePrevious = () => {
    setCurrentMetricIndex(prev => (prev - 1 + metrics.length) % metrics.length);
  };

  const navigateNext = () => {
    setCurrentMetricIndex(prev => (prev + 1) % metrics.length);
  };

  const handleDrillDown = (dataPoint: any) => {
    console.log('Drill down to:', dataPoint);
    // Could navigate to detailed view or filter data
  };

  return (
    <div className="space-y-4 md:hidden"> {/* Only show on mobile */}
      {/* Metric Navigation */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={navigatePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-center">
                <Badge variant="secondary" className="text-xs">
                  {currentMetricIndex + 1} of {metrics.length}
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={navigateNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Current Metric */}
      <TouchOptimizedChart
        data={currentMetric.data}
        title={currentMetric.title}
        description={currentMetric.description}
        type={currentMetric.type}
        onDrillDown={handleDrillDown}
      />

      {/* Metric Dots Indicator */}
      <div className="flex justify-center gap-2 py-2">
        {metrics.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentMetricIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentMetricIndex 
                ? 'bg-blue-600 w-6' 
                : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Timeframe Selector */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex justify-center gap-2">
            {(['weekly', 'monthly', 'quarterly'] as const).map((period) => (
              <Button
                key={period}
                variant={timeframe === period ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeframe(period)}
                className="flex-1"
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Best performing month:</span>
              <span className="font-medium">
                {reportData.reduce((max, item) => 
                  item.conversionRate > max.conversionRate ? item : max
                ).name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total conversions:</span>
              <span className="font-medium">
                {reportData.reduce((sum, item) => sum + item.finalised, 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Average conversion rate:</span>
              <span className="font-medium">
                {Math.round(reportData.reduce((sum, item) => sum + item.conversionRate, 0) / reportData.length)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileAnalyticsView;
