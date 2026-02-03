import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Clock, 
  Zap, 
  Webhook, 
  Timer,
  Pencil,
  Copy,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Automation {
  id: string;
  name: string;
  trigger: string;
  actions: string[];
  isActive: boolean;
  type: 'customer' | 'ticket';
  triggerType?: 'simple' | 'advanced' | 'time' | 'webhook';
  lastTriggered?: string;
  triggerCount?: number;
}

interface WorkflowSidebarProps {
  automations: Automation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onCreateNew: () => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

const getTriggerIcon = (triggerType?: string) => {
  switch (triggerType) {
    case 'webhook': return <Webhook className="h-3.5 w-3.5" />;
    case 'time': return <Timer className="h-3.5 w-3.5" />;
    case 'advanced': return <Zap className="h-3.5 w-3.5" />;
    default: return <Zap className="h-3.5 w-3.5" />;
  }
};

const WorkflowSidebar = ({
  automations,
  selectedId,
  onSelect,
  onToggle,
  onCreateNew,
  onEdit,
  onDuplicate,
  onDelete
}: WorkflowSidebarProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filteredAutomations = automations.filter(automation =>
    automation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    automation.trigger.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = automations.filter(a => a.isActive).length;

  return (
    <div className="w-72 border-r bg-muted/30 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm">Workflows</h3>
            <p className="text-xs text-muted-foreground">
              {activeCount} active of {automations.length}
            </p>
          </div>
          <Button size="sm" onClick={onCreateNew} className="h-8">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search workflows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 pl-8 text-sm"
          />
        </div>
      </div>

      {/* Workflow List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredAutomations.length === 0 ? (
            <div className="text-center py-8 px-4">
              <Zap className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                {searchTerm ? 'No workflows found' : 'No workflows yet'}
              </p>
              {!searchTerm && (
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={onCreateNew}
                  className="mt-1 h-auto p-0"
                >
                  Create your first workflow
                </Button>
              )}
            </div>
          ) : (
            filteredAutomations.map((automation) => (
              <div
                key={automation.id}
                className={cn(
                  "group relative rounded-lg p-2.5 cursor-pointer transition-colors",
                  selectedId === automation.id 
                    ? "bg-primary/10 border border-primary/20" 
                    : "hover:bg-muted/50"
                )}
                onClick={() => onSelect(automation.id)}
                onMouseEnter={() => setHoveredId(automation.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="flex items-start gap-2">
                  {/* Toggle Switch */}
                  <Switch
                    checked={automation.isActive}
                    onCheckedChange={() => onToggle(automation.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-0.5 scale-75 origin-left"
                  />
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        "text-sm font-medium truncate",
                        !automation.isActive && "text-muted-foreground"
                      )}>
                        {automation.name}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        {getTriggerIcon(automation.triggerType)}
                        {automation.triggerType || 'simple'}
                      </span>
                      {automation.triggerCount !== undefined && automation.triggerCount > 0 && (
                        <span className="text-xs text-muted-foreground">
                          • {automation.triggerCount} runs
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
                          hoveredId === automation.id && "opacity-100"
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem onClick={() => onEdit(automation.id)}>
                        <Pencil className="h-3.5 w-3.5 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDuplicate(automation.id)}>
                        <Copy className="h-3.5 w-3.5 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(automation.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default WorkflowSidebar;
