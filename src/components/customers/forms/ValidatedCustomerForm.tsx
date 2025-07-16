
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Customer, CustomerStatus } from '@/types/customer';
import { useCRM } from '@/context/CRMContext';
import StatusSelector from '../StatusSelector';
import { useFormValidation } from '@/hooks/useFormValidation';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ValidatedCustomerFormProps {
  customer?: Customer;
  onClose: () => void;
  onSuccess?: (customer: Customer) => void;
}

const ValidatedCustomerForm = ({ customer, onClose, onSuccess }: ValidatedCustomerFormProps) => {
  const { updateCustomer, addCustomer } = useCRM();
  const isEditing = !!customer;

  const [formData, setFormData] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    notes: customer?.notes || '',
    status: customer?.status || 'new' as CustomerStatus
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    validateForm,
    validateSingleField,
    markFieldTouched,
    getFieldError,
    hasErrors,
    clearErrors
  } = useFormValidation({
    name: {
      required: true,
      minLength: 2,
      maxLength: 100
    },
    email: {
      required: true,
      email: true,
      maxLength: 255
    },
    phone: {
      phone: true,
      maxLength: 20
    },
    address: {
      maxLength: 500
    },
    notes: {
      maxLength: 1000
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    validateSingleField(name, value);
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    markFieldTouched(name);
    validateSingleField(name, value);
  };

  const handleStatusChange = (status: CustomerStatus) => {
    setFormData(prev => ({ ...prev, status }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    Object.keys(formData).forEach(field => markFieldTouched(field));
    
    if (!validateForm(formData)) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (isEditing && customer) {
        await updateCustomer(customer.id, formData);
        const updatedCustomer = { 
          ...customer, 
          ...formData, 
          updatedAt: new Date(),
          updated_at: new Date().toISOString()
        };
        toast({
          title: "Success",
          description: "Customer updated successfully",
        });
        onSuccess?.(updatedCustomer);
      } else {
        const customerToAdd = {
          ...formData,
          activeTickets: [],
          ticketCount: 0,
        };
        await addCustomer(customerToAdd);
        const newCustomer: Customer = {
          ...customerToAdd,
          id: `temp-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: '', // This will be set by the context
        };
        toast({
          title: "Success", 
          description: "Customer added successfully",
        });
        onSuccess?.(newCustomer);
      }
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'add'} customer`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: customer?.name || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
      address: customer?.address || '',
      notes: customer?.notes || '',
      status: customer?.status || 'new'
    });
    clearErrors();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {hasErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix the validation errors before submitting the form.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="text-sm font-medium">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={getFieldError('name') ? 'border-red-500' : ''}
            placeholder="Enter customer name"
          />
          {getFieldError('name') && (
            <p className="text-sm text-red-500 mt-1">{getFieldError('name')}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email" className="text-sm font-medium">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={getFieldError('email') ? 'border-red-500' : ''}
            placeholder="Enter email address"
          />
          {getFieldError('email') && (
            <p className="text-sm text-red-500 mt-1">{getFieldError('email')}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={getFieldError('phone') ? 'border-red-500' : ''}
            placeholder="Enter phone number"
          />
          {getFieldError('phone') && (
            <p className="text-sm text-red-500 mt-1">{getFieldError('phone')}</p>
          )}
        </div>

        <div>
          <Label className="text-sm font-medium">Status</Label>
          <StatusSelector
            status={formData.status}
            onChange={handleStatusChange}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address" className="text-sm font-medium">Address</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className={getFieldError('address') ? 'border-red-500' : ''}
          placeholder="Enter address"
        />
        {getFieldError('address') && (
          <p className="text-sm text-red-500 mt-1">{getFieldError('address')}</p>
        )}
      </div>

      <div>
        <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className={getFieldError('notes') ? 'border-red-500' : ''}
          rows={3}
          placeholder="Add any additional notes..."
        />
        {getFieldError('notes') && (
          <p className="text-sm text-red-500 mt-1">{getFieldError('notes')}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="button" variant="outline" onClick={handleReset} disabled={isSubmitting}>
          Reset
        </Button>
        <Button type="submit" disabled={isSubmitting || hasErrors}>
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              {isEditing ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              {isEditing ? 'Update Customer' : 'Add Customer'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ValidatedCustomerForm;
