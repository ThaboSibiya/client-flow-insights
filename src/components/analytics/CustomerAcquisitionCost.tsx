
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

const CustomerAcquisitionCost = () => {
  const { customers } = useCRM();

  // Generate CAC data based on customer acquisition patterns
  const generateCACData = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('default', { month: 'short' });
      
      // Count new customers for this month
      const newCustomers = customers.filter(customer => {
        const customerMonth = customer.createdAt.getMonth();
        const customerYear = customer.createdAt.getFullYear();
        return customerMonth === date.getMonth() && customerYear === date.getFullYear();
      }).length;
      
      // Simulate marketing spend and calculate CAC
      const marketingSpend = Math.max(newCustomers * 150 + Math.random() * 500, 200);
      const cac = newCustomers > 0 ? Math.round(marketingSpend / newCustomers) : 0;
      
      months.push({
        month: monthName,
        cac: cac,
        marketingSpend: Math.round(marketingSpend),
        newCustomers: newCustomers,
      });
    }
    
    return months;
  };

  const cacData = generateCACData();
  const averageCAC = Math.round(cacData.reduce((sum, month) => sum + month.cac, 0) / cacData.length);
  const trend = cacData[cacData.length - 1]?.cac > cacData[cacData.length - 2]?.cac ? 'up' : 'down';

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-quikle-primary" />
          Customer Acquisition Cost (CAC)
        </CardTitle>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span>Average CAC: R{averageCAC}</span>
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-quikle-neutral" />
            ) : (
              <TrendingDown className="h-4 w-4 text-quikle-accent" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cacData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `R${value}`} />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'cac' ? `R${value}` : 
                  name === 'marketingSpend' ? `R${value}` : value,
                  name === 'cac' ? 'CAC' : 
                  name === 'marketingSpend' ? 'Marketing Spend' : 'New Customers'
                ]}
              />
              <Bar dataKey="cac" fill="#1F2937" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Spend</p>
            <p className="text-lg font-bold text-quikle-primary">
              R{cacData.reduce((sum, month) => sum + month.marketingSpend, 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">New Customers</p>
            <p className="text-lg font-bold text-quikle-accent">
              {cacData.reduce((sum, month) => sum + month.newCustomers, 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">CAC Trend</p>
            <p className={`text-lg font-bold ${trend === 'down' ? 'text-quikle-accent' : 'text-quikle-neutral'}`}>
              {trend === 'down' ? '↓ Improving' : '↑ Rising'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerAcquisitionCost;
