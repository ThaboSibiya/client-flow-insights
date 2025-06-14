
import React from 'react';

const ChartDefinitions = () => {
  return (
    <defs>
      <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#1E40AF" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#1E40AF" stopOpacity={0.3} />
      </linearGradient>
      <linearGradient id="colorExisting" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#059669" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#059669" stopOpacity={0.3} />
      </linearGradient>
      <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#64748B" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#64748B" stopOpacity={0.3} />
      </linearGradient>
      <linearGradient id="colorFinalised" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.3} />
      </linearGradient>
      <linearGradient id="colorConversion" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#1F2937" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#1F2937" stopOpacity={0.3} />
      </linearGradient>
      <linearGradient id="colorUrgent" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#DC2626" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#DC2626" stopOpacity={0.3} />
      </linearGradient>
      <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#EA580C" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#EA580C" stopOpacity={0.3} />
      </linearGradient>
      <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#0369A1" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#0369A1" stopOpacity={0.3} />
      </linearGradient>
      <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#16A34A" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#16A34A" stopOpacity={0.3} />
      </linearGradient>
    </defs>
  );
};

export default ChartDefinitions;
