
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Customer } from '@/types/customer';
import { Mail, Phone, MapPin, Calendar, FileText } from 'lucide-react';

interface CustomerDetailsDialogProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

const CustomerDetailsDialog = ({ customer, isOpen, onClose }: CustomerDetailsDialogProps) => {
  if (!customer) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'existing':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'finalised':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{customer.name}</span>
            <Badge className={getStatusColor(customer.status)}>
              {customer.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-quikle-slate" />
                <span className="text-sm">{customer.email}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-quikle-slate" />
                  <span className="text-sm">{customer.phone}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-quikle-slate" />
                  <span className="text-sm">{customer.address}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-quikle-slate" />
                <span className="text-sm">
                  Created: {new Date(customer.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Company Information */}
          {(customer.contact_person || customer.company_address) && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Company Information</h3>
              <div className="grid grid-cols-1 gap-4">
                {customer.contact_person && (
                  <div>
                    <span className="text-sm font-medium">Contact Person: </span>
                    <span className="text-sm">{customer.contact_person}</span>
                  </div>
                )}
                {customer.company_address && (
                  <div>
                    <span className="text-sm font-medium">Company Address: </span>
                    <span className="text-sm">{customer.company_address}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Equipment */}
          {customer.equipment && customer.equipment.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Equipment</h3>
              <div className="space-y-2">
                {customer.equipment.map((equipment) => (
                  <div key={equipment.id} className="border rounded-lg p-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>Type:</strong> {equipment.equipment_type}</div>
                      {equipment.brand && <div><strong>Brand:</strong> {equipment.brand}</div>}
                      {equipment.model && <div><strong>Model:</strong> {equipment.model}</div>}
                      {equipment.serial_number && <div><strong>Serial:</strong> {equipment.serial_number}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {customer.notes && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notes
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm whitespace-pre-wrap">{customer.notes}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailsDialog;
