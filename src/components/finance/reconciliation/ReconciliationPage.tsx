import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReconciliationFilters from './ReconciliationFilters';
import ReconciliationSummary from './ReconciliationSummary';
import ReconciliationDualPanel from './ReconciliationDualPanel';
import ReconciliationHistory from './ReconciliationHistory';
import MatchSuggestions, { MatchSuggestion } from './MatchSuggestions';
import { useReconciliationData } from '@/hooks/useReconciliationData';
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ReconciliationFilters {
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  customerId: string | null;
  status: 'all' | 'unreconciled' | 'reconciled';
}

const ReconciliationPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
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
    customerMap,
    isLoading, 
    refetch 
  } = useReconciliationData(filters);

  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);

  // Fetch AI suggestions when data changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!user || invoices.length === 0 || payments.length === 0) {
        setSuggestions([]);
        return;
      }

      // Only get unallocated payments and unpaid invoices
      const unallocatedPayments = payments.filter(p => !p.invoice_id);
      const unpaidInvoices = invoices.filter(i => 
        i.status !== 'paid' && i.status !== 'cancelled'
      );

      if (unallocatedPayments.length === 0 || unpaidInvoices.length === 0) {
        setSuggestions([]);
        return;
      }

      setIsSuggestionsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('finance-ai-match-suggestions', {
          body: {
            invoices: unpaidInvoices,
            payments: unallocatedPayments,
            customerMap,
          }
        });

        if (error) throw error;

        setSuggestions(data?.suggestions || []);
      } catch (error) {
        console.error('Error fetching AI suggestions:', error);
        toast({
          title: "AI Suggestions Failed",
          description: "Could not generate match suggestions. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSuggestionsLoading(false);
      }
    };

    fetchSuggestions();
  }, [invoices, payments, customerMap, user, toast]);

  const handleAcceptSuggestion = async (suggestion: MatchSuggestion) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('payments')
        .update({ invoice_id: suggestion.invoice_id })
        .eq('id', suggestion.payment_id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Remove from suggestions
      setSuggestions(prev => prev.filter(s => 
        s.payment_id !== suggestion.payment_id
      ));

      refetch();
    } catch (error) {
      console.error('Error accepting suggestion:', error);
      throw error;
    }
  };

  const handleRejectSuggestion = (suggestion: MatchSuggestion) => {
    setSuggestions(prev => prev.filter(s => 
      s.payment_id !== suggestion.payment_id
    ));
  };

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
            <div className="space-y-6">
              {/* AI Match Suggestions */}
              <MatchSuggestions 
                suggestions={suggestions}
                onAccept={handleAcceptSuggestion}
                onReject={handleRejectSuggestion}
                isLoading={isSuggestionsLoading}
              />

              {/* Dual Panel */}
              <ReconciliationDualPanel 
                invoices={invoices} 
                payments={payments}
                onReconcile={refetch}
              />
            </div>
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
