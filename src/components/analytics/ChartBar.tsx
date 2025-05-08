
import React from 'react';
import { Bar } from 'recharts';

interface ChartBarProps {
  yAxisId: string;
  dataKey: string;
  fill: string;
  name: string;
  barSize: number;
  radius?: number | [number, number, number, number];
}

const ChartBar: React.FC<ChartBarProps> = ({ 
  yAxisId, 
  dataKey, 
  fill, 
  name, 
  barSize,
  radius = [4, 4, 0, 0] 
}) => {
  return (
    <Bar 
      yAxisId={yAxisId} 
      dataKey={dataKey} 
      fill={fill} 
      name={name} 
      barSize={barSize} 
      radius={radius} 
    />
  );
};

export default ChartBar;
