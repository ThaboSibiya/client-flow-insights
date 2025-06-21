
import { useState, useEffect, useCallback } from 'react';
import { slaService, SLAStatus, SLAMetrics } from '@/services/slaService';
import { toast } from '@/hooks/use-toast';

export const useSLAManagement = () => {
  const [slaStatuses, setSlaStatuses] = useState<Record<string, SLAStatus>>({});
  const [slaMetrics, setSlaMetrics] = useState<SLAMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate SLA status for a single ticket
  const calculateTicketSLA = useCallback((ticket: any): SLAStatus => {
    return slaService.calculateSLAStatus(ticket);
  }, []);

  // Update SLA status for multiple tickets
  const updateSLAStatuses = useCallback((tickets: any[]) => {
    const statuses: Record<string, SLAStatus> = {};
    tickets.forEach(ticket => {
      statuses[ticket.id] = calculateTicketSLA(ticket);
    });
    setSlaStatuses(statuses);
  }, [calculateTicketSLA]);

  // Load SLA metrics
  const loadSLAMetrics = useCallback(async (dateRange?: { start: Date; end: Date }) => {
    setIsLoading(true);
    try {
      const metrics = await slaService.getSLAMetrics(dateRange);
      setSlaMetrics(metrics);
    } catch (error) {
      console.error('Failed to load SLA metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load SLA metrics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check for SLA breaches
  const checkSLABreaches = useCallback(async () => {
    try {
      await slaService.checkSLABreaches();
    } catch (error) {
      console.error('Failed to check SLA breaches:', error);
    }
  }, []);

  // Set up periodic SLA monitoring
  useEffect(() => {
    // Check SLA breaches every 5 minutes
    const breachInterval = setInterval(checkSLABreaches, 5 * 60 * 1000);

    // Update SLA statuses every minute for countdown timers
    const statusInterval = setInterval(() => {
      setSlaStatuses(prevStatuses => {
        const updatedStatuses = { ...prevStatuses };
        Object.keys(updatedStatuses).forEach(ticketId => {
          // Recalculate time remaining for existing statuses
          const status = updatedStatuses[ticketId];
          const now = new Date();
          status.timeToResponse = Math.max(0, (status.responseDeadline.getTime() - now.getTime()) / (1000 * 60));
          status.timeToResolution = Math.max(0, (status.resolutionDeadline.getTime() - now.getTime()) / (1000 * 60));
        });
        return updatedStatuses;
      });
    }, 60 * 1000);

    return () => {
      clearInterval(breachInterval);
      clearInterval(statusInterval);
    };
  }, [checkSLABreaches]);

  // Initial load of metrics
  useEffect(() => {
    loadSLAMetrics();
  }, [loadSLAMetrics]);

  return {
    slaStatuses,
    slaMetrics,
    isLoading,
    calculateTicketSLA,
    updateSLAStatuses,
    loadSLAMetrics,
    checkSLABreaches,
    formatTimeRemaining: slaService.formatTimeRemaining,
    getStatusColor: slaService.getStatusColor,
    getSLAConfig: slaService.getSLAConfig
  };
};
