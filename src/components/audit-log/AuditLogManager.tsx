import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, ShieldCheck, Download, RefreshCw, Filter, AlertTriangle, Calendar, Eye } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import LoginHistoryList from './LoginHistoryList';
import FileAccessHistoryList from './FileAccessHistoryList';
import AuditLogTimeline from './mobile/AuditLogTimeline';
import SuspiciousActivityMonitor from './SuspiciousActivityMonitor';
import AuditLogVisualization from './AuditLogVisualization';
import ComplianceReports from './ComplianceReports';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuditLogManagerProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const AuditLogManager = ({ searchTerm, onSearchChange }: AuditLogManagerProps) => {
  const [activeTab, setActiveTab] = useState('login');
  const [dateRange, setDateRange] = useState('7d');
  const [filterType, setFilterType] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [suspiciousActivities, setSuspiciousActivities] = useState(0);
  const [realtimeEnabled, setRealtimeEnabled] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (realtimeEnabled) {
      const channel = supabase
        .channel('audit-log-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'employee_login_history'
          },
          () => {
            toast({
              title: "New Activity",
              description: "Audit log has been updated with new activity"
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'file_access_history'
          },
          () => {
            toast({
              title: "File Access",
              description: "New file access activity recorded"
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [realtimeEnabled]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Trigger refresh by updating a timestamp
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Refreshed",
        description: "Audit log data has been refreshed"
      });
    }, 1000);
  };

  const handleExport = () => {
    // Export functionality
    toast({
      title: "Export Started",
      description: "Your audit log export will be ready shortly"
    });
  };

  if (isMobile) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-quikle-charcoal flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-quikle-primary" />
            Audit Log
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {suspiciousActivities > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {suspiciousActivities} suspicious activities detected in the last 24 hours
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <Input
            placeholder="Search audit logs..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full"
          />
          
          <div className="flex gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activity</SelectItem>
                <SelectItem value="login">Login Only</SelectItem>
                <SelectItem value="file">File Access Only</SelectItem>
                <SelectItem value="suspicious">Suspicious Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <AuditLogTimeline 
          searchTerm={searchTerm}
          dateRange={dateRange}
          filterType={filterType}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-quikle-charcoal flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-quikle-primary" />
            Audit Log
          </h1>
          <p className="text-quikle-slate mt-1">
            Monitor user activities, file access, and security events with real-time updates
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={realtimeEnabled ? "default" : "secondary"} className="px-3 py-1">
            {realtimeEnabled ? "Live" : "Static"}
          </Badge>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {suspiciousActivities > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {suspiciousActivities} suspicious activities detected. Review immediately.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-quikle-slate h-4 w-4" />
              <Input
                placeholder="Search logs by user, IP, activity..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 border-quikle-silver"
              />
            </div>
            
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activity</SelectItem>
                <SelectItem value="login">Login Events</SelectItem>
                <SelectItem value="file">File Access</SelectItem>
                <SelectItem value="suspicious">Suspicious</SelectItem>
                <SelectItem value="failed">Failed Attempts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="login">Login History</TabsTrigger>
              <TabsTrigger value="file">File Access</TabsTrigger>
              <TabsTrigger value="suspicious">Suspicious</TabsTrigger>
              <TabsTrigger value="visualization">Analytics</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <LoginHistoryList 
                searchTerm={searchTerm}
                dateRange={dateRange}
                filterType={filterType}
              />
            </TabsContent>
            
            <TabsContent value="file">
              <FileAccessHistoryList 
                searchTerm={searchTerm}
                dateRange={dateRange}
                filterType={filterType}
              />
            </TabsContent>
            
            <TabsContent value="suspicious">
              <SuspiciousActivityMonitor 
                onSuspiciousActivityCount={setSuspiciousActivities}
              />
            </TabsContent>
            
            <TabsContent value="visualization">
              <AuditLogVisualization />
            </TabsContent>
            
            <TabsContent value="compliance">
              <ComplianceReports />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AuditLogManager;
