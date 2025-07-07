
export interface FilterPreset {
  id: string;
  name: string;
  filters: {
    status: string;
    ticketFilter: string;
    dateRange: { start: Date | null; end: Date | null };
    searchQuery: string;
  };
}

export interface FilterFunctions {
  status: (customer: any) => boolean;
  search: (customer: any) => boolean;
  dateRange: (customer: any) => boolean;
  ticket: (customer: any) => boolean;
}

export interface UseCustomerFiltersReturn {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  ticketFilter: string;
  setTicketFilter: (value: string) => void;
  ticketCountFilter: string;
  setTicketCountFilter: (value: string) => void;
  dateRange: { start: Date | null; end: Date | null };
  setDateRange: (value: { start: Date | null; end: Date | null }) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (value: 'asc' | 'desc') => void;
  resetFilters: () => void;
  activeFilters: string[];
  filteredCustomers: any[];
  savedPresets: FilterPreset[];
  applyPreset: (presetId: string) => void;
  loadFilterPreset: (presetId: string) => void;
  saveCurrentAsPreset: (name: string) => void;
  saveFilterPreset: (name: string) => void;
  deleteFilterPreset: (presetId: string) => void;
  getQuickDateRange: (range: string) => void;
}
