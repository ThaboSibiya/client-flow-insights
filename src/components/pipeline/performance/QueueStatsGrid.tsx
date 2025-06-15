
import React from 'react';
import StatCard from './StatCard';
import { Zap, Clock, CheckCircle, XCircle } from 'lucide-react';

interface QueueStatsGridProps {
  stats: {
    totalJobs: number;
    runningJobs: number;
    pendingJobs: number;
    failedJobs: number;
  };
}

const getStatusColor = (value: number, threshold: number) => {
  if (value === 0) return 'text-gray-500';
  if (value < threshold) return 'text-green-500';
  if (value < threshold * 2) return 'text-yellow-500';
  return 'text-red-500';
};

const QueueStatsGrid = ({ stats }: QueueStatsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        title="Total Jobs"
        value={stats.totalJobs}
        icon={<Zap className="h-8 w-8 text-blue-500" />}
      />
      <StatCard
        title="Running"
        value={stats.runningJobs}
        valueClassName={getStatusColor(stats.runningJobs, 3)}
        icon={<Clock className="h-8 w-8 text-yellow-500" />}
      />
      <StatCard
        title="Pending"
        value={stats.pendingJobs}
        valueClassName={getStatusColor(stats.pendingJobs, 10)}
        icon={<CheckCircle className="h-8 w-8 text-green-500" />}
      />
      <StatCard
        title="Failed"
        value={stats.failedJobs}
        valueClassName={getStatusColor(stats.failedJobs, 2)}
        icon={<XCircle className="h-8 w-8 text-red-500" />}
      />
    </div>
  );
};

export default QueueStatsGrid;
