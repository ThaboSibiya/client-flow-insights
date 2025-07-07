
import React from 'react';
import { Customer } from '@/types/customer';
import { useIndustryCustomerFields } from '@/hooks/useIndustryCustomerFields';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Edit, 
  FileText, 
  Trash2,
  Eye 
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useCustomerActions } from '@/components/customers/actions/CustomerActions';

interface DynamicCustomerTableProps {
  customers: Customer[];
  onCustomerClick?: (customer: Customer) => void;
}

const DynamicCustomerTable = ({ customers, onCustomerClick }: DynamicCustomerTableProps) => {
  const { tableColumns, isLoading, userIndustry } = useIndustryCustomerFields();
  const { 
    handleOpenCustomerDetails, 
    handleManageTickets, 
    handleDeleteCustomer,
    CustomerDialogs 
  } = useCustomerActions();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const getFieldValue = (customer: Customer, fieldName: string): string => {
    // Handle nested properties and industry-specific fields
    if (fieldName === 'company_name' || fieldName === 'client_name' || fieldName === 'business_name') {
      return customer.name;
    }
    
    if (fieldName === 'printer_brand' || fieldName === 'equipment_brand') {
      return customer.equipment?.[0]?.brand || 'N/A';
    }
    
    if (fieldName === 'printer_model' || fieldName === 'equipment_model') {
      return customer.equipment?.[0]?.model || 'N/A';
    }
    
    // Handle standard customer properties
    const value = (customer as any)[fieldName];
    return value || 'N/A';
  };

  const getTicketBadgeColor = (count: number) => {
    if (count === 0) return 'secondary';
    if (count <= 2) return 'default';
    if (count <= 5) return 'outline';
    return 'destructive';
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {userIndustry ? `${userIndustry.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Customers` : 'Customers'}
            </h3>
            <Badge variant="outline" className="text-xs">
              {customers.length} customers
            </Badge>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {tableColumns.map((column) => (
                  <th
                    key={column.name}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.label}
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tickets
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onCustomerClick?.(customer)}
                >
                  {tableColumns.map((column) => (
                    <td key={column.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getFieldValue(customer, column.name)}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={getTicketBadgeColor(customer.ticketCount || 0)}
                        className="text-xs"
                      >
                        {customer.ticketCount || 0} tickets
                      </Badge>
                      {customer.ticketCount && customer.ticketCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleManageTickets(customer);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <FileText className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant={
                        customer.status === 'new' ? 'default' :
                        customer.status === 'existing' ? 'secondary' :
                        customer.status === 'pending' ? 'outline' : 'destructive'
                      }
                      className="capitalize"
                    >
                      {customer.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(customer.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCustomerDetails(customer);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCustomerDetails(customer);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Customer
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleManageTickets(customer);
                          }}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Manage Tickets
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCustomer(customer.id);
                          }}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Customer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {customers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No customers found</p>
            <p className="text-sm">Add your first customer to get started</p>
          </div>
        )}
      </div>
      
      <CustomerDialogs />
    </>
  );
};

export default DynamicCustomerTable;
