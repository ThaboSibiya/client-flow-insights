
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLoginHistory } from '@/services/auditLogService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from '../auth/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, MapPin, Clock, User } from 'lucide-react';

interface LoginHistoryListProps {
  searchTerm: string;
  dateRange?: string;
  filterType?: string;
}

const LoginHistoryList = ({ searchTerm, dateRange, filterType }: LoginHistoryListProps) => {
  const { data: history, isLoading, error } = useQuery({
    queryKey: ['loginHistory'],
    queryFn: getLoginHistory,
  });

  const filteredHistory = history?.filter(log => {
    const employee = log.employees;
    const search = searchTerm.toLowerCase();
    return (
      employee?.first_name?.toLowerCase().includes(search) ||
      employee?.last_name?.toLowerCase().includes(search) ||
      employee?.email?.toLowerCase().includes(search) ||
      log.ip_address?.toLowerCase().includes(search) ||
      log.user_agent?.toLowerCase().includes(search)
    );
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      return 'Just now';
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getLocationFromIP = (ip: string) => {
    // Simple IP-based location detection (would use a real service in production)
    if (ip?.startsWith('192.168') || ip?.startsWith('10.') || ip?.startsWith('172.')) {
      return 'Local Network';
    }
    return 'External';
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return (
    <Alert variant="destructive">
      <Terminal className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>Failed to load login history: {error.message}</AlertDescription>
    </Alert>
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Device</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory && filteredHistory.length > 0 ? (
                filteredHistory.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-quikle-slate" />
                        {log.employees?.first_name} {log.employees?.last_name}
                      </div>
                    </TableCell>
                    <TableCell>{log.employees?.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-quikle-slate" />
                        <div>
                          <div className="text-sm">
                            {new Date(log.login_timestamp).toLocaleString()}
                          </div>
                          <div className="text-xs text-quikle-slate">
                            {formatTimestamp(log.login_timestamp)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-quikle-slate" />
                        <Badge variant="outline" className="text-xs">
                          {getLocationFromIP(log.ip_address)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-quikle-crystal px-2 py-1 rounded">
                        {log.ip_address}
                      </code>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate text-xs text-quikle-slate" title={log.user_agent}>
                        {log.user_agent?.split(' ')[0] || 'Unknown'}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <User className="h-8 w-8 text-quikle-slate" />
                      <p className="text-quikle-slate">No login history found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginHistoryList;
