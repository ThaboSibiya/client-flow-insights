
import React from 'react';

interface MetricData {
  id: string;
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  change: { value: number; isPositive: boolean };
}

interface SwipeableMetricsCardsProps {
  metrics: MetricData[];
}

const SwipeableMetricsCards: React.FC<SwipeableMetricsCardsProps> = ({ metrics }) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className={`${metric.color} p-6 rounded-lg shadow-md min-w-[200px]`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white text-lg font-semibold">{metric.title}</h3>
              <p className="text-white text-2xl font-bold mt-2">{metric.value}</p>
            </div>
            <div className="text-white">
              {metric.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SwipeableMetricsCards;
