import { useEffect, useState, useMemo } from 'react';
import { format, startOfDay, endOfDay, addDays } from 'date-fns';
import { Calendar as CalendarIcon, MapPin, Phone, Clock, User, Ticket as TicketIcon, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEmployeeProfile } from '@/hooks/useEmployeeProfile';
import { useActiveWorkspaceId } from '@/hooks/useActiveWorkspaceId';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface Appointment {
  id: string;
  scheduled_at: string;
  call_type: string;
  duration_minutes: number | null;
  status: string | null;
  notes: string | null;
  location: string | null;
  ticket_id: string | null;
  customer_id: string | null;
  tickets?: {
    ticket_number?: string | null;
    subject?: string | null;
    priority?: string | null;
    location?: string | null;
  } | null;
  customers?: {
    name?: string | null;
    address?: string | null;
    phone?: string | null;
  } | null;
}

const priorityVariant = (p?: string | null) => {
  switch (p) {
    case 'urgent': return 'destructive';
    case 'high': return 'destructive';
    case 'medium': return 'default';
    default: return 'secondary';
  }
};

const OnSiteSchedule = () => {
  const { data: employee, isLoading: employeeLoading } = useEmployeeProfile();
  const workspaceId = useActiveWorkspaceId();
  const [date, setDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dayStart = useMemo(() => startOfDay(date).toISOString(), [date]);
  const dayEnd = useMemo(() => endOfDay(date).toISOString(), [date]);

  useEffect(() => {
    if (!employee?.id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        let query = supabase
          .from('scheduled_calls')
          .select('*, tickets(ticket_number, subject, priority, location), customers(name, address, phone)')
          .eq('call_type', 'on_site')
          .eq('assigned_employee_id', employee.id)
          .gte('scheduled_at', dayStart)
          .lte('scheduled_at', dayEnd)
          .order('scheduled_at', { ascending: true });

        if (workspaceId) query = query.eq('workspace_id', workspaceId);

        const { data, error: qErr } = await query;
        if (qErr) throw qErr;
        if (!cancelled) setAppointments((data as Appointment[]) || []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load appointments');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [employee?.id, workspaceId, dayStart, dayEnd]);

  // Realtime updates for assignments
  useEffect(() => {
    if (!employee?.id) return;
    const channel = supabase
      .channel(`onsite-schedule-${employee.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'scheduled_calls',
        filter: `assigned_employee_id=eq.${employee.id}`,
      }, () => {
        // Trigger refetch by bumping date state reference
        setDate((d) => new Date(d));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [employee?.id]);

  if (employeeLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!employee?.id) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
            This page is only available to employees. Please contact your administrator.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My On-Site Schedule</h1>
          <p className="text-sm text-muted-foreground">
            Appointments assigned to you for the selected day.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setDate(addDays(date, -1))}>Prev</Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="min-w-[170px]">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {format(date, 'EEE, dd MMM yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" onClick={() => setDate(addDays(date, 1))}>Next</Button>
          <Button variant="ghost" size="sm" onClick={() => setDate(new Date())}>Today</Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/50">
          <CardContent className="py-4 text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> {error}
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      ) : appointments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <CalendarIcon className="h-10 w-10 mx-auto mb-3 opacity-50" />
            No on-site appointments scheduled for {format(date, 'EEE, dd MMM')}.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => {
            const when = new Date(a.scheduled_at);
            const location = a.location || a.tickets?.location || a.customers?.address;
            return (
              <Card key={a.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center justify-center rounded-md bg-muted px-3 py-2 min-w-[64px]">
                        <span className="text-xs text-muted-foreground">{format(when, 'HH:mm')}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {a.duration_minutes ? `${a.duration_minutes}m` : ''}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {a.tickets?.subject || 'On-site visit'}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          {a.customers?.name || 'Unknown customer'}
                          {a.tickets?.ticket_number && (
                            <>
                              <span className="opacity-50">·</span>
                              <TicketIcon className="h-3 w-3" />
                              {a.tickets.ticket_number}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {a.tickets?.priority && (
                        <Badge variant={priorityVariant(a.tickets.priority) as any} className="capitalize">
                          {a.tickets.priority}
                        </Badge>
                      )}
                      {a.status && (
                        <Badge variant="outline" className="capitalize">{a.status}</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-2 text-sm">
                  {location && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                      <span className="break-words">{location}</span>
                    </div>
                  )}
                  {a.customers?.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${a.customers.phone}`} className="hover:underline">{a.customers.phone}</a>
                    </div>
                  )}
                  {a.notes && (
                    <p className={cn('text-muted-foreground border-l-2 border-muted pl-3 mt-2')}>
                      {a.notes}
                    </p>
                  )}
                  <div className="flex items-center gap-2 pt-2">
                    {location && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(location)}`, '_blank')}
                      >
                        <MapPin className="h-3.5 w-3.5 mr-1" /> Directions
                      </Button>
                    )}
                    {a.customers?.phone && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={`tel:${a.customers.phone}`}>
                          <Phone className="h-3.5 w-3.5 mr-1" /> Call
                        </a>
                      </Button>
                    )}
                    <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {format(when, 'p')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OnSiteSchedule;
