import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock, MapPin, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface JobCompletion {
  id: string;
  customer_id: string;
  customer_name: string;
  employee_name: string | null;
  before_status: string | null;
  after_status: string | null;
  notes: string | null;
  location_lat: number | null;
  location_lng: number | null;
  completed_at: string | null;
  created_at: string | null;
}

const JobCompletionNotifications = () => {
  const [completions, setCompletions] = useState<JobCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCompletions = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('job_completions')
        .select(`
          id, customer_id, before_status, after_status, notes,
          location_lat, location_lng, completed_at, created_at,
          customers!inner(name),
          employees(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formatted: JobCompletion[] = (data || []).map((item: any) => ({
        id: item.id,
        customer_id: item.customer_id,
        customer_name: item.customers?.name || 'Unknown',
        employee_name: item.employees 
          ? `${item.employees.first_name} ${item.employees.last_name}` 
          : null,
        before_status: item.before_status,
        after_status: item.after_status,
        notes: item.notes,
        location_lat: item.location_lat,
        location_lng: item.location_lng,
        completed_at: item.completed_at,
        created_at: item.created_at,
      }));

      setCompletions(formatted);
    } catch (error: any) {
      console.error('Error loading job completions:', error);
      toast({ title: "Error", description: "Failed to load completions", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompletions();
  }, []);

  const getStatusBadge = (status: string | null) => {
    if (!status) return 'bg-muted text-muted-foreground';
    switch (status) {
      case 'existing': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'finalised': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <Bell className="h-4 w-4" />
            Recent Job Completions
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={loadCompletions} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted/50 rounded-md animate-pulse" />
            ))}
          </div>
        ) : completions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No job completions yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {completions.map((completion) => (
              <div key={completion.id} className="border border-border rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h4 className="font-medium text-sm text-foreground truncate">
                      {completion.customer_name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {completion.before_status && (
                        <span className="text-xs text-muted-foreground">
                          {completion.before_status}
                        </span>
                      )}
                      {completion.before_status && completion.after_status && (
                        <span className="text-xs text-muted-foreground">→</span>
                      )}
                      {completion.after_status && (
                        <Badge className={`text-[10px] px-1.5 py-0 ${getStatusBadge(completion.after_status)}`}>
                          {completion.after_status}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                    <Clock className="h-3 w-3" />
                    {completion.created_at
                      ? new Date(completion.created_at).toLocaleDateString()
                      : '—'}
                  </div>
                </div>

                {completion.notes && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{completion.notes}</p>
                )}

                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  {completion.employee_name && (
                    <span>By {completion.employee_name}</span>
                  )}
                  {completion.location_lat && (
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-2.5 w-2.5" />
                      Location verified
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobCompletionNotifications;
