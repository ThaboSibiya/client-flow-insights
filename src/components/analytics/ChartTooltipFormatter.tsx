
import React from 'react';

interface ChartTooltipFormatterProps {
  active?: boolean;
  payload?: any[];
}

const ChartTooltipFormatter: React.FC<ChartTooltipFormatterProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const tooltipStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '8px',
    padding: '10px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    border: '1px solid rgba(229, 231, 235, 0.5)'
  };

  return (
    <div className="custom-tooltip" style={tooltipStyle}>
      <p className="font-medium">{`${payload[0].payload.name}`}</p>
      <div className="grid gap-1.5 mt-2">
        {payload.map((entry) => {
          let name = entry.name;
          let color = entry.color;
          let value = entry.value;
          
          // Format the name and value
          if (name === 'conversionRate') {
            name = 'Conversion Rate';
            value = `${value}%`;
          } else if (typeof name === 'string') {
            name = name.charAt(0).toUpperCase() + name.slice(1);
          }
          
          return (
            <div key={name} className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }}></div>
              <span className="text-gray-600">{name}:</span>
              <span className="font-medium">{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChartTooltipFormatter;
