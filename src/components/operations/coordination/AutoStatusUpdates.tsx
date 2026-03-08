import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

interface StatusUpdate {
  id: string;
  customer_name: string;
  old_status: string | null;
  new_status: string | null;
  updated_by: string | null;
  timestamp: string | null;
}

const AutoStatusUpdates = () => {
  const [updates, setUpdates] = useState<StatusUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUpdates = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Pull recent job completions as status change history
      const { data, error } = await supabase
        .from('job_completions')
        .select(`
          id, before_status, after_status, created_at,
          customers!inner(name),
          employees(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(15);

      if (error) throw error;

      const formatted: StatusUpdate[] = (data || []).map((item: any) => ({
        id: item.id,
        customer_name: item.customers?.name || 'Unknown',
        old_status: item.before_status,
        new_status: item.after_status,
        updated_by: item.employees
          ? `${item.employees.first_name} ${item.employees.last_name}`
          : 'System',
        timestamp: item.created_at,
      }));

      setUpdates(formatted);
    } catch (error: any) {
      console.error('Error loading status updates:', error);
      toast({ title: "Error", description: "Failed to load updates", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUpdates();
  }, []);

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'existing': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'finalised': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <RefreshCw className="h-4 w-4" />
            Status Change History
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={loadUpdates} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-muted/50 rounded-md animate-pulse" />
            ))}
          </div>
        ) : updates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <RefreshCw className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No status changes recorded</p>
          </div>
        ) : (
          <div className="space-y-2">
            {updates.map((update) => (
              <div key={update.id} className="border-l-2 border-primary/30 pl-3 py-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm text-foreground">{update.customer_name}</h4>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {update.timestamp
                      ? new Date(update.timestamp).toLocaleDateString()
                      : '—'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  {update.old_status && (
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getStatusColor(update.old_status)}`}>
                      {update.old_status}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">→</span>
                  {update.new_status && (
                    <Badge className={`text-[10px] px-1.5 py-0 ${getStatusColor(update.new_status)}`}>
                      {update.new_status}
                    </Badge>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  By {update.updated_by}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AutoStatusUpdates;
