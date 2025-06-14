
import { useState, useEffect } from 'react';
import { automationPerformanceService } from '@/services/automationPerformanceService';

export const useAutomationPerformance = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    runningJobs: 0,
    pendingJobs: 0,
    failedJobs: 0,
    cacheSize: 0,
    batchQueueSizes: {}
  });
  const [isLoading, setIsLoading] = useState(false);

  const refreshStats = () => {
    const currentStats = automationPerformanceService.getQueueStats();
    setStats(currentStats);
  };

  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 2000); // Update every 2 seconds
    
    return () => clearInterval(interval);
  }, []);

  const executeAutomation = async (automationId: string, triggerData: any, priority: 'low' | 'medium' | 'high' = 'medium') => {
    setIsLoading(true);
    
    try {
      const jobId = automationPerformanceService.addJob({
        automationId,
        type: 'trigger',
        data: triggerData,
        priority,
        maxRetries: 3
      });
      
      console.log(`Automation ${automationId} queued with job ID: ${jobId}`);
      refreshStats();
      return jobId;
    } catch (error) {
      console.error('Failed to execute automation:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = (pattern?: string) => {
    automationPerformanceService.clearCache(pattern);
    refreshStats();
  };

  return {
    stats,
    isLoading,
    executeAutomation,
    clearCache,
    refreshStats
  };
};
