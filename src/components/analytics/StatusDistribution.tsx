
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Customer } from '@/context/CRMContext';

interface StatusDistributionProps {
  customers: Customer[];
}

const COLORS = ['#1F2937', '#374151', '#9CA3AF', '#6B7280'];

const StatusDistribution = ({ customers }: StatusDistributionProps) => {
  // Count customers by status
  const statusCounts = customers.reduce((acc, customer) => {
    acc[customer.status] = (acc[customer.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const data = [
    { name: 'New', value: statusCounts['new'] || 0 },
    { name: 'Existing', value: statusCounts['existing'] || 0 },
    { name: 'Pending', value: statusCounts['pending'] || 0 },
    { name: 'Finalised', value: statusCounts['finalised'] || 0 },
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Customer Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip formatter={(value) => [`${value} customers`, 'Count']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusDistribution;
