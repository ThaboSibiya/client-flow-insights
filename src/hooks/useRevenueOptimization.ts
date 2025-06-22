
import { useState, useCallback, useMemo } from 'react';
import { revenueOptimizationService, UpsellTrigger } from '@/services/revenueOptimizationService';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

export const useRevenueOptimization = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  // Cache revenue metrics with React Query
  const { data: revenueMetrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ['revenue-metrics', user?.id],
    queryFn: () => user ? revenueOptimizationService.calculateRevenueMetrics(user.id) : null,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Cache upsell opportunities
  const { data: upsellOpportunities = [], isLoading: upsellLoading, refetch: refetchUpsell } = useQuery({
    queryKey: ['upsell-opportunities', user?.id],
    queryFn: () => user ? revenueOptimizationService.identifyUpsellOpportunities(user.id) : [],
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
  });

  const loadRevenueMetrics = useCallback(async () => {
    await refetchMetrics();
  }, [refetchMetrics]);

  const loadUpsellOpportunities = useCallback(async () => {
    await refetchUpsell();
  }, [refetchUpsell]);

  const processOverdueInvoices = useCallback(async () => {
    if (!user) return;
    
    setIsProcessing(true);
    try {
      const overdueInvoices = await revenueOptimizationService.checkOverdueInvoices();
      
      if (overdueInvoices.length > 0) {
        await revenueOptimizationService.notifyFinanceTeam(overdueInvoices);
        toast({
          title: "Overdue Invoices Processed",
          description: `${overdueInvoices.length} overdue invoices found and finance team notified.`,
        });
      } else {
        toast({
          title: "No Overdue Invoices",
          description: "All invoices are up to date.",
        });
      }
      
      // Invalidate and refetch metrics
      queryClient.invalidateQueries({ queryKey: ['revenue-metrics', user.id] });
    } catch (error) {
      console.error('Error processing overdue invoices:', error);
      toast({
        title: "Error",
        description: "Failed to process overdue invoices.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [user, queryClient]);

  const generatePaymentReminders = useCallback(async (reminderConfig: any) => {
    if (!user) return;
    
    setIsProcessing(true);
    try {
      const reminders = await revenueOptimizationService.generatePaymentReminders(reminderConfig);
      
      toast({
        title: "Payment Reminders Generated",
        description: `${reminders.length} payment reminders have been queued.`,
      });
    } catch (error) {
      console.error('Error generating payment reminders:', error);
      toast({
        title: "Error",
        description: "Failed to generate payment reminders.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [user]);

  const convertQuoteToInvoice = useCallback(async (quoteId: string) => {
    if (!user) return null;
    
    setIsProcessing(true);
    try {
      const invoice = await revenueOptimizationService.autoConvertQuoteToInvoice(quoteId);
      
      if (invoice) {
        toast({
          title: "Quote Converted",
          description: `Quote has been successfully converted to Invoice ${invoice.number}`,
        });
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['quotes_invoices'] });
        queryClient.invalidateQueries({ queryKey: ['revenue-metrics', user.id] });
      }
      
      return invoice;
    } catch (error) {
      console.error('Error converting quote to invoice:', error);
      toast({
        title: "Error",
        description: "Failed to convert quote to invoice.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [user, queryClient]);

  // Memoize the loading state
  const isLoading = useMemo(() => {
    return metricsLoading || upsellLoading;
  }, [metricsLoading, upsellLoading]);

  return {
    revenueMetrics,
    upsellOpportunities,
    isLoading,
    isProcessing,
    loadRevenueMetrics,
    loadUpsellOpportunities,
    processOverdueInvoices,
    generatePaymentReminders,
    convertQuoteToInvoice,
  };
};
