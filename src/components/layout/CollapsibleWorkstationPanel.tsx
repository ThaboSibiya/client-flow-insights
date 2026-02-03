import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Bell,
  FolderKanban,
  CheckSquare,
  Calendar,
  ChevronDown,
  ChevronRight,
  Briefcase,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useWorkstationData } from '@/hooks/useWorkstationData';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const CollapsibleWorkstationPanel = () => {
  const [isOpen, setIsOpen] = useState(false); // Default collapsed per improvements
  const { unreadCount } = useRealtimeNotifications();
  const { myTasks, stats, loading } = useWorkstationData();

  const pendingTasksCount = myTasks.filter((t) => t.status !== 'done').length;
  const activeProjectsCount = stats.projectsActive;
  const todayDeadlines = stats.upcomingDeadlines;

  const getCountBadgeClass = (type: 'warning' | 'info' | 'default' | 'urgent', count: number) => {
    if (count === 0) return 'bg-muted text-muted-foreground';
    switch (type) {
      case 'warning':
        return 'bg-orange-500/15 text-orange-600';
      case 'urgent':
        return 'bg-destructive/15 text-destructive';
      case 'info':
        return 'bg-blue-500/15 text-blue-600';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  const quickAccessItems = [
    {
      path: '/notifications',
      icon: Bell,
      label: 'Notifications',
      count: unreadCount,
      countType: 'warning' as const,
    },
    {
      path: '/projects',
      icon: FolderKanban,
      label: 'My Projects',
      count: activeProjectsCount,
      countType: 'info' as const,
    },
    {
      path: '/projects',
      icon: CheckSquare,
      label: 'My Tasks',
      count: pendingTasksCount,
      countType: 'default' as const,
    },
    {
      path: '/dashboard',
      icon: Calendar,
      label: "Today's Schedule",
      count: todayDeadlines,
      countType: todayDeadlines > 0 ? ('urgent' as const) : ('default' as const),
    },
  ];

  return (
    <div className="px-3 py-2 border-b border-border/40">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer group">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                My Workstation
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!isOpen && unreadCount > 0 && (
                <Badge variant="outline" className="h-5 min-w-5 text-[10px] bg-orange-500/15 text-orange-600 border-0">
                  {unreadCount}
                </Badge>
              )}
              {isOpen ? (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="pt-1 space-y-0.5">
          {quickAccessItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.path}
                className="flex items-center justify-between px-2 py-1.5 text-xs rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'h-4 min-w-4 text-[10px] border-0',
                    getCountBadgeClass(item.countType, item.count)
                  )}
                >
                  {loading ? '...' : item.count}
                </Badge>
              </Link>
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default CollapsibleWorkstationPanel;
