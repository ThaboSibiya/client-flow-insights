
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Shield, Clock, MapPin, User, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getLoginHistory } from '@/services/auditLogService';

interface SuspiciousActivity {
  id: string;
  type: 'multiple_failed_logins' | 'unusual_location' | 'after_hours_access' | 'unusual_file_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user: string;
  description: string;
  timestamp: string;
  details: string;
  location?: string;
  resolved: boolean;
}

interface SuspiciousActivityMonitorProps {
  onSuspiciousActivityCount: (count: number) => void;
}

const SuspiciousActivityMonitor = ({ onSuspiciousActivityCount }: SuspiciousActivityMonitorProps) => {
  const [suspiciousActivities, setSuspiciousActivities] = useState<SuspiciousActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<SuspiciousActivity | null>(null);

  const { data: loginHistory } = useQuery({
    queryKey: ['loginHistory'],
    queryFn: getLoginHistory,
  });

  useEffect(() => {
    if (loginHistory) {
      const activities = analyzeSuspiciousActivity(loginHistory);
      setSuspiciousActivities(activities);
      onSuspiciousActivityCount(activities.filter(a => !a.resolved).length);
    }
  }, [loginHistory, onSuspiciousActivityCount]);

  const analyzeSuspiciousActivity = (loginData: any[]): SuspiciousActivity[] => {
    const activities: SuspiciousActivity[] = [];
    
    // Group by user
    const userLogins = loginData.reduce((acc, login) => {
      const userKey = login.employees?.email || 'unknown';
      if (!acc[userKey]) acc[userKey] = [];
      acc[userKey].push(login);
      return acc;
    }, {} as Record<string, any[]>);

    // Analyze each user's activity
    Object.entries(userLogins).forEach(([userEmail, logins]) => {
      const userName = logins[0]?.employees?.first_name + ' ' + logins[0]?.employees?.last_name || userEmail;
      
      // Check for multiple logins from different IPs in short time
      const recentLogins = logins.filter(login => {
        const loginTime = new Date(login.login_timestamp);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return loginTime > oneHourAgo;
      });

      if (recentLogins.length > 3) {
        const uniqueIPs = [...new Set(recentLogins.map(l => l.ip_address))];
        if (uniqueIPs.length > 1) {
          activities.push({
            id: `multiple-ip-${userEmail}-${Date.now()}`,
            type: 'unusual_location',
            severity: 'high',
            user: userName,
            description: 'Multiple logins from different locations',
            timestamp: recentLogins[0].login_timestamp,
            details: `${recentLogins.length} logins from ${uniqueIPs.length} different IP addresses in the last hour`,
            location: uniqueIPs.join(', '),
            resolved: false
          });
        }
      }

      // Check for after-hours access
      const afterHoursLogins = logins.filter(login => {
        const loginTime = new Date(login.login_timestamp);
        const hour = loginTime.getHours();
        return hour < 6 || hour > 22; // Before 6 AM or after 10 PM
      });

      if (afterHoursLogins.length > 0) {
        afterHoursLogins.forEach(login => {
          activities.push({
            id: `after-hours-${login.id}`,
            type: 'after_hours_access',
            severity: 'medium',
            user: userName,
            description: 'After-hours system access',
            timestamp: login.login_timestamp,
            details: `Login at ${new Date(login.login_timestamp).toLocaleString()}`,
            location: login.ip_address,
            resolved: false
          });
        });
      }
    });

    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <Shield className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const markAsResolved = (activityId: string) => {
    setSuspiciousActivities(prev =>
      prev.map(activity =>
        activity.id === activityId
          ? { ...activity, resolved: true }
          : activity
      )
    );
  };

  const unresolvedCount = suspiciousActivities.filter(a => !a.resolved).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-quikle-charcoal">Suspicious Activity Monitor</h2>
        {unresolvedCount > 0 && (
          <Badge variant="destructive" className="px-3 py-1">
            {unresolvedCount} Unresolved
          </Badge>
        )}
      </div>

      {unresolvedCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {unresolvedCount} suspicious activities require immediate attention. Review and resolve critical issues first.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {suspiciousActivities.map((activity) => (
          <Card 
            key={activity.id} 
            className={`border-l-4 ${
              activity.severity === 'critical' || activity.severity === 'high' 
                ? 'border-l-red-500' 
                : activity.severity === 'medium'
                ? 'border-l-yellow-500'
                : 'border-l-blue-500'
            } ${activity.resolved ? 'opacity-60' : ''}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${getSeverityColor(activity.severity)}`}>
                    {getSeverityIcon(activity.severity)}
                  </div>
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {activity.description}
                      <Badge className={getSeverityColor(activity.severity)}>
                        {activity.severity.toUpperCase()}
                      </Badge>
                      {activity.resolved && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Resolved
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-quikle-slate flex items-center gap-1 mt-1">
                      <User className="h-3 w-3" />
                      {activity.user}
                    </p>
                  </div>
                </div>
                {!activity.resolved && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAsResolved(activity.id)}
                  >
                    Mark Resolved
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-quikle-charcoal">{activity.details}</p>
                <div className="flex flex-wrap gap-4 text-xs text-quikle-slate">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(activity.timestamp).toLocaleString()}
                  </span>
                  {activity.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {activity.location}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {suspiciousActivities.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-quikle-charcoal mb-2">All Clear</h3>
              <p className="text-quikle-slate">No suspicious activities detected in recent logs</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SuspiciousActivityMonitor;
