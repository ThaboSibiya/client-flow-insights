
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Customer, CustomerStatus, useCRM } from '@/context/CRMContext';
import { ChartBar, Edit, Trash2, Eye, Plus, Search } from 'lucide-react';
import CustomerDetailsForm from './CustomerDetailsForm';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const CustomerTable = () => {
  const { customers, updateCustomerStatus, deleteCustomer } = useCRM();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const pageSize = 5;
  
  // Filter by status and search query
  const filteredCustomers = customers
    .filter(customer => statusFilter === 'all' || customer.status === statusFilter)
    .filter(customer => 
      searchQuery === '' || 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const currentCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleStatusChange = (customerId: string, newStatus: CustomerStatus) => {
    updateCustomerStatus(customerId, newStatus);
  };

  const handleDeleteCustomer = (customerId: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      deleteCustomer(customerId);
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getStatusColor = (status: CustomerStatus) => {
    switch(status) {
      case 'new': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'existing': return 'bg-green-50 text-green-700 border-green-200';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'finalised': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusTriggerColor = (status: CustomerStatus) => {
    switch(status) {
      case 'new': return 'border-blue-200 text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 hover:border-blue-300';
      case 'existing': return 'border-green-200 text-green-700 bg-gradient-to-r from-green-50 to-green-100 hover:border-green-300';
      case 'pending': return 'border-amber-200 text-amber-700 bg-gradient-to-r from-amber-50 to-amber-100 hover:border-amber-300';
      case 'finalised': return 'border-purple-200 text-purple-700 bg-gradient-to-r from-purple-50 to-purple-100 hover:border-purple-300';
      default: return '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-6 bg-gradient-to-r from-white via-gray-50 to-white border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[180px] bg-white shadow-sm hover:shadow transform hover:translate-y-[-1px] transition-all">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-medium">All Customers</SelectItem>
                <SelectItem value="new" className="text-blue-600">New</SelectItem>
                <SelectItem value="existing" className="text-green-600">Existing</SelectItem>
                <SelectItem value="pending" className="text-amber-600">Pending Policy</SelectItem>
                <SelectItem value="finalised" className="text-purple-600">Finalised Sale</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto relative">
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 max-w-[300px] bg-white shadow-sm hover:shadow focus:shadow-md transition-all"
            />
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border shadow-md bg-white hover:shadow-lg transition-shadow duration-300">
        <Table>
          <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
            <TableRow>
              <TableHead className="font-medium">Name</TableHead>
              <TableHead className="font-medium">Email</TableHead>
              <TableHead className="font-medium">Phone</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="font-medium">Created</TableHead>
              <TableHead className="font-medium text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentCustomers.map((customer) => (
              <TableRow key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>
                  <Select
                    value={customer.status}
                    onValueChange={(value) => handleStatusChange(customer.id, value as CustomerStatus)}
                  >
                    <SelectTrigger className={`w-[140px] ${getStatusTriggerColor(customer.status)} shadow-sm hover:shadow-md transition-all`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new" className="text-blue-600">New</SelectItem>
                      <SelectItem value="existing" className="text-green-600">Existing</SelectItem>
                      <SelectItem value="pending" className="text-amber-600">Pending</SelectItem>
                      <SelectItem value="finalised" className="text-purple-600">Finalised</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>{formatDate(customer.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex justify-end space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => handleEditCustomer(customer)} className="hover:scale-110 transition-transform">
                            <Edit className="h-4 w-4 text-gray-500 hover:text-broker-primary" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit Customer</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteCustomer(customer.id)} className="hover:scale-110 transition-transform">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete Customer</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            
            {currentCustomers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  {searchQuery || statusFilter !== 'all' ? 'No customers match your search' : 'No customers found'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {filteredCustomers.length > pageSize && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : 'hover:scale-105 hover:shadow-md transition-all'}`}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink 
                  isActive={currentPage === i + 1} 
                  onClick={() => setCurrentPage(i + 1)}
                  className={`${currentPage === i + 1 ? 
                    'bg-gradient-to-r from-broker-primary to-broker-accent text-white shadow-md' : 
                    'hover:scale-105 hover:shadow-sm transition-all'}`}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : 'hover:scale-105 hover:shadow-md transition-all'}`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Edit Customer Dialog */}
      <CustomerDetailsForm 
        customer={selectedCustomer} 
        isOpen={isFormOpen} 
        onClose={() => {
          setIsFormOpen(false);
          setSelectedCustomer(null);
        }} 
      />
    </div>
  );
};

export default CustomerTable;
