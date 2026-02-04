import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Phone, Mail, Plus, Users } from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  MobileCard, 
  MobileSheet, 
  MobileEmptyState, 
  FloatingActionButton,
  PullToRefresh,
  SwipeableRow
} from '@/components/mobile';
import { cn } from '@/lib/utils';

const MobileCustomersView: React.FC = () => {
  const navigate = useNavigate();
  const { customers } = useCRM();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const handleRefresh = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = !searchQuery || 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: customers.length,
    new: customers.filter(c => c.status === 'new').length,
    existing: customers.filter(c => c.status === 'existing').length,
    pending: customers.filter(c => c.status === 'pending').length,
    finalised: customers.filter(c => c.status === 'finalised').length,
  };

  const statusFilters = [
    { value: 'all', label: 'All', count: statusCounts.all },
    { value: 'new', label: 'New', count: statusCounts.new },
    { value: 'existing', label: 'Existing', count: statusCounts.existing },
    { value: 'pending', label: 'Pending', count: statusCounts.pending },
    { value: 'finalised', label: 'Finalised', count: statusCounts.finalised },
  ];

  const getStatusBadgeVariant = (status: string | null) => {
    switch (status) {
      case 'new': return 'default';
      case 'existing': return 'secondary';
      case 'pending': return 'outline';
      case 'finalised': return 'default';
      default: return 'secondary';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="px-4 py-3 bg-background border-b border-border/50 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">Clients</h1>
            <p className="text-xs text-muted-foreground">
              {filteredCustomers.length} of {customers.length} clients
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="bg-background border-b border-border/30">
        <ScrollArea className="w-full">
          <div className="flex items-center gap-2 px-4 py-2">
            {statusFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={statusFilter === filter.value ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'h-8 flex-shrink-0 text-xs gap-1.5',
                  statusFilter === filter.value && 'bg-primary text-primary-foreground'
                )}
                onClick={() => setStatusFilter(filter.value)}
              >
                {filter.label}
                <Badge 
                  variant="secondary" 
                  className={cn(
                    'h-5 px-1.5 text-[10px]',
                    statusFilter === filter.value && 'bg-primary-foreground/20 text-primary-foreground'
                  )}
                >
                  {filter.count}
                </Badge>
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Customer List */}
      <PullToRefresh onRefresh={handleRefresh} className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {filteredCustomers.length === 0 ? (
            <MobileEmptyState
              icon={<Users />}
              title={searchQuery ? 'No results found' : 'No clients yet'}
              description={
                searchQuery 
                  ? 'Try adjusting your search terms' 
                  : 'Add your first client to get started'
              }
              action={!searchQuery ? {
                label: 'Add Client',
                onClick: () => navigate('/onboarding'),
              } : undefined}
            />
          ) : (
            <div className="divide-y divide-border/50">
              {filteredCustomers.map((customer) => (
                <SwipeableRow
                  key={customer.id}
                  leftActions={customer.phone ? [{
                    icon: <Phone className="h-4 w-4" />,
                    label: 'Call',
                    color: 'text-white',
                    bgColor: 'bg-green-500',
                    onClick: () => window.location.href = `tel:${customer.phone}`,
                  }] : []}
                  rightActions={[{
                    icon: <Mail className="h-4 w-4" />,
                    label: 'Email',
                    color: 'text-white',
                    bgColor: 'bg-blue-500',
                    onClick: () => window.location.href = `mailto:${customer.email}`,
                  }]}
                >
                  <MobileCard
                    title={customer.name}
                    subtitle={customer.email}
                    description={customer.phone || undefined}
                    avatar={{
                      fallback: getInitials(customer.name),
                    }}
                    badges={[
                      {
                        label: customer.status || 'new',
                        variant: getStatusBadgeVariant(customer.status),
                      },
                    ]}
                    onClick={() => {
                      // Navigate to customer detail or open dialog
                      // For now, we'll rely on the existing table behavior
                    }}
                    showChevron
                  />
                </SwipeableRow>
              ))}
            </div>
          )}
        </ScrollArea>
      </PullToRefresh>

      {/* FAB */}
      <FloatingActionButton
        onClick={() => navigate('/onboarding')}
        icon={<Plus className="h-6 w-6" />}
        position="bottom-right"
      />
    </div>
  );
};

export default MobileCustomersView;
