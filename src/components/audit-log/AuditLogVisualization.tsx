
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { getLoginHistory, getFileAccessHistory } from '@/services/auditLogService';

const AuditLogVisualization = () => {
  const { data: loginHistory } = useQuery({
    queryKey: ['loginHistory'],
    queryFn: getLoginHistory,
  });

  const { data: fileHistory } = useQuery({
    queryKey: ['fileAccessHistory'],
    queryFn: getFileAccessHistory,
  });

  // Process login data by hour
  const loginsByHour = React.useMemo(() => {
    if (!loginHistory) return [];
    
    const hourCounts = new Array(24).fill(0).map((_, hour) => ({
      hour: `${hour}:00`,
      logins: 0
    }));

    loginHistory.forEach(login => {
      const hour = new Date(login.login_timestamp).getHours();
      hourCounts[hour].logins++;
    });

    return hourCounts;
  }, [loginHistory]);

  // Process file access by type
  const fileAccessByType = React.useMemo(() => {
    if (!fileHistory) return [];
    
    const typeCounts = fileHistory.reduce((acc, file) => {
      acc[file.action] = (acc[file.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCounts).map(([action, count]) => ({
      name: action,
      value: count
    }));
  }, [fileHistory]);

  // Process activity by day
  const activityByDay = React.useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const loginCount = loginHistory?.filter(login => 
        login.login_timestamp.startsWith(dateStr)
      ).length || 0;
      
      const fileCount = fileHistory?.filter(file => 
        file.accessed_at.startsWith(dateStr)
      ).length || 0;

      days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        logins: loginCount,
        fileAccess: fileCount,
        total: loginCount + fileCount
      });
    }
    return days;
  }, [loginHistory, fileHistory]);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-quikle-charcoal">Audit Log Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Login Activity by Hour */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Login Activity by Hour</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={loginsByHour}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="logins" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* File Access by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">File Access by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={fileAccessByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {fileAccessByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity Trend (7 days) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Activity Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="logins" stroke="#8884d8" name="Logins" />
                <Line type="monotone" dataKey="fileAccess" stroke="#82ca9d" name="File Access" />
                <Line type="monotone" dataKey="total" stroke="#ffc658" name="Total Activity" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-quikle-primary">
              {loginHistory?.length || 0}
            </div>
            <p className="text-sm text-quikle-slate">Total Logins</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-quikle-secondary">
              {fileHistory?.length || 0}
            </div>
            <p className="text-sm text-quikle-slate">File Access Events</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {new Set(loginHistory?.map(l => l.employees?.email)).size || 0}
            </div>
            <p className="text-sm text-quikle-slate">Active Users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-orange-500">
              {new Set(loginHistory?.map(l => l.ip_address)).size || 0}
            </div>
            <p className="text-sm text-quikle-slate">Unique IPs</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuditLogVisualization;
