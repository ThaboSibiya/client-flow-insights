
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MapPin, Trophy } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

const RegionalPerformance = () => {
  const { customers } = useCRM();

  // Generate regional performance data
  const generateRegionalData = () => {
    const regions = [
      { name: 'North America', customers: 0, revenue: 0, conversionRate: 0 },
      { name: 'Europe', customers: 0, revenue: 0, conversionRate: 0 },
      { name: 'Asia Pacific', customers: 0, revenue: 0, conversionRate: 0 },
      { name: 'Latin America', customers: 0, revenue: 0, conversionRate: 0 },
      { name: 'Middle East', customers: 0, revenue: 0, conversionRate: 0 },
    ];

    // Distribute customers across regions (simulate based on existing customer data)
    customers.forEach((customer, index) => {
      const regionIndex = index % regions.length;
      regions[regionIndex].customers += 1;
      
      // Calculate revenue based on customer status
      if (customer.status === 'finalised') {
        regions[regionIndex].revenue += 2500; // Average deal size
      }
    });

    // Calculate conversion rates and add colors
    return regions.map((region, index) => ({
      ...region,
      conversionRate: region.customers > 0 ? Math.round((region.revenue / (region.customers * 2500)) * 100) : 0,
      color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index],
    }));
  };

  // Generate top performing cities data
  const generateCityData = () => {
    return [
      { name: 'New York', customers: Math.floor(customers.length * 0.15), revenue: Math.floor(customers.length * 0.15 * 2500 * 0.8) },
      { name: 'London', customers: Math.floor(customers.length * 0.12), revenue: Math.floor(customers.length * 0.12 * 2500 * 0.75) },
      { name: 'Tokyo', customers: Math.floor(customers.length * 0.10), revenue: Math.floor(customers.length * 0.10 * 2500 * 0.85) },
      { name: 'Singapore', customers: Math.floor(customers.length * 0.08), revenue: Math.floor(customers.length * 0.08 * 2500 * 0.90) },
      { name: 'Sydney', customers: Math.floor(customers.length * 0.07), revenue: Math.floor(customers.length * 0.07 * 2500 * 0.70) },
    ];
  };

  const regionalData = generateRegionalData();
  const cityData = generateCityData();
  const totalRevenue = regionalData.reduce((sum, region) => sum + region.revenue, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              Regional Revenue Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionalData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'revenue' ? `$${value.toLocaleString()}` : value,
                      name === 'revenue' ? 'Revenue' : name === 'customers' ? 'Customers' : 'Conversion Rate'
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-gold-600" />
              Regional Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={regionalData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="customers"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {regionalData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} customers`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Top Performing Cities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cityData.map((city, index) => (
              <div key={city.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{city.name}</p>
                    <p className="text-sm text-gray-600">{city.customers} customers</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">${city.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Revenue</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-lg font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Top Region</p>
                <p className="text-lg font-bold text-blue-600">
                  {regionalData.sort((a, b) => b.revenue - a.revenue)[0]?.name || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Best Conversion</p>
                <p className="text-lg font-bold text-purple-600">
                  {regionalData.sort((a, b) => b.conversionRate - a.conversionRate)[0]?.conversionRate || 0}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegionalPerformance;
