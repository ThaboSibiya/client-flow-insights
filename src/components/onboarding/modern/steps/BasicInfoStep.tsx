import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Mail, Phone, FileText, Tag } from 'lucide-react';
import { CustomerStatus } from '@/context/CRMContext';

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  notes: string;
}

interface BasicInfoStepProps {
  customerData: CustomerData;
  onUpdateField: (field: keyof CustomerData, value: string) => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  customerData,
  onUpdateField,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-quikle-charcoal mb-2">
          Customer Information
        </h2>
        <p className="text-quikle-slate">
          Enter the basic details for your new customer
        </p>
      </div>

      {/* Form Fields */}
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="w-4 h-4 text-quikle-primary" />
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            placeholder="John Smith"
            value={customerData.name}
            onChange={(e) => onUpdateField('name', e.target.value)}
            className="h-12"
          />
          {customerData.name && customerData.name.length < 2 && (
            <p className="text-xs text-red-500">Name must be at least 2 characters</p>
          )}
        </div>

        {/* Email & Phone Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-quikle-primary" />
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={customerData.email}
              onChange={(e) => onUpdateField('email', e.target.value)}
              className="h-12"
            />
            {customerData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email) && (
              <p className="text-xs text-red-500">Please enter a valid email</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-quikle-primary" />
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={customerData.phone}
              onChange={(e) => onUpdateField('phone', e.target.value)}
              className="h-12"
            />
            {customerData.phone && customerData.phone.length < 5 && (
              <p className="text-xs text-red-500">Please enter a valid phone number</p>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status" className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-quikle-primary" />
            Customer Status
          </Label>
          <Select 
            value={customerData.status} 
            onValueChange={(value) => onUpdateField('status', value)}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  New Customer
                </div>
              </SelectItem>
              <SelectItem value="existing">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Existing Customer
                </div>
              </SelectItem>
              <SelectItem value="pending">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  Pending Policy
                </div>
              </SelectItem>
              <SelectItem value="finalised">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  Finalised Sale
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-quikle-primary" />
            Notes <span className="text-quikle-slate text-xs">(optional)</span>
          </Label>
          <Textarea
            id="notes"
            placeholder="Enter any relevant information about this customer..."
            value={customerData.notes}
            onChange={(e) => onUpdateField('notes', e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;
