
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, LayoutGrid, List } from "lucide-react";
import MobilePipelineCard from './MobilePipelineCard';

interface MobilePipelineViewProps {
  stages: any[];
  onMove: (itemId: string, fromStageId: string, toStageId: string) => void;
  type: 'customer' | 'ticket';
}

const MobilePipelineView = ({ stages, onMove, type }: MobilePipelineViewProps) => {
  const [selectedStageId, setSelectedStageId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'stage'>('list');

  // Get all items across stages
  const getAllItems = () => {
    return stages.flatMap(stage => {
      const items = type === 'customer' ? (stage.customers || []) : (stage.tickets || []);
      return items.map(item => ({ ...item, stageId: stage.id }));
    });
  };

  // Filter items based on search and stage selection
  const filteredItems = getAllItems().filter(item => {
    const matchesStage = selectedStageId === 'all' || item.stageId === selectedStageId;
    
    const searchableText = type === 'customer' 
      ? `${item.name} ${item.email}`.toLowerCase()
      : `${item.subject} ${item.ticketNumber}`.toLowerCase();
    const matchesSearch = searchableText.includes(searchTerm.toLowerCase());
    
    return matchesStage && matchesSearch;
  });

  // Group items by stage for stage view
  const groupedByStage = stages.map(stage => ({
    ...stage,
    items: filteredItems.filter(item => item.stageId === stage.id)
  }));

  const totalItems = getAllItems().length;

  return (
    <div className="space-y-4">
      {/* Mobile header with filters */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-quikle-charcoal">
            {type === 'customer' ? 'Customers' : 'Tickets'} Pipeline
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'stage' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('stage')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-quikle-slate" />
          <Input
            placeholder={`Search ${type}s...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Stage filter */}
        <Select value={selectedStageId} onValueChange={setSelectedStageId}>
          <SelectTrigger>
            <SelectValue placeholder="All Stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages ({totalItems})</SelectItem>
            {stages.map((stage) => {
              const itemCount = type === 'customer' 
                ? (stage.customers?.length || 0) 
                : (stage.tickets?.length || 0);
              return (
                <SelectItem key={stage.id} value={stage.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: stage.color }}
                    />
                    {stage.name} ({itemCount})
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* Results count */}
        <div className="flex items-center justify-between text-sm text-quikle-slate">
          <span>{filteredItems.length} {type}s found</span>
          {selectedStageId !== 'all' && (
            <Badge variant="outline" className="text-xs">
              {stages.find(s => s.id === selectedStageId)?.name}
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-quikle-slate">
              <div className="text-4xl mb-2">📋</div>
              <p>No {type}s found</p>
              {searchTerm && (
                <p className="text-sm">Try adjusting your search terms</p>
              )}
            </div>
          ) : (
            filteredItems.map((item) => (
              <MobilePipelineCard
                key={`${item.stageId}-${item.id}`}
                item={item}
                type={type}
                stageId={item.stageId}
                stages={stages}
                onMove={onMove}
              />
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByStage.map((stage) => (
            <div key={stage.id} className="space-y-3">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: stage.color }}
                />
                <h4 className="font-medium text-quikle-charcoal">{stage.name}</h4>
                <Badge variant="outline" className="text-xs">
                  {stage.items.length}
                </Badge>
              </div>
              
              {stage.items.length === 0 ? (
                <div className="text-center py-4 text-quikle-slate border border-dashed border-quikle-silver rounded-lg">
                  <p className="text-sm">No {type}s in this stage</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {stage.items.map((item) => (
                    <MobilePipelineCard
                      key={`${item.stageId}-${item.id}`}
                      item={item}
                      type={type}
                      stageId={item.stageId}
                      stages={stages}
                      onMove={onMove}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobilePipelineView;
