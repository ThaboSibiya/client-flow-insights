
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Award, Clock, Target } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';

const TeamPerformanceMetrics = () => {
  const { customers } = useCRM();

  // Mock team data - in a real app, this would come from a team management system
  const teamMembers = [
    { id: 1, name: 'Alice Johnson', role: 'Senior Sales Rep', avatar: 'AJ' },
    { id: 2, name: 'Bob Smith', role: 'Sales Rep', avatar: 'BS' },
    { id: 3, name: 'Carol Davis', role: 'Account Manager', avatar: 'CD' },
    { id: 4, name: 'David Wilson', role: 'Sales Rep', avatar: 'DW' },
  ];

  // Generate performance data
  const generateTeamData = () => {
    return teamMembers.map(member => {
      const closedDeals = Math.floor(Math.random() * 15) + 5;
      const target = 20;
      const performance = Math.round((closedDeals / target) * 100);
      
      return {
        name: member.name.split(' ')[0],
        closedDeals,
        target,
        performance,
        revenue: closedDeals * 2500,
        avatar: member.avatar,
        role: member.role,
      };
    });
  };

  const teamData = generateTeamData();
  const totalRevenue = teamData.reduce((sum, member) => sum + member.revenue, 0);
  const avgPerformance = Math.round(teamData.reduce((sum, member) => sum + member.performance, 0) / teamData.length);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-broker-primary" />
          Team Performance
        </CardTitle>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">${(totalRevenue / 1000).toFixed(0)}k</p>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{avgPerformance}%</p>
            <p className="text-sm text-gray-600">Avg Performance</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{teamData.length}</p>
            <p className="text-sm text-gray-600">Team Members</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {teamData.map((member) => (
            <div key={member.name} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
              <div className="w-10 h-10 bg-broker-primary text-white rounded-full flex items-center justify-center font-semibold">
                {member.avatar}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.role}</p>
                  </div>
                  <Badge variant={member.performance >= 100 ? "default" : member.performance >= 75 ? "secondary" : "destructive"}>
                    {member.performance}%
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Deals: {member.closedDeals}/{member.target}</span>
                    <span>${(member.revenue / 1000).toFixed(0)}k</span>
                  </div>
                  <Progress value={member.performance} className="h-2" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Performance Comparison
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'closedDeals' ? `${value} deals` : `${value}%`,
                    name === 'closedDeals' ? 'Closed Deals' : 'Performance'
                  ]}
                />
                <Bar dataKey="closedDeals" fill="#3b82f6" name="closedDeals" />
                <Bar dataKey="performance" fill="#10b981" name="performance" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamPerformanceMetrics;
