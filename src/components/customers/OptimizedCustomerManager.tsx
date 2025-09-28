import React, { useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Upload, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Star,
  StarOff,
  Users,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useOptimisticCRUD } from '@/hooks/useOptimisticCRUD';
import { useInstantSearch } from '@/hooks/useInstantSearch';
import { useSmartNavigation } from '@/hooks/useSmartNavigation';
import { SmartForm } from '@/components/common/SmartForm';
import { useCRM } from '@/context/CRMContext';
import { Customer, CustomerStatus } from '@/types/customer';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';

// Customer validation schema
const customerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address').max(255, 'Email too long'),
  phone: z.string().min(10, 'Phone number too short').max(20, 'Phone number too long'),
  address: z.string().max(500, 'Address too long').optional(),
  company: z.string().max(100, 'Company name too long').optional(),
  status: z.enum(['new', 'existing', 'pending', 'finalised'] as const),
  notes: z.string().max(1000, 'Notes too long').optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface OptimizedCustomerManagerProps {
  className?: string;
}

export const OptimizedCustomerManager: React.FC<OptimizedCustomerManagerProps> = ({ 
  className = '' 
}) => {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useCRM();
  const { navigate } = useSmartNavigation();

  // Search and filter configuration
  const searchOptions = useMemo(() => ({
    searchFields: ['name', 'email', 'phone', 'company'] as (keyof Customer)[],
    filterFunctions: {
      status: (customer: Customer, status: CustomerStatus) => customer.status === status,
      hasTickets: (customer: Customer, hasTickets: boolean) => 
        hasTickets ? customer.ticketCount > 0 : customer.ticketCount === 0,
      recentlyAdded: (customer: Customer, recent: boolean) => {
        if (!recent) return true;
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return new Date(customer.createdAt) > weekAgo;
      },
    },
    sortOptions: {
      name: (a: Customer, b: Customer) => a.name.localeCompare(b.name),
      email: (a: Customer, b: Customer) => a.email.localeCompare(b.email),
      created: (a: Customer, b: Customer) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      tickets: (a: Customer, b: Customer) => a.ticketCount - b.ticketCount,
    },
    debounceMs: 200,
  }), []);

  // Initialize search
  const {
    items: filteredCustomers,
    searchState,
    searchStats,
    setQuery,
    setFilter,
    removeFilter,
    clearFilters,
    setSort,
    setPage,
    highlightText,
    saveSearchPreset,
    loadSearchPreset,
    getSearchPresets,
  } = useInstantSearch(customers, searchOptions);

  // Initialize optimistic CRUD
  const customerApiService = useMemo(() => ({
    create: async (customerData: Omit<Customer, 'id'>) => {
      return await addCustomer(customerData);
    },
    update: async (id: string, updates: Partial<Customer>) => {
      await updateCustomer(id, updates);
      return { ...customers.find(c => c.id === id)!, ...updates };
    },
    delete: async (id: string) => {
      await deleteCustomer(id);
    },
  }), [addCustomer, updateCustomer, deleteCustomer, customers]);

  const {
    createItem,
    updateItem,
    deleteItem,
    bulkDelete,
    loading: crudLoading,
    pendingUpdates,
  } = useOptimisticCRUD(customers, customerApiService);

  // Customer creation with optimistic updates
  const handleCreateCustomer = useCallback(async (data: CustomerFormData) => {
    try {
      const newCustomer = await createItem({
        ...data,
        id: '', // Will be set by the API
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        activeTickets: [],
        ticketCount: 0,
      });
      
      toast({
        title: "Customer created",
        description: `${newCustomer.name} has been added to your customer list`,
      });
    } catch (error) {
      console.error('Failed to create customer:', error);
    }
  }, [createItem]);

  // Customer update with optimistic updates
  const handleUpdateCustomer = useCallback(async (id: string, updates: Partial<CustomerFormData>) => {
    try {
      await updateItem(id, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to update customer:', error);
    }
  }, [updateItem]);

  // Customer deletion with optimistic updates
  const handleDeleteCustomer = useCallback(async (id: string) => {
    try {
      await deleteItem(id);
    } catch (error) {
      console.error('Failed to delete customer:', error);
    }
  }, [deleteItem]);

  // Bulk operations
  const handleBulkDelete = useCallback(async (customerIds: string[]) => {
    if (customerIds.length === 0) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${customerIds.length} customer(s)? This action cannot be undone.`
    );
    
    if (confirmed) {
      try {
        await bulkDelete(customerIds);
      } catch (error) {
        console.error('Failed to delete customers:', error);
      }
    }
  }, [bulkDelete]);

  // Quick stats
  const customerStats = useMemo(() => {
    const total = customers.length;
    const byStatus = customers.reduce((acc, customer) => {
      acc[customer.status] = (acc[customer.status] || 0) + 1;
      return acc;
    }, {} as Record<CustomerStatus, number>);

    return {
      total,
      new: byStatus.new || 0,
      existing: byStatus.existing || 0,
      pending: byStatus.pending || 0,
      finalised: byStatus.finalised || 0,
      withTickets: customers.filter(c => c.ticketCount > 0).length,
    };
  }, [customers]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customer Management</h1>
          <p className="text-muted-foreground">
            Manage your {customerStats.total} customers efficiently
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => navigate('/customers/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Quick stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-xl font-bold">{customerStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">New</p>
                <p className="text-xl font-bold">{customerStats.new}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Existing</p>
                <p className="text-xl font-bold">{customerStats.existing}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-xl font-bold">{customerStats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <StarOff className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium">Finalised</p>
                <p className="text-xl font-bold">{customerStats.finalised}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium">With Tickets</p>
                <p className="text-xl font-bold">{customerStats.withTickets}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4">
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers by name, email, phone, or company..."
                value={searchState.query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <Select 
                value={searchState.filters.status || ''} 
                onValueChange={(value) => value ? setFilter('status', value) : removeFilter('status')}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="existing">Existing</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="finalised">Finalised</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={searchState.filters.hasTickets?.toString() || ''} 
                onValueChange={(value) => 
                  value ? setFilter('hasTickets', value === 'true') : removeFilter('hasTickets')
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Tickets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Customers</SelectItem>
                  <SelectItem value="true">With Tickets</SelectItem>
                  <SelectItem value="false">No Tickets</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={searchState.sortBy || ''} 
                onValueChange={(value) => value && setSort(value, searchState.sortOrder)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="created">Date Created</SelectItem>
                  <SelectItem value="tickets">Ticket Count</SelectItem>
                </SelectContent>
              </Select>

              {Object.keys(searchState.filters).length > 0 && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Search stats */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {filteredCustomers.length} of {searchStats.totalItems} customers
                {searchStats.isSearching && ` (filtered by "${searchState.query}")`}
              </span>
              
              {pendingUpdates > 0 && (
                <Badge variant="secondary">
                  {pendingUpdates} pending update{pendingUpdates !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer list/grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {highlightText(customer.name, searchState.query).map((part, index) => (
                    <span 
                      key={part.key} 
                      className={part.highlighted ? 'bg-yellow-200' : ''}
                    >
                      {part.text}
                    </span>
                  ))}
                </CardTitle>
                <Badge 
                  variant={
                    customer.status === 'new' ? 'default' :
                    customer.status === 'existing' ? 'secondary' :
                    customer.status === 'pending' ? 'outline' : 'destructive'
                  }
                >
                  {customer.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {highlightText(customer.email, searchState.query).map((part, index) => (
                    <span 
                      key={part.key} 
                      className={part.highlighted ? 'bg-yellow-200' : ''}
                    >
                      {part.text}
                    </span>
                  ))}
                </p>
                
                <p className="text-sm text-muted-foreground">
                  {highlightText(customer.phone, searchState.query).map((part, index) => (
                    <span 
                      key={part.key} 
                      className={part.highlighted ? 'bg-yellow-200' : ''}
                    >
                      {part.text}
                    </span>
                  ))}
                </p>
                
                {customer.company && (
                  <p className="text-sm text-muted-foreground">
                    {highlightText(customer.company, searchState.query).map((part, index) => (
                      <span 
                        key={part.key} 
                        className={part.highlighted ? 'bg-yellow-200' : ''}
                      >
                        {part.text}
                      </span>
                    ))}
                  </p>
                )}
                
                {customer.ticketCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {customer.ticketCount} ticket{customer.ticketCount !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-muted-foreground">
                  Added {new Date(customer.createdAt).toLocaleDateString()}
                </span>
                
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/customers/${customer.id}`)}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/customers/${customer.id}/edit`)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteCustomer(customer.id)}
                    disabled={crudLoading}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredCustomers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchStats.isSearching || searchStats.hasFilters 
                ? 'No customers found' 
                : 'No customers yet'
              }
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchStats.isSearching || searchStats.hasFilters
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first customer'
              }
            </p>
            {(!searchStats.isSearching && !searchStats.hasFilters) && (
              <Button onClick={() => navigate('/customers/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Customer
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OptimizedCustomerManager;