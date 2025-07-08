
import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { useCustomerData } from '@/hooks/useCustomerData';
import { useCustomerFilters } from '@/hooks/useCustomerFilters';
import CustomerTable from './CustomerTable';
import EnhancedFilters from './EnhancedFilters';

const CustomerTableOptimized = () => {
  const { customers, isLoading, error } = useCustomerData();
  
  const {
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    ticketFilter,
    setTicketFilter,
    dateRange,
    setDateRange,
    filteredCustomers,
    savedPresets,
    applyPreset,
    saveCurrentAsPreset,
    getQuickDateRange,
  } = useCustomerFilters(customers);

  const handleQuickDateRange = (range: string) => {
    getQuickDateRange(range);
  };

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          Error loading customers: {error}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <EnhancedFilters
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        ticketFilter={ticketFilter}
        onTicketFilterChange={setTicketFilter}
        savedPresets={savedPresets}
        onApplyPreset={applyPreset}
        onSavePreset={saveCurrentAsPreset}
        onQuickDateRange={handleQuickDateRange}
      />
      
      <CustomerTable 
        customers={filteredCustomers}
        isLoading={isLoading}
      />
    </div>
  );
};

export default CustomerTableOptimized;
