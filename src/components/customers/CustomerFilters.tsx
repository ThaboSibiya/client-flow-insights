
import React from 'react';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface CustomerFiltersProps {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
}

const CustomerFilters = ({ 
  statusFilter, 
  onStatusFilterChange, 
  searchQuery, 
  onSearchQueryChange 
}: CustomerFiltersProps) => {
  return (
    <div className="p-4 sm:p-6 bg-gradient-to-r from-white via-gray-50 to-white border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
        <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2">
          <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Filter by status:</span>
          <Select
            value={statusFilter}
            onValueChange={(value) => onStatusFilterChange(value)}
          >
            <SelectTrigger className="w-full xs:w-[140px] sm:w-[180px] bg-white shadow-sm hover:shadow transform hover:translate-y-[-1px] transition-all text-xs sm:text-sm">
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
        
        <div className="relative w-full sm:w-auto sm:max-w-[300px]">
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="pl-9 w-full bg-white shadow-sm hover:shadow focus:shadow-md transition-all text-sm"
          />
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default CustomerFilters;
