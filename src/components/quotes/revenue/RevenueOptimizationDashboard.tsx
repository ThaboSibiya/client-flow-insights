
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  Clock, 
  Target,
  ArrowUpRight,
  Mail,
  Calendar
} from "lucide-react";
import { useRevenueOptimization } from '@/hooks/useRevenueOptimization';
import { PaymentReminderConfig } from '@/services/revenueOptimizationService';

const RevenueOptimizationDashboard = () => {
  const {
    isProcessing,
    upsellOpportunities,
    revenueMetrics,
    processOverdueInvoices,
    generatePaymentReminders,
    loadUpsellOpportunities,
    loadRevenueMetrics,
  } = useRevenueOptimization();

  const [reminderConfig, setReminderConfig] = useState<PaymentReminderConfig>({
    enabled: true,
    reminderDays: [3, 7, 14],
    template: 'Friendly payment reminder',
    escalateToFinance: true,
  });

  useEffect(() => {
    loadRevenueMetrics();
    loadUpsellOpportunities();
  }, [loadRevenueMetrics, loadUpsellOpportunities]);

  const handleProcessOverdue = async () => {
    await processOverdueInvoices();
    loadRevenueMetrics(); // Refresh metrics
  };

  const handleGenerateReminders = async () => {
    await generatePaymentReminders(reminderConfig);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Revenue Metrics Overview */}
      {revenueMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    R{revenueMetrics.totalRevenue.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Revenue</p>
                  <p className="text-2xl font-bold text-blue-600">
                    R{revenueMetrics.pendingRevenue.toFixed(2)}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overdue Amount</p>
                  <p className="text-2xl font-bold text-red-600">
                    R{revenueMetrics.overdueAmount.toFixed(2)}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Collection Rate</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {revenueMetrics.paymentCollectionRate.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="automation" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="upselling">Upselling</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="automation" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Reminders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Payment Reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reminder Schedule (Days Before Due)</label>
                  <div className="flex gap-2">
                    {reminderConfig.reminderDays.map((day, index) => (
                      <Badge key={index} variant="outline">{day} days</Badge>
                    ))}
                  </div>
                </div>
                <Button 
                  onClick={handleGenerateReminders}
                  disabled={isProcessing}
                  className="w-full"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Generate Reminders
                </Button>
              </CardContent>
            </Card>

            {/* Overdue Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Overdue Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {revenueMetrics && (
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{revenueMetrics.overdueInvoices}</p>
                    <p className="text-sm text-red-600">Overdue Invoices</p>
                  </div>
                )}
                <Button 
                  onClick={handleProcessOverdue}
                  disabled={isProcessing}
                  variant="destructive"
                  className="w-full"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Process Overdue Invoices
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="upselling" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Upselling Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upsellOpportunities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No upselling opportunities identified at this time.</p>
                  <Button 
                    onClick={loadUpsellOpportunities}
                    variant="outline"
                    className="mt-4"
                  >
                    Refresh Opportunities
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upsellOpportunities.map((opportunity) => (
                    <div key={opportunity.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getPriorityColor(opportunity.priority)}>
                              {opportunity.priority.toUpperCase()}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {opportunity.trigger.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <h4 className="font-semibold mb-1">{opportunity.recommendation}</h4>
                          <p className="text-sm text-muted-foreground">
                            Potential Value: R{opportunity.potentialValue.toFixed(2)}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quote Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {revenueMetrics ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Quotes:</span>
                      <span className="font-semibold">{revenueMetrics.totalQuotes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accepted Quotes:</span>
                      <span className="font-semibold">{revenueMetrics.acceptedQuotes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Acceptance Rate:</span>
                      <span className="font-semibold text-green-600">
                        {revenueMetrics.quoteAcceptanceRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Loading metrics...</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Invoice Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {revenueMetrics ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Invoices:</span>
                      <span className="font-semibold">{revenueMetrics.totalInvoices}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Paid Invoices:</span>
                      <span className="font-semibold">{revenueMetrics.paidInvoices}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Collection Rate:</span>
                      <span className="font-semibold text-green-600">
                        {revenueMetrics.paymentCollectionRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Loading metrics...</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RevenueOptimizationDashboard;
