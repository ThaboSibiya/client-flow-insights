
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";

interface MessageSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearching: boolean;
  onToggleSearch: () => void;
  searchResults: any[];
  isLoading: boolean;
  onClearSearch: () => void;
}

const MessageSearch = ({
  searchQuery,
  onSearchChange,
  isSearching,
  onToggleSearch,
  searchResults,
  isLoading,
  onClearSearch
}: MessageSearchProps) => {
  return (
    <div className="border-b border-quikle-silver/30">
      <div className="p-3 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleSearch}
          className={cn(
            "shrink-0",
            isSearching && "bg-quikle-crystal"
          )}
        >
          <Search className="h-4 w-4" />
          {isSearching ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
        </Button>
        
        {isSearching && (
          <>
            <div className="relative flex-1">
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pr-8"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearSearch}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            {searchQuery && (
              <Badge variant={isLoading ? "secondary" : "default"}>
                {isLoading ? "Searching..." : `${searchResults.length} found`}
              </Badge>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MessageSearch;
