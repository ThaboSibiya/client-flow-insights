
import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { QuoteInvoice } from '@/types/quote';
import { toast } from '@/hooks/use-toast';

export interface RevenueMetrics {
  totalRevenue: number;
  monthlyGrowth: number;
  averageDealSize: number;
  conversionRate: number;
  pendingRevenue: number;
  overdueAmount: number;
  totalQuotes: number;
  acceptedQuotes: number;
  totalInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  quoteAcceptanceRate: number;
  paymentCollectionRate: number;
}

export interface UpsellTrigger {
  id: string;
  type: 'service_upgrade' | 'volume_discount' | 'cross_sell' | 'renewal_opportunity';
  priority: 'low' | 'medium' | 'high';
  trigger: string;
  recommendation: string;
  potentialValue: number;
  customerId: string;
  customerName: string;
  lastInteraction: Date;
  confidence: number;
}

export interface PaymentReminderConfig {
  enabled: boolean;
  reminderDays: number[];
  template: string;
  escalateToFinance: boolean;
}

export const useRevenueOptimization = () => {
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics>({
    totalRevenue: 0,
    monthlyGrowth: 0,
    averageDealSize: 0,
    conversionRate: 0,
    pendingRevenue: 0,
    overdueAmount: 0,
    totalQuotes: 0,
    acceptedQuotes: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    overdueInvoices: 0,
    quoteAcceptanceRate: 0,
    paymentCollectionRate: 0,
  });
  
  const [upsellOpportunities, setUpsellOpportunities] = useState<UpsellTrigger[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const convertQuoteToInvoiceMutation = useMutation({
    mutationFn: async (quoteId: string): Promise<QuoteInvoice> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock converted invoice
      return {
        id: `inv-${Date.now()}`,
        number: `INV-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        type: 'invoice',
        status: 'draft',
        customer_name: 'Converted Customer',
        customer_email: 'customer@example.com',
        total: 1000,
        subtotal: 900,
        tax: 100,
        discount: 0,
        issue_date: new Date().toISOString(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'user-1',
        customer_id: 'customer-1',
        subject: 'Converted Invoice',
        notes: 'Converted from quote',
        terms: 'Standard terms'
      } as QuoteInvoice;
    },
    onSuccess: (invoice) => {
      toast({
        title: "Quote Converted",
        description: `Successfully converted to invoice ${invoice.number}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Conversion Failed",
        description: "Failed to convert quote to invoice",
        variant: "destructive",
      });
    },
  });

  const loadRevenueMetrics = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockMetrics: RevenueMetrics = {
        totalRevenue: 125000,
        monthlyGrowth: 12.5,
        averageDealSize: 2500,
        conversionRate: 65.2,
        pendingRevenue: 35000,
        overdueAmount: 8500,
        totalQuotes: 45,
        acceptedQuotes: 32,
        totalInvoices: 28,
        paidInvoices: 25,
        overdueInvoices: 3,
        quoteAcceptanceRate: 71.1,
        paymentCollectionRate: 89.3,
      };
      
      setRevenueMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to load revenue metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadUpsellOpportunities = useCallback(async () => {
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockOpportunities: UpsellTrigger[] = [
        {
          id: '1',
          type: 'service_upgrade',
          priority: 'high',
          trigger: 'high_usage',
          recommendation: 'Upgrade to Premium Plan',
          potentialValue: 5000,
          customerId: 'cust-1',
          customerName: 'Acme Corp',
          lastInteraction: new Date(),
          confidence: 85
        }
      ];
      
      setUpsellOpportunities(mockOpportunities);
    } catch (error) {
      console.error('Failed to load upsell opportunities:', error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const processOverdueInvoices = useCallback(async () => {
    setIsProcessing(true);
    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Processing Complete",
        description: "Overdue invoices have been processed and reminders sent",
      });
    } catch (error) {
      toast({
        title: "Processing Failed",
        description: "Failed to process overdue invoices",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const generatePaymentReminders = useCallback(async (config: PaymentReminderConfig) => {
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Reminders Generated",
        description: "Payment reminders have been generated and scheduled",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate payment reminders",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    revenueMetrics,
    upsellOpportunities,
    isProcessing,
    isLoading,
    convertQuoteToInvoice: convertQuoteToInvoiceMutation.mutateAsync,
    isConverting: convertQuoteToInvoiceMutation.isPending,
    loadRevenueMetrics,
    loadUpsellOpportunities,
    processOverdueInvoices,
    generatePaymentReminders,
  };
};
