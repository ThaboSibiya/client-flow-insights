
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MapPin, Check, Clock, User, Phone } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { CustomerStatus } from '@/types/customer';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  notes: string;
}

interface OnSiteStatusUpdateProps {
  isOpen: boolean;
  onClose: () => void;
}

const OnSiteStatusUpdate = ({ isOpen, onClose }: OnSiteStatusUpdateProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newStatus, setNewStatus] = useState<CustomerStatus>('existing');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCustomers();
      getCurrentLocation();
    }
  }, [isOpen]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First get the employee record
      const { data: employee } = await supabase
        .from('employees')
        .select('company_owner_id')
        .eq('user_id', user.id)
        .single();

      if (!employee) {
        toast({
          title: "Error",
          description: "Employee record not found",
          variant: "destructive"
        });
        return;
      }

      // Then get customers for the company
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', employee.company_owner_id)
        .order('name');

      if (error) throw error;

      const formattedCustomers: Customer[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone || '',
        status: item.status as CustomerStatus,
        notes: item.notes || ''
      }));

      setCustomers(formattedCustomers);
    } catch (error: any) {
      console.error('Error loading customers:', error);
      toast({
        title: "Error",
        description: "Failed to load customers",
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

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setNewStatus(customer.status);
      setNotes('');
    }
  };

  const handleSubmit = async () => {
    if (!selectedCustomer) return;

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get employee ID
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!employee) throw new Error('Employee not found');

      // Update customer status
      const { error: updateError } = await supabase
        .from('customers')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedCustomer.id);

      if (updateError) throw updateError;

      // Record job completion
      const { error: jobError } = await supabase
        .from('job_completions')
        .insert({
          customer_id: selectedCustomer.id,
          employee_id: employee.id,
          notes: notes,
          before_status: selectedCustomer.status,
          after_status: newStatus,
          location_lat: location?.lat,
          location_lng: location?.lng
        });

      if (jobError) throw jobError;

      toast({
        title: "Success",
        description: `Customer status updated to ${newStatus}`,
      });

      // Reset form
      setSelectedCustomer(null);
      setNotes('');
      onClose();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update customer status",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center gap-2 justify-center">
            <Check className="h-5 w-5 text-green-600" />
            Job Completion Update
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading customers...</div>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Select Customer</label>
                <Select onValueChange={handleCustomerSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose customer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div className="flex items-center gap-2">
                          <span>{customer.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {customer.status}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCustomer && (
                <>
                  <Card className="bg-gray-50">
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{selectedCustomer.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span className="text-sm">{selectedCustomer.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">Current Status:</span>
                          <Badge>{selectedCustomer.status}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div>
                    <label className="text-sm font-medium mb-2 block">New Status</label>
                    <Select value={newStatus} onValueChange={(value: CustomerStatus) => setNewStatus(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="existing">Existing</SelectItem>
                        <SelectItem value="finalised">Finalised</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Job Notes</label>
                    <Textarea
                      placeholder="Add notes about the completed work..."
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
                </>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedCustomer || submitting}
                  className="flex-1"
                >
                  {submitting ? 'Updating...' : 'Update Status'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OnSiteStatusUpdate;
