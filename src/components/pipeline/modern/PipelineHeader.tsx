import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Plus, Settings, Users, Ticket, 
  TrendingUp, Keyboard, X
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
    <div className="flex flex-col gap-4 pb-4 border-b border-border/50">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Pipeline
            </h1>
            <p className="text-sm text-muted-foreground">
              Drag and drop to move items between stages
            </p>
          </div>

          {/* Type toggle */}
          <div className="flex items-center bg-muted/50 rounded-lg p-1">
            <Button
              variant={type === 'customer' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTypeChange('customer')}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Customers</span>
            </Button>
            <Button
              variant={type === 'ticket' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTypeChange('ticket')}
              className="gap-2"
            >
              <Ticket className="h-4 w-4" />
              <span className="hidden sm:inline">Tickets</span>
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Inline metrics */}
          <div className="hidden md:flex items-center gap-4 mr-4 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-semibold">{totalItems}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Completed:</span>
              <span className="font-semibold text-green-600">{completedItems}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <span className={`font-semibold ${conversionRate >= 50 ? 'text-green-600' : 'text-amber-600'}`}>
                {conversionRate.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Search toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isSearchOpen ? 'secondary' : 'outline'}
                  size="icon"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="flex items-center gap-2">
                  <span>Search</span>
                  <Badge variant="outline" className="text-xs">⌘K</Badge>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={onOpenSettings}>
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button onClick={onAddStage} className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Stage</span>
          </Button>
        </div>
      </div>

      {/* Search bar (collapsible) */}
      {isSearchOpen && (
        <div className="flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${type}s...`}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-10"
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => onSearchChange('')}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Keyboard className="h-3.5 w-3.5" />
            <span>ESC to close</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PipelineHeader;
