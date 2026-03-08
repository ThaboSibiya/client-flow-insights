import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Ticket, User, Clock, Search, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import CustomerContextCard from '../../customers/tickets/CustomerContextCard';
import { ticketEventBus, TICKET_EVENTS } from '@/stores/ticketEventBus';
import { getPriorityColor, getStatusColor, formatTicketDate } from '@/utils/ticketFormatters';

interface OnSiteTicket {
  id: string;
  ticket_number: string;
  subject: string;
  status: string;
  priority: string;
  customer_name: string;
  customer_id: string;
  customer_email?: string;
  customer_phone?: string;
  assigned_to_name: string;
  created_at: string;
}

const OnSiteTicketManager = () => {
  const [tickets, setTickets] = useState<OnSiteTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<OnSiteTicket | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    loadTickets();
    getCurrentLocation();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: employee } = await supabase
        .from('employees')
        .select('company_owner_id')
        .eq('user_id', user.id)
        .single();

      if (!employee) return;

      const { data, error } = await supabase
        .from('tickets')
        .select(`
          id, ticket_number, subject, status, priority, created_at, assigned_to_name, customer_id,
          customers!inner(id, name, email, phone)
        `)
        .eq('user_id', employee.company_owner_id)
        .in('status', ['open', 'in-progress'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTickets: OnSiteTicket[] = (data || []).map(ticket => ({
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        subject: ticket.subject,
        status: ticket.status,
        priority: ticket.priority,
        customer_name: ticket.customers?.name || 'Unknown',
        customer_id: ticket.customer_id,
        customer_email: ticket.customers?.email,
        customer_phone: ticket.customers?.phone,
        assigned_to_name: ticket.assigned_to_name || 'Unassigned',
        created_at: ticket.created_at,
      }));

      setTickets(formattedTickets);
    } catch (error: any) {
      console.error('Error loading tickets:', error);
      toast({ title: "Error", description: "Failed to load tickets", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        (error) => console.warn('Location access denied:', error)
      );
    }
  };

  const handleUpdateTicketStatus = async () => {
    if (!selectedTicket || !newStatus) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: employee } = await supabase
        .from('employees')
        .select('id, first_name, last_name')
        .eq('user_id', user.id)
        .single();

      if (!employee) throw new Error('Employee not found');

      const { error: updateError } = await supabase
        .from('tickets')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
          ...(newStatus === 'resolved' && { resolved_at: new Date().toISOString() }),
          ...(newStatus === 'closed' && { closed_at: new Date().toISOString() }),
        })
        .eq('id', selectedTicket.id);

      if (updateError) throw updateError;

      await supabase.from('ticket_activities').insert({
        ticket_id: selectedTicket.id,
        user_id: employee.id,
        user_name: `${employee.first_name} ${employee.last_name}`,
        activity_type: 'status_change',
        description: `Status changed from ${selectedTicket.status} to ${newStatus}`,
        old_value: selectedTicket.status,
        new_value: newStatus,
      });

      if (notes.trim()) {
        await supabase.from('ticket_comments').insert({
          ticket_id: selectedTicket.id,
          user_id: user.id,
          user_name: `${employee.first_name} ${employee.last_name}`,
          comment: notes,
          is_internal: false,
        });
      }

      // Emit events for cross-page sync
      ticketEventBus.emit(TICKET_EVENTS.TICKET_STATUS_CHANGED, {
        ticketId: selectedTicket.id,
        status: newStatus,
        customerId: selectedTicket.customer_id,
      });
      ticketEventBus.emit(TICKET_EVENTS.TICKET_UPDATED, {
        ticketId: selectedTicket.id,
        customerId: selectedTicket.customer_id,
      });
      ticketEventBus.emit(TICKET_EVENTS.CUSTOMER_TICKETS_REFRESH, {
        customerId: selectedTicket.customer_id,
      });
      ticketEventBus.emit(TICKET_EVENTS.PIPELINE_REFRESH);

      toast({ title: "Success", description: `Ticket status updated to ${newStatus}` });

      setSelectedTicket(null);
      setNewStatus('');
      setNotes('');
      loadTickets();
    } catch (error: any) {
      console.error('Error updating ticket:', error);
      toast({ title: "Error", description: "Failed to update ticket status", variant: "destructive" });
    }
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Ticket className="h-5 w-5" />
            On-Site Ticket Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets by number, subject, or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading tickets...</div>
          ) : (
            <div className="space-y-2">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedTicket?.id === ticket.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">{ticket.ticket_number}</h4>
                      <p className="text-xs text-muted-foreground">{ticket.subject}</p>
                    </div>
                    <div className="flex gap-1">
                      <Badge className={getStatusColor(ticket.status)} variant="outline">{ticket.status}</Badge>
                      <Badge className={getPriorityColor(ticket.priority)} variant="outline">{ticket.priority}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{ticket.customer_name}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTicketDate(ticket.created_at)}</span>
                    {ticket.assigned_to_name && <span>→ {ticket.assigned_to_name}</span>}
                  </div>
                </div>
              ))}

              {filteredTickets.length === 0 && !loading && (
                <div className="text-center py-8 text-muted-foreground">
                  <Ticket className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No tickets found</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTicket && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <CustomerContextCard
              customerId={selectedTicket.customer_id}
              customerName={selectedTicket.customer_name}
              customerEmail={selectedTicket.customer_email}
              customerPhone={selectedTicket.customer_phone}
            />
          </div>

          <div className="lg:col-span-2">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-foreground">
                  <CheckCircle className="h-4 w-4" />
                  Update Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-muted/50 p-3 rounded-md">
                  <h4 className="font-medium text-sm text-foreground">{selectedTicket.ticket_number}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedTicket.subject}</p>
                  <span className="text-xs text-muted-foreground">Customer: <span className="font-medium text-foreground">{selectedTicket.customer_name}</span></span>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">New Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Notes (Optional)</label>
                  <Textarea
                    placeholder="Add notes about the work completed..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>

                {location && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Location captured</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => { setSelectedTicket(null); setNewStatus(''); setNotes(''); }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateTicketStatus} disabled={!newStatus} className="flex-1">
                    Update Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnSiteTicketManager;
