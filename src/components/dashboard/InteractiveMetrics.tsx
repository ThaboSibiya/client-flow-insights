
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const InteractiveMetrics = () => {
  const metrics = [
    { label: 'Revenue', value: '$12,345', change: 12.5, trend: 'up' },
    { label: 'Conversion', value: '8.2%', change: -2.1, trend: 'down' },
    { label: 'Avg Deal Size', value: '$2,456', change: 0, trend: 'stable' },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp size={16} className="text-green-500" />;
      case 'down': return <TrendingDown size={16} className="text-red-500" />;
      default: return <Minus size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
      <div className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className="text-xl font-bold">{metric.value}</p>
            </div>
            <div className="flex items-center gap-1">
              {getTrendIcon(metric.trend)}
              <span className={`text-sm ${metric.change > 0 ? 'text-green-500' : metric.change < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                {metric.change !== 0 ? `${metric.change > 0 ? '+' : ''}${metric.change}%` : '—'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InteractiveMetrics;
