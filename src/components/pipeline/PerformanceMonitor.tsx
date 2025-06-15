
import React from 'react';
import { useAutomationPerformance } from '@/hooks/useAutomationPerformance';
import PerformanceMonitorHeader from './performance/PerformanceMonitorHeader';
import QueueHealthCard from './performance/QueueHealthCard';
import QueueStatsGrid from './performance/QueueStatsGrid';
import BatchQueuesCard from './performance/BatchQueuesCard';
import CacheStatsCard from './performance/CacheStatsCard';

const PerformanceMonitor = () => {
  const { stats, isLoading, clearCache, refreshStats } = useAutomationPerformance();

  return (
    <div className="space-y-6">
      <PerformanceMonitorHeader
        isLoading={isLoading}
        onClearCache={() => clearCache()}
        onRefresh={refreshStats}
      />

      <QueueHealthCard stats={stats} />

      <QueueStatsGrid stats={stats} />

      <BatchQueuesCard batchQueueSizes={stats.batchQueueSizes} />
      
      <CacheStatsCard cacheSize={stats.cacheSize} />
    </div>
  );
};

export default PerformanceMonitor;
