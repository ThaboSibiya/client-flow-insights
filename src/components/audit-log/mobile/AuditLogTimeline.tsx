
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, User, File, AlertTriangle, Clock, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getLoginHistory, getFileAccessHistory } from '@/services/auditLogService';

interface AuditLogTimelineProps {
  searchTerm: string;
  dateRange: string;
  filterType: string;
}

interface TimelineEvent {
  id: string;
  type: 'login' | 'file' | 'suspicious';
  timestamp: string;
  user: string;
  description: string;
  details?: string;
  location?: string;
  severity?: 'low' | 'medium' | 'high';
}

const AuditLogTimeline = ({ searchTerm, dateRange, filterType }: AuditLogTimelineProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  const { data: loginHistory } = useQuery({
    queryKey: ['loginHistory'],
    queryFn: getLoginHistory,
  });

  const { data: fileHistory } = useQuery({
    queryKey: ['fileAccessHistory'],
    queryFn: getFileAccessHistory,
  });

  useEffect(() => {
    const processedEvents: TimelineEvent[] = [];

    // Process login history
    if (loginHistory) {
      loginHistory.forEach(log => {
        processedEvents.push({
          id: log.id,
          type: 'login',
          timestamp: log.login_timestamp,
          user: `${log.employees?.first_name} ${log.employees?.last_name}`,
          description: 'User logged in',
          location: log.ip_address || 'Unknown location',
          severity: 'low'
        });
      });
    }

    // Process file access history
    if (fileHistory) {
      fileHistory.forEach(log => {
        processedEvents.push({
          id: log.id,
          type: 'file',
          timestamp: log.accessed_at,
          user: `${log.employees?.first_name} ${log.employees?.last_name}`,
          description: `${log.action} file`,
          details: log.file_path,
          severity: log.action === 'delete' ? 'high' : 'low'
        });
      });
    }

    // Sort by timestamp
    processedEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply filters
    let filteredEvents = processedEvents;

    if (searchTerm) {
      filteredEvents = filteredEvents.filter(event =>
        event.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filteredEvents = filteredEvents.filter(event => event.type === filterType);
    }

    setEvents(filteredEvents);
  }, [loginHistory, fileHistory, searchTerm, filterType]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'login':
        return <User className="h-4 w-4" />;
      case 'file':
        return <File className="h-4 w-4" />;
      case 'suspicious':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Activity Timeline</h3>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-lg bg-quikle-crystal hover:bg-quikle-silver transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-3">
          {events.map((event, index) => (
            <Card key={event.id} className="border-l-4 border-l-quikle-primary">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-full bg-quikle-crystal">
                      {getEventIcon(event.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm text-quikle-charcoal truncate">
                          {event.user}
                        </p>
                        <Badge variant="outline" className={`text-xs ${getSeverityColor(event.severity)}`}>
                          {event.type}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-quikle-slate mb-2">
                        {event.description}
                      </p>
                      
                      {event.details && (
                        <p className="text-xs text-quikle-slate truncate mb-2">
                          {event.details}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-quikle-slate">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(event.timestamp)}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {events.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-quikle-slate mx-auto mb-4" />
                <p className="text-quikle-slate">No audit events found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AuditLogTimeline;
