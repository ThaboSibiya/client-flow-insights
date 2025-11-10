import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, FileText, CreditCard, GitCompare } from "lucide-react";
import ReconciliationPage from "@/components/finance/reconciliation/ReconciliationPage";
import InvoicesTable from "@/components/finance/InvoicesTable";
import { useAllFinanceData } from '@/hooks/useAllFinanceData';
import { Skeleton } from '@/components/ui/skeleton';

const Finance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // Fetch all finance data
  const {
    invoices,
    payments,
    loading,
    updateInvoiceStatus
  } = useAllFinanceData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-quikle-primary via-quikle-secondary to-quikle-accent bg-clip-text text-transparent drop-shadow-lg">
          Finance
        </h1>
        <p className="text-quikle-charcoal/70 font-medium">
          Manage invoices, payments, and reconciliation
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white border border-quikle-silver/20 shadow-sm p-1 h-auto">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white text-sm px-4 py-2.5 font-medium flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="invoices" 
            className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white text-sm px-4 py-2.5 font-medium flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Invoices
          </TabsTrigger>
          <TabsTrigger 
            value="payments" 
            className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white text-sm px-4 py-2.5 font-medium flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger 
            value="reconciliation" 
            className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white text-sm px-4 py-2.5 font-medium flex items-center gap-2"
          >
            <GitCompare className="h-4 w-4" />
            Reconciliation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Invoices</p>
                  <p className="text-3xl font-bold text-quikle-charcoal">
                    {loading ? <Skeleton className="h-9 w-20" /> : invoices.length}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Payments</p>
                  <p className="text-3xl font-bold text-quikle-charcoal">
                    {loading ? <Skeleton className="h-9 w-20" /> : payments.length}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Outstanding Amount</p>
                  <p className="text-3xl font-bold text-quikle-charcoal">
                    {loading ? (
                      <Skeleton className="h-9 w-32" />
                    ) : (
                      `R${invoices
                        .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
                        .reduce((sum, inv) => sum + inv.total_amount, 0)
                        .toFixed(2)}`
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="mt-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          ) : (
            <InvoicesTable invoices={invoices} onUpdateStatus={updateInvoiceStatus} />
          )}
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <Card>
            <CardContent className="p-8">
              <div className="text-center text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-quikle-slate" />
                <p className="text-lg font-semibold text-quikle-charcoal mb-2">Payments View</p>
                <p>Payment management coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reconciliation" className="mt-6">
          <ReconciliationPage />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Finance;
