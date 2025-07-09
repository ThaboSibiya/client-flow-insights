
import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { QuoteInvoice } from '@/types/quote';
import { revenueOptimizationService, UpsellTrigger } from '@/services/revenueOptimizationService';
import { toast } from '@/hooks/use-toast';

interface RevenueMetrics {
  totalRevenue: number;
  monthlyGrowth: number;
  averageDealSize: number;
  conversionRate: number;
  pendingRevenue: number;
  overdueAmount: number;
  paymentCollectionRate: number;
  overdueInvoices: number;
  totalQuotes: number;
  acceptedQuotes: number;
  quoteAcceptanceRate: number;
  totalInvoices: number;
  paidInvoices: number;
}

export const useRevenueOptimization = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [upsellOpportunities, setUpsellOpportunities] = useState<UpsellTrigger[]>([]);
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics>({
    totalRevenue: 0,
    monthlyGrowth: 0,
    averageDealSize: 0,
    conversionRate: 0,
    pendingRevenue: 0,
    overdueAmount: 0,
    paymentCollectionRate: 0,
    overdueInvoices: 0,
    totalQuotes: 0,
    acceptedQuotes: 0,
    quoteAcceptanceRate: 0,
    totalInvoices: 0,
    paidInvoices: 0,
  });

  const convertQuoteToInvoiceMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      const result = await revenueOptimizationService.autoConvertQuoteToInvoice(quoteId);
      if (!result) {
        throw new Error('Failed to convert quote to invoice');
      }
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Quote converted to invoice successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to convert quote to invoice",
        variant: "destructive",
      });
    },
  });

  const processOverdueInvoices = useCallback(async () => {
    setIsProcessing(true);
    try {
      const overdueInvoices = await revenueOptimizationService.checkOverdueInvoices();
      await revenueOptimizationService.notifyFinanceTeam(overdueInvoices);
      
      toast({
        title: "Success",
        description: `Processed ${overdueInvoices.length} overdue invoices`,
      });
      
      return overdueInvoices;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process overdue invoices",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const generatePaymentReminders = useCallback(async () => {
    setIsProcessing(true);
    try {
      const reminderConfig = {
        enabled: true,
        reminderDays: [3, 7, 14],
        template: 'default',
        escalateToFinance: true,
      };
      
      const reminders = await revenueOptimizationService.generatePaymentReminders(reminderConfig);
      
      toast({
        title: "Success",
        description: `Generated ${reminders.length} payment reminders`,
      });
      
      return reminders;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate payment reminders",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const loadUpsellOpportunities = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const opportunities = await revenueOptimizationService.identifyUpsellOpportunities(userId);
      setUpsellOpportunities(opportunities);
      return opportunities;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load upsell opportunities",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadRevenueMetrics = useCallback(async (userId: string, dateRange?: { start: Date; end: Date }) => {
    setIsLoading(true);
    try {
      const metrics = await revenueOptimizationService.calculateRevenueMetrics(userId, dateRange);
      if (metrics) {
        setRevenueMetrics(metrics);
      }
      return metrics;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load revenue metrics",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    convertQuoteToInvoice: convertQuoteToInvoiceMutation.mutateAsync,
    isConverting: convertQuoteToInvoiceMutation.isPending,
    isProcessing,
    isLoading,
    upsellOpportunities,
    revenueMetrics,
    processOverdueInvoices,
    generatePaymentReminders,
    loadUpsellOpportunities,
    loadRevenueMetrics,
  };
};
