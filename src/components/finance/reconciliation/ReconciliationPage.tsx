import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReconciliationFilters from './ReconciliationFilters';
import ReconciliationSummary from './ReconciliationSummary';
import ReconciliationDualPanel from './ReconciliationDualPanel';
import ReconciliationHistory from './ReconciliationHistory';
import { useReconciliationData } from '@/hooks/useReconciliationData';
import { Skeleton } from "@/components/ui/skeleton";

export interface ReconciliationFilters {
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  customerId: string | null;
  status: 'all' | 'unreconciled' | 'reconciled';
}

const ReconciliationPage: React.FC = () => {
  const [filters, setFilters] = useState<ReconciliationFilters>({
    dateFrom: undefined,
    dateTo: undefined,
    customerId: null,
    status: 'all',
  });

  const { 
    invoices, 
    payments, 
    reconciliationHistory,
    summary,
    isLoading, 
    refetch 
  } = useReconciliationData(filters);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-quikle-primary via-quikle-secondary to-quikle-accent bg-clip-text text-transparent drop-shadow-lg">
            Finance Reconciliation
          </h1>
          <p className="text-quikle-charcoal/70 font-medium">
            Match and reconcile invoices with payments automatically
          </p>
        </div>
        <Button 
          onClick={() => refetch()} 
          variant="outline" 
          size="sm"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <ReconciliationFilters 
        filters={filters} 
        onFiltersChange={setFilters} 
      />

      {/* Summary Metrics */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <ReconciliationSummary summary={summary} />
      )}

      {/* Main Content */}
      <Tabs defaultValue="reconcile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white border border-quikle-silver/20 shadow-sm">
          <TabsTrigger value="reconcile" className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white">
            Reconcile Transactions
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white">
            Reconciliation History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reconcile" className="mt-6">
          {isLoading ? (
            <Card>
              <CardContent className="p-8">
                <div className="space-y-4">
                  <Skeleton className="h-96 w-full" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <ReconciliationDualPanel 
              invoices={invoices} 
              payments={payments}
              onReconcile={refetch}
            />
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {isLoading ? (
            <Card>
              <CardContent className="p-8">
                <div className="space-y-4">
                  <Skeleton className="h-64 w-full" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <ReconciliationHistory history={reconciliationHistory} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReconciliationPage;
