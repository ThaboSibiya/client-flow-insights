
import React from 'react';

interface ChartLegendFormatterProps {
  value: string | number;
}

const ChartLegendFormatter: React.FC<ChartLegendFormatterProps> = ({ value }) => {
  if (value === 'conversionRate') {
    return <span>Conversion Rate</span>;
  }
  
  if (typeof value === 'string') {
    return <span>{value.charAt(0).toUpperCase() + value.slice(1)}</span>;
  }
  
  return <span>{value}</span>;
};

export default ChartLegendFormatter;
