
import React, { useState } from 'react';
import { 
  Zap, Bot, MessageSquare, Tags, FileSearch, GitBranch, RefreshCw, 
  Clock, AlertTriangle, Mail, Phone, Database, Globe, Play, UserCheck,
  Webhook, ChevronDown, ChevronRight, GripVertical, Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { NODE_PALETTE, CATEGORY_LABELS, CATEGORY_COLORS } from './constants';
import { NodeCategory, NodePaletteItem, WorkflowNodeType } from './types';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap, Bot, MessageSquare, Tags, FileSearch, GitBranch, RefreshCw,
  Clock, AlertTriangle, Mail, Phone, Database, Globe, Play, UserCheck, Webhook
};

interface NodePaletteProps {
  onDragStart: (event: React.DragEvent, nodeType: WorkflowNodeType, nodeName: string, category: NodeCategory) => void;
}

const NodePalette = ({ onDragStart }: NodePaletteProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    triggers: true,
    ai_actions: true,
    logic: true,
    integrations: true,
    actions: true,
  });

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const filteredNodes = NODE_PALETTE.filter(node => 
    node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedNodes = filteredNodes.reduce((acc, node) => {
    if (!acc[node.category]) {
      acc[node.category] = [];
    }
    acc[node.category].push(node);
    return acc;
  }, {} as Record<NodeCategory, NodePaletteItem[]>);

  const renderNodeItem = (node: NodePaletteItem) => {
    const Icon = iconMap[node.icon] || Play;
    
    return (
      <div
        key={node.type}
        draggable
        onDragStart={(e) => onDragStart(e, node.type, node.name, node.category)}
        className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 cursor-grab active:cursor-grabbing transition-all duration-200 group hover:shadow-md hover:border-primary/30"
      >
        <div className="p-2 rounded-md bg-muted group-hover:bg-primary/10 transition-colors">
          <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{node.name}</p>
          <p className="text-xs text-muted-foreground truncate">{node.description}</p>
        </div>
        <GripVertical className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  };

  const categoryOrder: NodeCategory[] = ['triggers', 'ai_actions', 'logic', 'integrations', 'actions'];

  return (
    <div className="h-full flex flex-col bg-background border-r">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg mb-3">Node Palette</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {categoryOrder.map(category => {
            const nodes = groupedNodes[category];
            if (!nodes || nodes.length === 0) return null;
            
            const isOpen = openCategories[category];
            
            return (
              <Collapsible key={category} open={isOpen} onOpenChange={() => toggleCategory(category)}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-md hover:bg-muted transition-colors">
                  <div className="flex items-center gap-2">
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <span className="font-medium text-sm">{CATEGORY_LABELS[category]}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {nodes.length}
                  </Badge>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 pt-2 pl-2">
                  {nodes.map(renderNodeItem)}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default NodePalette;
