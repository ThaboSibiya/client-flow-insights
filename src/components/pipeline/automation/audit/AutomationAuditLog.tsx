
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Search, Filter } from 'lucide-react';
import { automationAuditService, AutomationAuditLog as AuditLogType } from '@/services/automationAuditService';
import { toast } from 'sonner';

interface AutomationAuditLogProps {
  automationId?: string;
}

const AutomationAuditLog: React.FC<AutomationAuditLogProps> = ({ automationId }) => {
  const [auditLogs, setAuditLogs] = useState<AuditLogType[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuditLogs();
  }, [automationId]);

  useEffect(() => {
    filterLogs();
  }, [auditLogs, searchTerm, actionFilter]);

  const loadAuditLogs = async () => {
    try {
      setIsLoading(true);
      const logs = await automationAuditService.getAuditLogs(automationId);
      setAuditLogs(logs);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = auditLogs;

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.automation_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    setFilteredLogs(filtered);
  };

  const exportLogs = async () => {
    try {
      const exportData = await automationAuditService.exportAuditLogs();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `automation-audit-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Audit logs exported successfully');
    } catch (error) {
      console.error('Failed to export logs:', error);
      toast.error('Failed to export audit logs');
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'created': return 'bg-green-100 text-green-800';
      case 'updated': return 'bg-blue-100 text-blue-800';
      case 'executed': return 'bg-purple-100 text-purple-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'deleted': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Loading audit logs...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Automation Audit Log
          </CardTitle>
          <Button onClick={exportLogs} size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="updated">Updated</SelectItem>
              <SelectItem value="executed">Executed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="deleted">Deleted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4" />
            <p>No audit logs found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <Card key={log.id} className="border">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${getActionBadgeColor(log.action)}`}>
                          {log.action}
                        </Badge>
                        <span className="text-sm font-medium">
                          Automation: {log.automation_id}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                      {Object.keys(log.details).length > 0 && (
                        <div className="text-xs bg-gray-50 p-2 rounded">
                          <strong>Details:</strong> {JSON.stringify(log.details, null, 2)}
                        </div>
                      )}
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>User: {log.user_id}</p>
                      {log.user_agent && <p>Agent: {log.user_agent.substring(0, 30)}...</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AutomationAuditLog;
