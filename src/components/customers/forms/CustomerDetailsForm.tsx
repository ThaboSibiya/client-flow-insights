
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, MessageSquare, FileText, Phone, Mail, Building, MapPin, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Customer, useCRM } from '@/context/CRMContext';
import StatusSelector from '../StatusSelector';
import TicketsList from '../tickets/TicketsList';

interface CustomerDetailsFormProps {
  customer: Customer;
  onClose: () => void;
}

const CustomerDetailsForm = ({ customer, onClose }: CustomerDetailsFormProps) => {
  const { updateCustomer, updateTicketStatus, addTimeEntry } = useCRM();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    company: customer.company,
    address: customer.address || '',
    notes: customer.notes || ''
  });

  const handleSave = () => {
    updateCustomer(customer.id, formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      company: customer.company,
      address: customer.address || '',
      notes: customer.notes || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="tickets" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Tickets ({customer.tickets.length})
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{customer.name}</h3>
                <p className="text-sm text-gray-500">{customer.company}</p>
              </div>
              <StatusSelector
                currentStatus={customer.status}
                onStatusChange={(status) => updateCustomer(customer.id, { status })}
                customerId={customer.id}
              />
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>Edit</Button>
              ) : (
                <>
                  <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                  <Button onClick={handleSave}>Save Changes</Button>
                </>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-gray-700 uppercase tracking-wide">Contact Information</h4>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {isEditing ? (
                    <div className="flex-1">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p>{customer.email}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {isEditing ? (
                    <div className="flex-1">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p>{customer.phone}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-400" />
                  {isEditing ? (
                    <div className="flex-1">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p>{customer.company}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {isEditing ? (
                    <div className="flex-1">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        rows={2}
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p>{customer.address || 'Not provided'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-sm text-gray-700 uppercase tracking-wide">Account Information</h4>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p>{new Date(customer.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p>{new Date(customer.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Total Tickets</p>
                    <p>{customer.tickets.length}</p>
                  </div>
                </div>
              </div>

              {isEditing ? (
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    placeholder="Add any notes about this customer..."
                  />
                </div>
              ) : customer.notes && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Notes</p>
                  <div className="bg-gray-50 p-3 rounded border">
                    <p className="text-sm">{customer.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4">
          <TicketsList
            tickets={customer.tickets}
            onUpdateTicketStatus={updateTicketStatus}
            onAddTimeEntry={addTimeEntry}
            customerEmail={customer.email}
            customerName={customer.name}
            customerId={customer.id}
          />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Activity timeline coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerDetailsForm;
