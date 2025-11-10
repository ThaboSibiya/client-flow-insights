import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import FinanceOverviewTab from '@/components/finance/overview/FinanceOverviewTab';
import DebtorsTab from '@/components/finance/debtors/DebtorsTab';
import RemindersTab from '@/components/finance/reminders/RemindersTab';
import { useDebtorData } from '@/hooks/useDebtorData';

const Finance: React.FC = () => {
  const {
    debtors,
    loading,
    stats,
    refetch
  } = useDebtorData();

  return (
    <div className="container mx-auto py-6 space-y-6">
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
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white border border-quikle-silver/20 shadow-sm">
          <TabsTrigger value="overview" className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="debtors" className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white">
            Debtors ({debtors.length})
          </TabsTrigger>
          <TabsTrigger value="reminders" className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white">
            Send Reminders
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
            <FinanceOverviewTab stats={stats} loading={loading} />
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
      </Tabs>
    </div>
  );
};

export default Finance;
