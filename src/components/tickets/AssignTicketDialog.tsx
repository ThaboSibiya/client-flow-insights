import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, MapPin, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useActiveWorkspaceId } from '@/hooks/useActiveWorkspaceId';
import { toast } from '@/hooks/use-toast';
import { updateTicket } from '@/services/ticketService';
import { ticketEventBus, TICKET_EVENTS } from '@/stores/ticketEventBus';
import type { CustomerTicket } from '@/types/customer';

interface Employee {
  id: string;
  auth_user_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  designation: string | null;
  department: string | null;
}

interface AssignTicketDialogProps {
  ticket: CustomerTicket | null;
  customerId?: string;
  isOpen: boolean;
  onClose: () => void;
  onAssigned?: (assignee: { id: string; name: string }) => void;
}

const looksLikeOnSite = (ticket: CustomerTicket | null) => {
  if (!ticket) return false;
  const haystack = `${ticket.subject || ''} ${ticket.description || ''} ${(ticket as any).category || ''}`.toLowerCase();
  return /\b(on[\s-]?site|site\s?visit|onsite|field|in[\s-]?person|install|installation|repair on site)\b/.test(haystack);
};

const AssignTicketDialog: React.FC<AssignTicketDialogProps> = ({ ticket, customerId, isOpen, onClose, onAssigned }) => {
  const { user } = useAuth();
  const workspaceId = useActiveWorkspaceId();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [scheduleOnSite, setScheduleOnSite] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('09:00');
  const [location, setLocation] = useState('');

  const isOnSiteSuggested = useMemo(() => looksLikeOnSite(ticket), [ticket]);

  useEffect(() => {
    if (!isOpen) return;
    setScheduleOnSite(isOnSiteSuggested);
    setSelectedEmployeeId(ticket?.assignedTo?.id ? String(ticket.assignedTo.id) : '');
    const today = new Date();
    today.setDate(today.getDate() + 1);
    setAppointmentDate(today.toISOString().slice(0, 10));
    setAppointmentTime('09:00');
  }, [isOpen, isOnSiteSuggested, ticket?.assignedTo?.id]);

  useEffect(() => {
    if (!isOpen || !user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select('id, auth_user_id, first_name, last_name, email, designation, department')
        .eq('company_owner_id', user.id)
        .eq('status', 'active')
        .order('first_name');
      if (!cancelled) {
        if (error) {
          toast({ title: 'Could not load team', description: error.message, variant: 'destructive' });
        } else {
          setEmployees((data || []) as Employee[]);
        }
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isOpen, user]);

  const handleSubmit = async () => {
    if (!ticket || !user) return;
    const employee = employees.find((e) => e.id === selectedEmployeeId);
    if (!employee) {
      toast({ title: 'Select a team member', variant: 'destructive' });
      return;
    }
    if (scheduleOnSite && (!appointmentDate || !appointmentTime)) {
      toast({ title: 'Set appointment date & time', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const assigneeName = `${employee.first_name} ${employee.last_name}`.trim();
      // Use auth_user_id when present so it matches tickets.assigned_to_id semantics elsewhere
      const assigneeId = employee.auth_user_id || employee.id;

      const ok = await updateTicket(
        ticket.id,
        { assignedTo: { id: assigneeId, name: assigneeName, email: employee.email, role: 'employee' } as any },
        user.id
      );
      if (!ok) throw new Error('Assignment failed');

      if (scheduleOnSite && customerId) {
        const scheduledAt = new Date(`${appointmentDate}T${appointmentTime}:00`).toISOString();
        const { error: schedErr } = await supabase.from('scheduled_calls').insert({
          user_id: user.id,
          customer_id: customerId,
          scheduled_at: scheduledAt,
          call_type: 'on_site',
          priority: ticket.priority || 'medium',
          status: 'scheduled',
          notes: `On-site visit for ticket #${ticket.ticketNumber} — ${ticket.subject}. Assigned to ${assigneeName}.`,
        });
        if (schedErr) {
          console.error('Scheduling error', schedErr);
          toast({
            title: 'Assigned, but scheduling failed',
            description: schedErr.message,
            variant: 'destructive',
          });
        } else {
          toast({ title: 'On-site visit scheduled', description: `${appointmentDate} at ${appointmentTime}` });
        }
      }

      ticketEventBus.emit(TICKET_EVENTS.TICKET_UPDATED, { ticketId: ticket.id, customerId });
      if (customerId) ticketEventBus.emit(TICKET_EVENTS.CUSTOMER_TICKETS_REFRESH, { customerId });
      ticketEventBus.emit(TICKET_EVENTS.PIPELINE_REFRESH);

      onAssigned?.({ id: assigneeId, name: assigneeName });
      onClose();
    } catch (err: any) {
      toast({ title: 'Could not assign ticket', description: err?.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5" /> Assign Ticket</DialogTitle>
          <DialogDescription>
            {ticket ? <>#{ticket.ticketNumber} — {ticket.subject}</> : 'Select a team member to take ownership.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Team Member</Label>
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId} disabled={loading || submitting}>
              <SelectTrigger>
                <SelectValue placeholder={loading ? 'Loading team…' : 'Select an employee'} />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <div className="flex items-center justify-center py-4"><Loader2 className="h-4 w-4 animate-spin" /></div>
                ) : employees.length === 0 ? (
                  <div className="py-3 px-2 text-sm text-muted-foreground text-center">No active employees. Add team members in Employees.</div>
                ) : employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.first_name} {e.last_name}
                    {e.designation && <span className="text-muted-foreground ml-1">· {e.designation}</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-start justify-between gap-3 rounded-md border p-3">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Schedule on-site visit</Label>
              <p className="text-xs text-muted-foreground">
                {isOnSiteSuggested ? 'Detected on-site keywords — appointment recommended.' : 'Adds the visit to the on-site team calendar.'}
              </p>
            </div>
            <Switch checked={scheduleOnSite} onCheckedChange={setScheduleOnSite} disabled={submitting} />
          </div>

          {scheduleOnSite && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} disabled={submitting} />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input type="time" value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)} disabled={submitting} />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting || !selectedEmployeeId}>
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Assign{scheduleOnSite ? ' & Schedule' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignTicketDialog;
