
import React from 'react';

const ChartDefinitions = () => {
  return (
    <defs>
      <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#1F2937" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#1F2937" stopOpacity={0.3} />
      </linearGradient>
      <linearGradient id="colorExisting" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#374151" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#374151" stopOpacity={0.3} />
      </linearGradient>
      <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#9CA3AF" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0.3} />
      </linearGradient>
      <linearGradient id="colorFinalised" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#6B7280" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#6B7280" stopOpacity={0.3} />
      </linearGradient>
      <linearGradient id="colorConversion" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#4B5563" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#4B5563" stopOpacity={0.3} />
      </linearGradient>
    </defs>
  );
};

export default ChartDefinitions;
