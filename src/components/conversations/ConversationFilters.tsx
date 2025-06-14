
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, Calendar, User, Tag } from 'lucide-react';

interface ConversationFiltersProps {
  onFilterChange: (filters: any) => void;
  activeFilters: any;
}

const ConversationFilters = ({ onFilterChange, activeFilters }: ConversationFiltersProps) => {
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'closed', label: 'Closed' },
    { value: 'archived', label: 'Archived' },
  ];

  const timeRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' },
  ];

  return (
    <div className="flex items-center gap-2 p-4 bg-white border-b border-quikle-silver/20">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {Object.keys(activeFilters).length > 0 && (
              <Badge className="ml-2 text-xs">
                {Object.keys(activeFilters).length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <Tag className="h-4 w-4 mr-2" />
            Status
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </DropdownMenuItem>
          <DropdownMenuItem>
            <User className="h-4 w-4 mr-2" />
            Assigned To
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {activeFilters.status && (
        <Badge variant="secondary" className="text-xs">
          Status: {activeFilters.status}
        </Badge>
      )}
      
      {activeFilters.timeRange && (
        <Badge variant="secondary" className="text-xs">
          Time: {activeFilters.timeRange}
        </Badge>
      )}
    </div>
  );
};

export default ConversationFilters;
