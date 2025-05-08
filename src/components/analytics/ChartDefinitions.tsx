
import React from 'react';

const ChartDefinitions = () => {
  return (
    <defs>
      <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.2} />
      </linearGradient>
      <linearGradient id="colorExisting" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.2} />
      </linearGradient>
      <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#F97316" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#F97316" stopOpacity={0.2} />
      </linearGradient>
      <linearGradient id="colorFinalised" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#10B981" stopOpacity={0.2} />
      </linearGradient>
      <linearGradient id="colorConversion" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#D946EF" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#D946EF" stopOpacity={0.2} />
      </linearGradient>
    </defs>
  );
};

export default ChartDefinitions;
