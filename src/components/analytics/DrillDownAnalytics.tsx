
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ChevronDown, ChevronRight, ArrowLeft, TrendingUp } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

interface DrillPath {
  level: string;
  filter: string;
  data: any[];
}

const DrillDownAnalytics = () => {
  const { customers } = useCRM();
  const [drillPath, setDrillPath] = useState<DrillPath[]>([]);
  const [currentLevel, setCurrentLevel] = useState<'overview' | 'status' | 'monthly' | 'daily'>('overview');

  // Generate overview data
  const getOverviewData = () => {
    const statusCounts = customers.reduce((acc, customer) => {
      acc[customer.status] = (acc[customer.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'New', value: statusCounts['new'] || 0, type: 'status' },
      { name: 'Existing', value: statusCounts['existing'] || 0, type: 'status' },
      { name: 'Pending', value: statusCounts['pending'] || 0, type: 'status' },
      { name: 'Finalised', value: statusCounts['finalised'] || 0, type: 'status' },
    ];
  };

  // Generate monthly breakdown for a specific status
  const getMonthlyData = (status: string) => {
    const monthlyData = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('default', { month: 'short' });
      
      const count = customers.filter(customer => {
        const customerMonth = customer.createdAt.getMonth();
        const customerYear = customer.createdAt.getFullYear();
        return customer.status === status && 
               customerMonth === date.getMonth() && 
               customerYear === date.getFullYear();
      }).length;
      
      monthlyData.push({
        name: monthName,
        value: count,
        type: 'monthly'
      });
    }
    
    return monthlyData;
  };

  // Generate daily breakdown for a specific month
  const getDailyData = (status: string, month: number) => {
    const dailyData = [];
    const daysInMonth = new Date(new Date().getFullYear(), month + 1, 0).getDate();
    
    for (let day = 1; day <= Math.min(daysInMonth, 7); day++) {
      const count = customers.filter(customer => {
        const customerDate = customer.createdAt.getDate();
        const customerMonth = customer.createdAt.getMonth();
        return customer.status === status && 
               customerMonth === month && 
               customerDate === day;
      }).length;
      
      dailyData.push({
        name: `Day ${day}`,
        value: count,
        type: 'daily'
      });
    }
    
    return dailyData;
  };

  const handleDrillDown = (data: any) => {
    if (currentLevel === 'overview' && data.type === 'status') {
      const monthlyData = getMonthlyData(data.name.toLowerCase());
      setDrillPath([...drillPath, { level: 'Status', filter: data.name, data: getOverviewData() }]);
      setCurrentLevel('monthly');
      setCurrentData(monthlyData);
    } else if (currentLevel === 'monthly' && data.type === 'monthly') {
      const monthIndex = new Date(`${data.name} 1, 2024`).getMonth();
      const dailyData = getDailyData(drillPath[drillPath.length - 1]?.filter.toLowerCase() || 'new', monthIndex);
      setDrillPath([...drillPath, { level: 'Monthly', filter: data.name, data: currentData }]);
      setCurrentLevel('daily');
      setCurrentData(dailyData);
    }
  };

  const handleDrillUp = () => {
    if (drillPath.length > 0) {
      const previousLevel = drillPath[drillPath.length - 1];
      setCurrentData(previousLevel.data);
      setDrillPath(drillPath.slice(0, -1));
      
      if (drillPath.length === 1) {
        setCurrentLevel('overview');
      } else if (drillPath.length === 2) {
        setCurrentLevel('monthly');
      }
    }
  };

  const [currentData, setCurrentData] = useState(getOverviewData());

  const getCurrentTitle = () => {
    if (drillPath.length === 0) return 'Customer Overview';
    const filters = drillPath.map(p => p.filter).join(' > ');
    return `Customer Analysis: ${filters}`;
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            {getCurrentTitle()}
          </CardTitle>
          {drillPath.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleDrillUp}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
        </div>
        
        {drillPath.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Drill path:</span>
            {drillPath.map((path, index) => (
              <React.Fragment key={index}>
                <Badge variant="secondary">{path.filter}</Badge>
                {index < drillPath.length - 1 && <ChevronRight className="h-3 w-3" />}
              </React.Fragment>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="h-64 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            {currentLevel === 'daily' ? (
              <LineChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            ) : (
              <BarChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="value" 
                  fill="#3b82f6" 
                  cursor="pointer"
                  onClick={handleDrillDown}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
        
        <div className="text-sm text-muted-foreground text-center">
          {currentLevel !== 'daily' && (
            <p className="flex items-center justify-center gap-1">
              <ChevronDown className="h-3 w-3" />
              Click on bars to drill down for more details
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DrillDownAnalytics;
