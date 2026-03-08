import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Plus, Settings, Users, Ticket, 
  TrendingUp, X
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PipelineType } from '@/hooks/usePipeline';

interface PipelineHeaderProps {
  type: PipelineType;
  onTypeChange: (type: PipelineType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddStage: () => void;
  onOpenSettings: () => void;
  totalItems: number;
  completedItems: number;
  conversionRate: number;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

const PipelineHeader = ({
  type,
  onTypeChange,
  searchQuery,
  onSearchChange,
  onAddStage,
  onOpenSettings,
  totalItems,
  completedItems,
  conversionRate,
  isSearchOpen,
  setIsSearchOpen,
}: PipelineHeaderProps) => {
  return (
    <div className="flex flex-col gap-3 pb-3 border-b border-border/50">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Type toggle */}
          <div className="flex items-center bg-muted/50 rounded-lg p-0.5">
            <Button
              variant={type === 'customer' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTypeChange('customer')}
              className="gap-1.5 h-8"
            >
              <Users className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Customers</span>
            </Button>
            <Button
              variant={type === 'ticket' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTypeChange('ticket')}
              className="gap-1.5 h-8"
            >
              <Ticket className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Tickets</span>
            </Button>
          </div>

          {/* Inline metrics */}
          <div className="hidden md:flex items-center gap-3 text-xs">
            <span className="text-muted-foreground">
              {totalItems} total
            </span>
            <span className="text-green-600 font-medium">
              {completedItems} done
            </span>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
              <span className={`font-medium ${conversionRate >= 50 ? 'text-green-600' : 'text-amber-600'}`}>
                {conversionRate.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isSearchOpen ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                >
                  <Search className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="flex items-center gap-2">
                  <span>Search</span>
                  <Badge variant="outline" className="text-[10px]">⌘K</Badge>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onOpenSettings}>
                  <Settings className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button onClick={onAddStage} size="sm" className="gap-1.5 h-8">
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs">Stage</span>
          </Button>
        </div>
      </div>

      {/* Collapsible search */}
      {isSearchOpen && (
        <div className="flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder={`Search ${type}s...`}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 pr-8 h-8 text-sm"
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0.5 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => onSearchChange('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground hidden sm:block">ESC to close</span>
        </div>
      )}
    </div>
  );
};

export default PipelineHeader;
