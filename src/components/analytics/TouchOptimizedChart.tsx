
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ZoomIn, ZoomOut, RotateCcw, TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';

interface TouchOptimizedChartProps {
  data: any[];
  title: string;
  description?: string;
  type?: 'bar' | 'line' | 'combo' | 'pie';
  onDrillDown?: (dataPoint: any) => void;
}

const TouchOptimizedChart = ({ 
  data, 
  title, 
  description, 
  type = 'combo',
  onDrillDown 
}: TouchOptimizedChartProps) => {
  const [chartType, setChartType] = useState(type);
  const [selectedDataPoint, setSelectedDataPoint] = useState<any>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // Touch handling for mobile interactions
  const handleTouchStart = () => {
    setIsDragging(false);
  };

  const handleTouchMove = () => {
    setIsDragging(true);
  };

  const handleTouchEnd = (dataPoint: any) => {
    if (!isDragging && dataPoint && onDrillDown) {
      onDrillDown(dataPoint);
    }
  };

  const handleChartClick = (data: any) => {
    if (data && data.activePayload) {
      const dataPoint = data.activePayload[0]?.payload;
      setSelectedDataPoint(dataPoint);
      if (onDrillDown) {
        onDrillDown(dataPoint);
      }
    }
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setSelectedDataPoint(null);
  };

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  const COLORS = ['#1E40AF', '#059669', '#7C3AED', '#DC2626', '#F59E0B'];

  const renderChart = () => {
    const commonProps = {
      width: '100%',
      height: 300,
      data: data,
      margin: { top: 20, right: 30, left: 20, bottom: 20 },
    };

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <ComposedChart 
              {...commonProps} 
              onClick={handleChartClick}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => handleTouchEnd(selectedDataPoint)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  fontSize: '14px'
                }}
              />
              <Bar dataKey="value" fill="#1E40AF" radius={[4, 4, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <ComposedChart 
              {...commonProps} 
              onClick={handleChartClick}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => handleTouchEnd(selectedDataPoint)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  fontSize: '14px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#1E40AF" 
                strokeWidth={3}
                dot={{ r: 6, strokeWidth: 2 }}
                activeDot={{ r: 8, stroke: '#1E40AF', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer {...commonProps}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                onClick={handleChartClick}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      default: // combo
        return (
          <ResponsiveContainer {...commonProps}>
            <ComposedChart 
              {...commonProps} 
              onClick={handleChartClick}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => handleTouchEnd(selectedDataPoint)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
              <YAxis yAxisId="left" stroke="#6B7280" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="#6B7280" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  fontSize: '14px'
                }}
              />
              <Bar yAxisId="left" dataKey="value" fill="#1E40AF" radius={[4, 4, 0, 0]} />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="trend" 
                stroke="#059669" 
                strokeWidth={3}
                dot={{ r: 5, strokeWidth: 2 }}
                activeDot={{ r: 7, stroke: '#059669', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card className="w-full shadow-md hover:shadow-lg transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedDataPoint && (
            <Badge variant="secondary" className="text-xs">
              Selected: {selectedDataPoint.name}
            </Badge>
          )}
          <div className="hidden md:flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChartType('bar')}
              className={chartType === 'bar' ? 'bg-primary text-primary-foreground' : ''}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChartType('line')}
              className={chartType === 'line' ? 'bg-primary text-primary-foreground' : ''}
            >
              <TrendingUp className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChartType('pie')}
              className={chartType === 'pie' ? 'bg-primary text-primary-foreground' : ''}
            >
              <PieChartIcon className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={zoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={zoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={resetZoom}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          ref={chartRef}
          className="w-full touch-pan-y"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
        >
          {renderChart()}
        </div>
        {selectedDataPoint && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm">Selected Data Point:</h4>
            <p className="text-sm text-muted-foreground">
              {selectedDataPoint.name}: {selectedDataPoint.value}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TouchOptimizedChart;
