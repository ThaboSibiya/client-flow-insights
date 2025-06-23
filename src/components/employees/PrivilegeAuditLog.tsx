
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarDays, Shield, User, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { PrivilegeChangeAudit } from '@/services/enhancedSecurityService';

interface PrivilegeAuditLogProps {
  employeeId?: string;
  limit?: number;
}

const PrivilegeAuditLog: React.FC<PrivilegeAuditLogProps> = ({ employeeId, limit = 20 }) => {
  const [auditLogs, setAuditLogs] = useState<PrivilegeChangeAudit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuditLogs();
  }, [employeeId]);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('privilege_change_audit')
        .select(`
          id,
          employee_id,
          changed_by,
          privilege_name,
          old_value,
          new_value,
          reason,
          ip_address,
          created_at,
          employee:employees!privilege_change_audit_employee_id_fkey(first_name, last_name),
          changed_by_employee:employees!privilege_change_audit_changed_by_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform the data to match our interface
      const transformedData: PrivilegeChangeAudit[] = (data || []).map(log => ({
        id: log.id,
        employee_id: log.employee_id,
        changed_by: log.changed_by,
        privilege_name: log.privilege_name,
        old_value: log.old_value,
        new_value: log.new_value,
        reason: log.reason,
        ip_address: log.ip_address ? String(log.ip_address) : undefined,
        created_at: log.created_at
      }));

      setAuditLogs(transformedData);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast({
        title: "Error",
        description: "Failed to load privilege audit logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getChangeType = (oldValue?: boolean, newValue?: boolean) => {
    if (oldValue === undefined || newValue === undefined) return 'modified';
    if (oldValue === false && newValue === true) return 'granted';
    if (oldValue === true && newValue === false) return 'revoked';
    return 'modified';
  };

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case 'granted': return 'bg-green-100 text-green-800';
      case 'revoked': return 'bg-red-100 text-red-800';
      case 'modified': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrivilegeName = (name: string) => {
    return name
      .replace(/can_|_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading audit logs...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Privilege Change Audit Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {auditLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No privilege changes recorded</p>
              </div>
            ) : (
              auditLogs.map((log) => {
                const changeType = getChangeType(log.old_value, log.new_value);
                return (
                  <Card key={log.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getChangeTypeColor(changeType)}>
                              {changeType}
                            </Badge>
                            <span className="font-medium">{formatPrivilegeName(log.privilege_name)}</span>
                          </div>
                          
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>Employee ID: {log.employee_id}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              <span>Changed by: {log.changed_by}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4" />
                              <span>{new Date(log.created_at).toLocaleString()}</span>
                            </div>
                          </div>

                          {log.reason && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                              <strong>Reason:</strong> {log.reason}
                            </div>
                          )}

                          <div className="mt-2 text-xs text-muted-foreground">
                            {log.old_value !== undefined && log.new_value !== undefined && (
                              <span>
                                Changed from <strong>{log.old_value ? 'Enabled' : 'Disabled'}</strong> to <strong>{log.new_value ? 'Enabled' : 'Disabled'}</strong>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PrivilegeAuditLog;
