
import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { revenueOptimizationService, PaymentReminderConfig, UpsellTrigger } from '@/services/revenueOptimizationService';
import { QuoteInvoice } from '@/types/quote';
import { toast } from '@/hooks/use-toast';

export const useRevenueOptimization = () => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [upsellOpportunities, setUpsellOpportunities] = useState<UpsellTrigger[]>([]);
  const [revenueMetrics, setRevenueMetrics] = useState<any>(null);

  // Auto-convert quote to invoice
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
        return invoice;
      } else {
        toast({
          title: "Conversion Failed",
          description: "Unable to convert quote to invoice. Please check the quote status.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error converting quote to invoice:', error);
      toast({
        title: "Error",
        description: "An error occurred while converting the quote to invoice.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
    
    return null;
  }, [user]);

  // Check and process overdue invoices
  const processOverdueInvoices = useCallback(async () => {
    if (!user) return [];
    
    setIsProcessing(true);
    try {
      const overdueInvoices = await revenueOptimizationService.checkOverdueInvoices();
      
      if (overdueInvoices.length > 0) {
        // Notify finance team
        await revenueOptimizationService.notifyFinanceTeam(overdueInvoices);
        
        toast({
          title: "Overdue Invoices Found",
          description: `${overdueInvoices.length} overdue invoices identified. Finance team has been notified.`,
          variant: "destructive",
        });
      }
      
      return overdueInvoices;
    } catch (error) {
      console.error('Error processing overdue invoices:', error);
      toast({
        title: "Error",
        description: "An error occurred while processing overdue invoices.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsProcessing(false);
    }
  }, [user]);

  // Generate payment reminders
  const generatePaymentReminders = useCallback(async (config: PaymentReminderConfig) => {
    if (!user) return [];
    
    setIsProcessing(true);
    try {
      const reminders = await revenueOptimizationService.generatePaymentReminders(config);
      
      if (reminders.length > 0) {
        toast({
          title: "Payment Reminders Generated",
          description: `${reminders.length} payment reminders have been scheduled.`,
        });
      }
      
      return reminders;
    } catch (error) {
      console.error('Error generating payment reminders:', error);
      toast({
        title: "Error",
        description: "An error occurred while generating payment reminders.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsProcessing(false);
    }
  }, [user]);

  // Load upsell opportunities
  const loadUpsellOpportunities = useCallback(async () => {
    if (!user) return;
    
    setIsProcessing(true);
    try {
      const opportunities = await revenueOptimizationService.identifyUpsellOpportunities(user.id);
      setUpsellOpportunities(opportunities);
      
      if (opportunities.length > 0) {
        toast({
          title: "Upsell Opportunities Found",
          description: `${opportunities.length} potential upselling opportunities identified.`,
        });
      }
    } catch (error) {
      console.error('Error loading upsell opportunities:', error);
      toast({
        title: "Error",
        description: "An error occurred while loading upsell opportunities.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [user]);

  // Load revenue metrics
  const loadRevenueMetrics = useCallback(async (dateRange?: { start: Date; end: Date }) => {
    if (!user) return;
    
    setIsProcessing(true);
    try {
      const metrics = await revenueOptimizationService.calculateRevenueMetrics(user.id, dateRange);
      setRevenueMetrics(metrics);
    } catch (error) {
      console.error('Error loading revenue metrics:', error);
      toast({
        title: "Error",
        description: "An error occurred while loading revenue metrics.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [user]);

  return {
    isProcessing,
    upsellOpportunities,
    revenueMetrics,
    convertQuoteToInvoice,
    processOverdueInvoices,
    generatePaymentReminders,
    loadUpsellOpportunities,
    loadRevenueMetrics,
  };
};
