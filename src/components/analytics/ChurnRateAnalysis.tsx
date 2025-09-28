
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { UserMinus, AlertTriangle } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

interface ChurnDataPoint {
  month: string;
  churnRate: number;
  churnedCustomers: number;
  totalCustomers: number;
  retentionRate: number;
}

interface ChurnReason {
  name: string;
  value: number;
  color: string;
}

const ChurnRateAnalysis: React.FC = () => {
  const { customers } = useCRM();

  // Generate churn analysis data
  const generateChurnData = (): ChurnDataPoint[] => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('default', { month: 'short' });
      
      // Calculate customer counts for churn analysis
      const totalCustomers = customers.filter(customer => 
        customer.createdAt <= date
      ).length;
      
      // Simulate churn data based on customer lifecycle
      const churnedCustomers = Math.floor(totalCustomers * (0.02 + Math.random() * 0.03)); // 2-5% churn
      const churnRate = totalCustomers > 0 ? (churnedCustomers / totalCustomers) * 100 : 0;
      
      months.push({
        month: monthName,
        churnRate: Math.round(churnRate * 100) / 100,
        churnedCustomers: churnedCustomers,
        totalCustomers: totalCustomers,
        retentionRate: 100 - churnRate,
      });
    }
    
    return months;
  };

  // Generate churn reasons data
  const churnReasons: ChurnReason[] = [
    { name: 'Poor Service', value: 35, color: '#ef4444' },
    { name: 'Price Concerns', value: 28, color: '#f97316' },
    { name: 'Feature Gaps', value: 20, color: '#eab308' },
    { name: 'Competition', value: 17, color: '#3b82f6' },
  ];

  const churnData = useMemo(() => generateChurnData(), [customers]);
  const averageChurnRate = useMemo(() => 
    churnData.reduce((sum, month) => sum + month.churnRate, 0) / churnData.length, 
    [churnData]
  );
  const currentChurnRate = churnData[churnData.length - 1]?.churnRate || 0;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserMinus className="h-5 w-5 text-red-600" />
            Churn Rate Trend
          </CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <span>Current: {currentChurnRate.toFixed(1)}%</span>
            <span>Average: {averageChurnRate.toFixed(1)}%</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={churnData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value}%`,
                    name === 'churnRate' ? 'Churn Rate' : 'Retention Rate'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="churnRate" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  name="churnRate"
                />
                <Line 
                  type="monotone" 
                  dataKey="retentionRate" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="retentionRate"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Churned</p>
              <p className="text-lg font-bold text-red-600">
                {churnData.reduce((sum, month) => sum + month.churnedCustomers, 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Risk Level</p>
              <p className={`text-lg font-bold ${currentChurnRate > 4 ? 'text-red-600' : currentChurnRate > 2 ? 'text-yellow-600' : 'text-green-600'}`}>
                {currentChurnRate > 4 ? 'High' : currentChurnRate > 2 ? 'Medium' : 'Low'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Churn Reasons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={churnReasons}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {churnReasons.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-2 mt-4 pt-4 border-t">
            {churnReasons.map((reason, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: reason.color }}
                  />
                  <span className="text-sm">{reason.name}</span>
                </div>
                <span className="text-sm font-medium">{reason.value}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default React.memo(ChurnRateAnalysis);
