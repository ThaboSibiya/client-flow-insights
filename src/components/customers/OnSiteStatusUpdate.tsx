
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Check, Clock, User, Phone, Search, X, AlertCircle } from "lucide-react";
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
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newStatus, setNewStatus] = useState<CustomerStatus>('existing');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCustomers();
      getCurrentLocation();
    }
  }, [isOpen]);

  // Filter customers based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customers]);

  const loadCustomers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Please log in to continue");
        return;
      }

      console.log('Current user:', user.id);

      // Try to get the employee record, but handle if it doesn't exist
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('company_owner_id')
        .eq('user_id', user.id)
        .maybeSingle();

      let companyOwnerId = user.id; // Default to current user

      if (employeeError) {
        console.warn('Employee lookup error:', employeeError);
        // If no employee record exists, assume the user is the company owner
        toast({
          title: "Notice",
          description: "Using your account as company owner. If you're an employee, please contact your administrator.",
        });
      } else if (employee) {
        companyOwnerId = employee.company_owner_id;
        console.log('Found employee record, company owner:', companyOwnerId);
      } else {
        console.log('No employee record found, using current user as company owner');
        toast({
          title: "Notice", 
          description: "No employee record found. Using your account as company owner.",
        });
      }

      // Get customers for the company
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', companyOwnerId)
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

      console.log('Loaded customers:', formattedCustomers.length);
      setCustomers(formattedCustomers);
      setFilteredCustomers(formattedCustomers);

      if (formattedCustomers.length === 0) {
        setError("No customers found. Please add customers first.");
      }

    } catch (error: any) {
      console.error('Error loading customers:', error);
      setError(`Failed to load customers: ${error.message}`);
      toast({
        title: "Error",
        description: "Failed to load customers. Please try again.",
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
          console.log('Location captured:', position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn('Location access denied:', error);
          toast({
            title: "Location Access",
            description: "Location access denied. Job completion will be recorded without location data.",
            variant: "destructive"
          });
        }
      );
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setNewStatus(customer.status);
    setNotes('');
    setSearchTerm('');
    setIsDropdownOpen(false);
    console.log('Selected customer:', customer.name);
  };

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      toast({
        title: "Error",
        description: "Please select a customer first",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Submitting job completion for customer:', selectedCustomer.id);

      // Try to get employee ID, but don't fail if it doesn't exist
      let employeeId = null;
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (employee) {
        employeeId = employee.id;
        console.log('Found employee ID:', employeeId);
      } else {
        console.log('No employee record found, proceeding without employee ID');
      }

      // Update customer status
      const { error: updateError } = await supabase
        .from('customers')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedCustomer.id);

      if (updateError) throw updateError;
      console.log('Customer status updated successfully');

      // Record job completion
      const jobCompletionData = {
        customer_id: selectedCustomer.id,
        employee_id: employeeId,
        notes: notes.trim() || null,
        before_status: selectedCustomer.status,
        after_status: newStatus,
        location_lat: location?.lat || null,
        location_lng: location?.lng || null
      };

      console.log('Inserting job completion:', jobCompletionData);

      const { error: jobError } = await supabase
        .from('job_completions')
        .insert(jobCompletionData);

      if (jobError) throw jobError;

      toast({
        title: "Success",
        description: `Job completed! Customer status updated to ${newStatus}`,
      });

      // Reset form
      setSelectedCustomer(null);
      setNotes('');
      setSearchTerm('');
      setNewStatus('existing');
      onClose();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: `Failed to complete job: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const clearSelection = () => {
    setSelectedCustomer(null);
    setSearchTerm('');
    setNewStatus('existing');
    setNotes('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-auto bg-white shadow-xl">
        <CardHeader className="text-center bg-gradient-to-r from-green-50 to-blue-50">
          <CardTitle className="flex items-center gap-2 justify-center text-green-700">
            <Check className="h-5 w-5" />
            Job Completion Update
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading customers...</p>
            </div>
          ) : (
            <>
              {/* Enhanced Customer Search/Select */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Select Customer</label>
                {!selectedCustomer ? (
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setIsDropdownOpen(true);
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        className="pl-10 border-2 border-gray-200 focus:border-green-500 rounded-lg"
                        disabled={customers.length === 0}
                      />
                    </div>
                    
                    {isDropdownOpen && filteredCustomers.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                        {filteredCustomers.slice(0, 10).map(customer => (
                          <div
                            key={customer.id}
                            onClick={() => handleCustomerSelect(customer)}
                            className="p-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{customer.name}</p>
                                <p className="text-sm text-gray-600">{customer.phone}</p>
                              </div>
                              <Badge 
                                variant="outline" 
                                className="text-xs bg-gray-50"
                              >
                                {customer.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {isDropdownOpen && searchTerm && filteredCustomers.length === 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500 z-50">
                        No customers found matching "{searchTerm}"
                      </div>
                    )}
                  </div>
                ) : (
                  /* Selected Customer Display */
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-green-800">{selectedCustomer.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-700">{selectedCustomer.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-700">Current Status:</span>
                            <Badge className="bg-green-100 text-green-800 border-green-300">
                              {selectedCustomer.status}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearSelection}
                          className="text-gray-500 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {selectedCustomer && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">New Status</label>
                    <Select value={newStatus} onValueChange={(value: CustomerStatus) => setNewStatus(value)}>
                      <SelectTrigger className="border-2 border-gray-200 focus:border-green-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-gray-200 shadow-lg">
                        <SelectItem value="existing" className="hover:bg-green-50">Existing</SelectItem>
                        <SelectItem value="finalised" className="hover:bg-green-50">Finalised</SelectItem>
                        <SelectItem value="pending" className="hover:bg-green-50">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Job Notes</label>
                    <Textarea
                      placeholder="Add notes about the completed work..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="border-2 border-gray-200 focus:border-green-500 resize-none"
                    />
                  </div>

                  {location && (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                      <MapPin className="h-4 w-4" />
                      <span>Location captured successfully</span>
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-2 hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedCustomer || submitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    'Complete Job'
                  )}
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
