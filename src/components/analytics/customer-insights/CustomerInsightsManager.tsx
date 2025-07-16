
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomerInsightsManager = () => {
  const data = [
    { name: 'New', value: 12 },
    { name: 'Existing', value: 45 },
    { name: 'Pending', value: 8 },
    { name: 'Finalised', value: 23 },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Customer Insights</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Customer Status Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CustomerInsightsManager;
