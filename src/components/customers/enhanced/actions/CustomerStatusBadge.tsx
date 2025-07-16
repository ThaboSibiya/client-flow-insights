
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CustomerStatus } from '@/types/customer';

interface CustomerStatusBadgeProps {
  status: CustomerStatus;
}

const getStatusColor = (status: CustomerStatus) => {
  switch (status) {
    case 'new': return 'bg-blue-100 text-blue-800';
    case 'existing': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'finalised': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const CustomerStatusBadge = ({ status }: CustomerStatusBadgeProps) => {
  return (
    <Badge className={`${getStatusColor(status)} capitalize`}>
      {status}
    </Badge>
  );
};

export default CustomerStatusBadge;
