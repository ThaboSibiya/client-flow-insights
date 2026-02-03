import React, { memo } from 'react';
import { Button } from "@/components/ui/button";
import { 
  LayoutGrid, 
  Columns3, 
  ListTodo, 
  GanttChart, 
  CalendarDays 
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type ProjectView = 'overview' | 'kanban' | 'tasks' | 'gantt' | 'calendar';

interface IconViewSwitcherProps {
  activeView: ProjectView;
  onViewChange: (view: ProjectView) => void;
}

const views: { id: ProjectView; icon: React.ElementType; label: string; shortcut?: string }[] = [
  { id: 'overview', icon: LayoutGrid, label: 'Overview', shortcut: '1' },
  { id: 'kanban', icon: Columns3, label: 'Kanban Board', shortcut: '2' },
  { id: 'tasks', icon: ListTodo, label: 'Task List', shortcut: '3' },
  { id: 'gantt', icon: GanttChart, label: 'Timeline', shortcut: '4' },
  { id: 'calendar', icon: CalendarDays, label: 'Calendar', shortcut: '5' },
];

const IconViewSwitcher = memo(({ activeView, onViewChange }: IconViewSwitcherProps) => {
  return (
    <TooltipProvider>
      <div className="flex items-center p-1 rounded-lg bg-muted/50 border border-border/40">
        {views.map((view) => {
          const Icon = view.icon;
          const isActive = activeView === view.id;
          
          return (
            <Tooltip key={view.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="icon"
                  className={`h-8 w-8 transition-all ${
                    isActive 
                      ? 'bg-background shadow-sm text-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => onViewChange(view.id)}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <div className="flex items-center gap-2">
                  <span>{view.label}</span>
                  {view.shortcut && (
                    <kbd className="text-[10px] bg-muted px-1.5 py-0.5 rounded">
                      {view.shortcut}
                    </kbd>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
});

IconViewSwitcher.displayName = 'IconViewSwitcher';

export default IconViewSwitcher;
