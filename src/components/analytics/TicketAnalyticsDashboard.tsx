
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, BarChart3, Clock, Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import TicketResolutionMetrics from './TicketResolutionMetrics';
import PriorityDistributionChart from './PriorityDistributionChart';
import SatisfactionMetrics from './SatisfactionMetrics';
import {
  getResolutionTimeMetrics,
  getPriorityDistribution,
  getSatisfactionMetrics,
  type ResolutionTimeMetrics,
  type PriorityDistribution,
  type SatisfactionMetrics as SatisfactionMetricsType,
} from '@/services/ticketAnalyticsService';

const TicketAnalyticsDashboard = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('30');
  const [isLoading, setIsLoading] = useState(true);
  
  const [resolutionMetrics, setResolutionMetrics] = useState<ResolutionTimeMetrics>({
    averageResolutionTime: 0,
    medianResolutionTime: 0,
    resolutionTimeByPriority: { urgent: 0, high: 0, medium: 0, low: 0 },
    resolutionTrend: [],
  });
  
  const [priorityDistribution, setPriorityDistribution] = useState<PriorityDistribution>({
    urgent: 0,
    high: 0,
    medium: 0,
    low: 0,
  });
  
  const [satisfactionMetrics, setSatisfactionMetrics] = useState<SatisfactionMetricsType>({
    averageRating: 0,
    totalRatings: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    recentFeedback: [],
  });

  const fetchAnalytics = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const days = parseInt(timeRange);
      
      const [resolution, priority, satisfaction] = await Promise.all([
        getResolutionTimeMetrics(user.id, days),
        getPriorityDistribution(user.id, days),
        getSatisfactionMetrics(user.id, days),
      ]);

      setResolutionMetrics(resolution);
      setPriorityDistribution(priority);
      setSatisfactionMetrics(satisfaction);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user, timeRange]);

  const getTimeRangeLabel = (days: string) => {
    switch (days) {
      case '7': return 'Last 7 days';
      case '30': return 'Last 30 days';
      case '90': return 'Last 3 months';
      case '365': return 'Last year';
      default: return 'Last 30 days';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Ticket Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive insights into your ticket management performance
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="resolution" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resolution" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Resolution Times
          </TabsTrigger>
          <TabsTrigger value="priority" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Priority Distribution
          </TabsTrigger>
          <TabsTrigger value="satisfaction" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Customer Satisfaction
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resolution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resolution Time Analytics</CardTitle>
              <CardDescription>
                Track how quickly tickets are being resolved across different priorities and time periods ({getTimeRangeLabel(timeRange)})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TicketResolutionMetrics metrics={resolutionMetrics} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="priority" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Priority Distribution Analysis</CardTitle>
              <CardDescription>
                Understand how tickets are distributed across priority levels ({getTimeRangeLabel(timeRange)})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PriorityDistributionChart distribution={priorityDistribution} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="satisfaction" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Satisfaction Insights</CardTitle>
              <CardDescription>
                Monitor customer satisfaction ratings and feedback trends ({getTimeRangeLabel(timeRange)})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SatisfactionMetrics metrics={satisfactionMetrics} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TicketAnalyticsDashboard;
