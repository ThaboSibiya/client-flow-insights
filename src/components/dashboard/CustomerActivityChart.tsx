
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartProps {
  data: {
    name: string;
    new: number;
    existing: number;
    pending: number;
    finalised: number;
  }[];
}

const CustomerActivityChart = ({ data }: ChartProps) => {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Monthly Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="new" stackId="a" fill="#3182CE" name="New" />
              <Bar dataKey="existing" stackId="a" fill="#38B2AC" name="Existing" />
              <Bar dataKey="pending" stackId="a" fill="#DD6B20" name="Pending" />
              <Bar dataKey="finalised" stackId="a" fill="#48BB78" name="Finalised" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerActivityChart;
