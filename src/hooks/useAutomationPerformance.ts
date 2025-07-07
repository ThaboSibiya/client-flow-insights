
import { useState, useEffect } from 'react';

interface AutomationStats {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  queueSize: number;
  activeAutomations: number;
  batchQueueSizes: Record<string, number>;
  cacheSize: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

export const useAutomationPerformance = () => {
  const [stats, setStats] = useState<AutomationStats>({
    totalExecutions: 1247,
    successfulExecutions: 1186,
    failedExecutions: 61,
    averageExecutionTime: 2.3,
    queueSize: 12,
    activeAutomations: 8,
    batchQueueSizes: {
      'customer-progression': 5,
      'ticket-escalation': 3,
      'email-automation': 7,
      'notification-queue': 15
    },
    cacheSize: 2048,
    systemHealth: 'healthy'
  });

  const [isLoading, setIsLoading] = useState(false);

  const refreshStats = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update with mock data
    setStats(prev => ({
      ...prev,
      totalExecutions: prev.totalExecutions + Math.floor(Math.random() * 10),
      queueSize: Math.floor(Math.random() * 20),
      averageExecutionTime: +(Math.random() * 5).toFixed(1)
    }));
    
    setIsLoading(false);
  };

  const clearCache = async () => {
    setStats(prev => ({ ...prev, cacheSize: 0 }));
    console.log('Cache cleared');
  };

  useEffect(() => {
    // Set up periodic refresh
    const interval = setInterval(refreshStats, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    isLoading,
    refreshStats,
    clearCache
  };
};
