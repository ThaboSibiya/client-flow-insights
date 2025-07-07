
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface CustomerTableHeaderProps {
  userIndustry?: string;
  customerCount: number;
}

const CustomerTableHeader = React.memo(({ userIndustry, customerCount }: CustomerTableHeaderProps) => (
  <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          {userIndustry ? `${userIndustry.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Customers` : 'Customers'}
        </h3>
        <p className="text-sm text-slate-600 mt-1">Manage your customer relationships and service history</p>
      </div>
      <Badge variant="outline" className="bg-white shadow-sm border-slate-300">
        {customerCount} customer{customerCount !== 1 ? 's' : ''}
      </Badge>
    </div>
  </div>
));

CustomerTableHeader.displayName = 'CustomerTableHeader';

export default CustomerTableHeader;
