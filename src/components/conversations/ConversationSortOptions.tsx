
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, SortAsc, SortDesc } from 'lucide-react';

interface ConversationSortOptionsProps {
  sortOptions: {
    field: string;
    direction: 'asc' | 'desc';
  };
  onUpdateSort: (field: string, direction?: string) => void;
}

const ConversationSortOptions = ({ sortOptions, onUpdateSort }: ConversationSortOptionsProps) => {
  const sortItems = [
    { field: 'last_message_at', label: 'Last Activity' },
    { field: 'created_at', label: 'Date Created' },
    { field: 'subject', label: 'Subject' },
    { field: 'unread_count', label: 'Unread Messages' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <ArrowUpDown className="h-4 w-4 mr-2" />
          Sort
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {sortItems.map((item) => (
          <DropdownMenuItem
            key={item.field}
            onClick={() => onUpdateSort(item.field)}
            className="flex items-center justify-between"
          >
            <span>{item.label}</span>
            {sortOptions.field === item.field && (
              sortOptions.direction === 'desc' ? 
                <SortDesc className="h-4 w-4" /> : 
                <SortAsc className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ConversationSortOptions;
