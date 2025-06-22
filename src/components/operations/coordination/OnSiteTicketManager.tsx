
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

interface OnSiteTicket {
  id: string;
  ticket_number: string;
  subject: string;
  status: string;
  priority: string;
  customer_name: string;
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

      // Get employee info
      const { data: employee } = await supabase
        .from('employees')
        .select('company_owner_id')
        .eq('user_id', user.id)
        .single();

      if (!employee) return;

      // Get tickets for the company (assigned to current user or open)
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          id,
          ticket_number,
          subject,
          status,
          priority,
          created_at,
          assigned_to_name,
          customers!inner(name)
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
        assigned_to_name: ticket.assigned_to_name || 'Unassigned',
        created_at: ticket.created_at
      }));

      setTickets(formattedTickets);
    } catch (error: any) {
      console.error('Error loading tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load tickets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Location access denied:', error);
        }
      );
    }
  };

  const handleUpdateTicketStatus = async () => {
    if (!selectedTicket || !newStatus) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get employee info
      const { data: employee } = await supabase
        .from('employees')
        .select('id, first_name, last_name')
        .eq('user_id', user.id)
        .single();

      if (!employee) throw new Error('Employee not found');

      // Update ticket status
      const { error: updateError } = await supabase
        .from('tickets')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
          ...(newStatus === 'resolved' && { resolved_at: new Date().toISOString() }),
          ...(newStatus === 'closed' && { closed_at: new Date().toISOString() })
        })
        .eq('id', selectedTicket.id);

      if (updateError) throw updateError;

      // Log the activity
      await supabase
        .from('ticket_activities')
        .insert({
          ticket_id: selectedTicket.id,
          user_id: employee.id,
          user_name: `${employee.first_name} ${employee.last_name}`,
          activity_type: 'status_change',
          description: `Status changed from ${selectedTicket.status} to ${newStatus}`,
          old_value: selectedTicket.status,
          new_value: newStatus
        });

      // Add notes if provided
      if (notes.trim()) {
        await supabase
          .from('ticket_comments')
          .insert({
            ticket_id: selectedTicket.id,
            user_id: user.id,
            user_name: `${employee.first_name} ${employee.last_name}`,
            comment: notes,
            is_internal: false
          });
      }

      toast({
        title: "Success",
        description: `Ticket status updated to ${newStatus}`,
      });

      // Reset form and reload tickets
      setSelectedTicket(null);
      setNewStatus('');
      setNotes('');
      loadTickets();
    } catch (error: any) {
      console.error('Error updating ticket:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            On-Site Ticket Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tickets by number, subject, or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="text-center py-8">Loading tickets...</div>
          ) : (
            <div className="space-y-3">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedTicket?.id === ticket.id ? 'border-quikle-primary bg-quikle-crystal' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{ticket.ticket_number}</h4>
                      <p className="text-sm text-gray-600">{ticket.subject}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {ticket.customer_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                    {ticket.assigned_to_name && (
                      <span>Assigned to: {ticket.assigned_to_name}</span>
                    )}
                  </div>
                </div>
              ))}

              {filteredTickets.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tickets found</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTicket && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Update Ticket Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium">{selectedTicket.ticket_number}</h4>
              <p className="text-sm text-gray-600 mt-1">{selectedTicket.subject}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm">Customer:</span>
                <span className="font-medium">{selectedTicket.customer_name}</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">New Status</label>
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
              <label className="text-sm font-medium mb-2 block">Notes (Optional)</label>
              <Textarea
                placeholder="Add notes about the work completed..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {location && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>Location captured</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedTicket(null);
                  setNewStatus('');
                  setNotes('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateTicketStatus}
                disabled={!newStatus}
                className="flex-1"
              >
                Update Status
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OnSiteTicketManager;
