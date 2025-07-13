
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Calendar,
  Users
} from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { revenueOptimizationService } from '@/services/revenueOptimizationService';
import { toast } from "@/hooks/use-toast";

interface RevenueMetrics {
  totalQuotes: number;
  acceptedQuotes: number;
  totalInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
  pendingRevenue: number;
  overdueAmount: number;
  quoteAcceptanceRate: number;
  paymentCollectionRate: number;
}

interface UpsellOpportunity {
  id: string;
  customerId: string;
  trigger: string;
  recommendation: string;
  potentialValue: number;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

const RevenueOptimizationDashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [upsellOpportunities, setUpsellOpportunities] = useState<UpsellOpportunity[]>([]);
  const [dateRange, setDateRange] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, dateRange]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      const [metricsData, opportunities] = await Promise.all([
        revenueOptimizationService.calculateRevenueMetrics(user.id, { start: startDate, end: endDate }),
        revenueOptimizationService.identifyUpsellOpportunities(user.id)
      ]);

      setMetrics(metricsData);
      setUpsellOpportunities(opportunities);
    } catch (error) {
      console.error('Error loading revenue data:', error);
      toast({
        title: "Error",
        description: "Failed to load revenue data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-6">Loading revenue data...</div>;
  }

  if (!metrics) {
    return <div className="p-6">No revenue data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-quikle-charcoal">Revenue Optimization</h2>
          <p className="text-quikle-slate">Track performance and identify growth opportunities</p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-quikle-slate">Total Revenue</p>
                <p className="text-2xl font-bold text-quikle-charcoal">
                  {formatCurrency(metrics.totalRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-quikle-slate">Pending Revenue</p>
                <p className="text-2xl font-bold text-quikle-charcoal">
                  {formatCurrency(metrics.pendingRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-quikle-slate">Overdue Amount</p>
                <p className="text-2xl font-bold text-quikle-charcoal">
                  {formatCurrency(metrics.overdueAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-quikle-slate">Quote Acceptance</p>
                <p className="text-2xl font-bold text-quikle-charcoal">
                  {metrics.quoteAcceptanceRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Conversion Rates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Quote Acceptance Rate</span>
                      <span>{metrics.quoteAcceptanceRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.quoteAcceptanceRate} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Payment Collection Rate</span>
                      <span>{metrics.paymentCollectionRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.paymentCollectionRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Document Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Quotes</span>
                      <Badge variant="outline">{metrics.totalQuotes}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Accepted Quotes</span>
                      <Badge className="bg-green-100 text-green-800">{metrics.acceptedQuotes}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Paid Invoices</span>
                      <Badge className="bg-blue-100 text-blue-800">{metrics.paidInvoices}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Overdue Invoices</span>
                      <Badge className="bg-red-100 text-red-800">{metrics.overdueInvoices}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 border rounded-lg">
                    <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <h3 className="font-semibold">Revenue Growth</h3>
                    <p className="text-2xl font-bold text-green-600">+12.5%</p>
                    <p className="text-sm text-quikle-slate">vs last period</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <h3 className="font-semibold">Conversion Rate</h3>
                    <p className="text-2xl font-bold text-blue-600">{metrics.quoteAcceptanceRate.toFixed(1)}%</p>
                    <p className="text-sm text-quikle-slate">quotes to invoices</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <h3 className="font-semibold">Avg. Payment Time</h3>
                    <p className="text-2xl font-bold text-yellow-600">18 days</p>
                    <p className="text-sm text-quikle-slate">from invoice date</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="opportunities" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Upselling Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upsellOpportunities.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-quikle-slate">No immediate upselling opportunities identified</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upsellOpportunities.map((opportunity) => (
                      <div key={opportunity.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium">{opportunity.recommendation}</h4>
                            <p className="text-sm text-quikle-slate capitalize">
                              Trigger: {opportunity.trigger.replace('_', ' ')}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className={getPriorityColor(opportunity.priority)}>
                              {opportunity.priority}
                            </Badge>
                            <p className="text-sm font-medium mt-1">
                              {formatCurrency(opportunity.potentialValue)}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <p className="text-xs text-quikle-slate">
                            {new Date(opportunity.createdAt).toLocaleDateString()}
                          </p>
                          <Button size="sm" variant="outline">
                            Contact Customer
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-quikle-slate mx-auto mb-4" />
                  <p className="text-quikle-slate">Advanced analytics charts coming soon</p>
                  <p className="text-sm text-quikle-slate mt-2">
                    Integration with charting library in progress
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RevenueOptimizationDashboard;
