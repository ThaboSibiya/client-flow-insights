import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import FinanceOverviewTab from '@/components/finance/overview/FinanceOverviewTab';
import DebtorsTab from '@/components/finance/debtors/DebtorsTab';
import RemindersTab from '@/components/finance/reminders/RemindersTab';
import FollowUpTracker from '@/components/finance/reminders/FollowUpTracker';
import { useDebtorData } from '@/hooks/useDebtorData';
import { generateFinanceReport, downloadReport } from '@/utils/financeReportGenerator';
import { useToast } from '@/hooks/use-toast';

const Finance: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const {
    debtors,
    loading,
    stats,
    refetch
  } = useDebtorData();

  const handleSendBulkReminders = () => {
    setActiveTab('reminders');
    toast({
      title: 'Bulk Reminders',
      description: 'Select customers to send payment reminders',
    });
  };

  const handleReviewHighRisk = () => {
    setActiveTab('debtors');
    toast({
      title: 'High Risk Accounts',
      description: 'Showing high-risk and critical accounts',
    });
  };

  const handleGenerateReport = () => {
    try {
      const report = generateFinanceReport(debtors);
      downloadReport(report);
      toast({
        title: 'Report Generated',
        description: 'Debtor aging report has been downloaded successfully',
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-6 pb-20 md:pb-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-quikle-primary via-quikle-secondary to-quikle-accent bg-clip-text text-transparent drop-shadow-lg">
          Debtor Management
        </h1>
        <p className="text-quikle-charcoal/70 font-medium">
          Track overdue accounts, manage collections, and send payment reminders
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-white border border-quikle-silver/20 shadow-sm overflow-x-auto flex md:grid md:grid-cols-4">
          <TabsTrigger value="overview" className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white whitespace-nowrap flex-shrink-0">
            Overview
          </TabsTrigger>
          <TabsTrigger value="debtors" className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white whitespace-nowrap flex-shrink-0">
            Debtors ({debtors.length})
          </TabsTrigger>
          <TabsTrigger value="reminders" className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white whitespace-nowrap flex-shrink-0">
            Send Reminders
          </TabsTrigger>
          <TabsTrigger value="follow-ups" className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white whitespace-nowrap flex-shrink-0">
            Follow-ups
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          ) : (
            <FinanceOverviewTab 
              stats={stats} 
              loading={loading}
              debtors={debtors}
              onSendBulkReminders={handleSendBulkReminders}
              onReviewHighRisk={handleReviewHighRisk}
              onGenerateReport={handleGenerateReport}
            />
          )}
        </TabsContent>

        {/* Debtors Tab */}
        <TabsContent value="debtors" className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="h-[600px]" />
              <div className="lg:col-span-2">
                <Skeleton className="h-[600px]" />
              </div>
            </div>
          ) : (
            <DebtorsTab debtors={debtors} onRefresh={refetch} />
          )}
        </TabsContent>

        {/* Reminders Tab */}
        <TabsContent value="reminders" className="mt-6">
          {loading ? (
            <Skeleton className="h-[600px]" />
          ) : (
            <RemindersTab debtors={debtors} onRefresh={refetch} />
          )}
        </TabsContent>

        {/* Follow-ups Tab */}
        <TabsContent value="follow-ups" className="mt-6">
          <FollowUpTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Finance;
