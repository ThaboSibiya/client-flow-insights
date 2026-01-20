import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Bell, 
  FolderKanban, 
  CheckSquare, 
  Calendar,
  ChevronDown,
  ChevronRight,
  Briefcase
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useWorkstationData } from '@/hooks/useWorkstationData';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const WorkstationQuickPanel = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { unreadCount } = useRealtimeNotifications();
  const { myProjects, myTasks, stats, loading } = useWorkstationData();

  const pendingTasksCount = myTasks.filter(t => t.status !== 'done').length;
  const activeProjectsCount = stats.projectsActive;
  const todayDeadlines = stats.upcomingDeadlines;

  const quickAccessItems = [
    { 
      path: '/notifications', 
      icon: Bell, 
      label: 'Notifications', 
      count: unreadCount,
      countType: 'warning' as const
    },
    { 
      path: '/projects', 
      icon: FolderKanban, 
      label: 'My Projects', 
      count: activeProjectsCount,
      countType: 'info' as const
    },
    { 
      path: '/projects', 
      icon: CheckSquare, 
      label: 'My Tasks', 
      count: pendingTasksCount,
      countType: 'default' as const,
      hash: '#tasks'
    },
    { 
      path: '/dashboard', 
      icon: Calendar, 
      label: "Today's Schedule", 
      count: todayDeadlines,
      countType: todayDeadlines > 0 ? 'urgent' as const : 'default' as const
    },
  ];

  const getCountBadgeClass = (type: 'warning' | 'info' | 'default' | 'urgent', count: number) => {
    if (count === 0) return 'bg-muted text-muted-foreground';
    switch (type) {
      case 'warning':
        return 'bg-orange-500/15 text-orange-600 border-orange-500/30';
      case 'urgent':
        return 'bg-red-500/15 text-red-600 border-red-500/30';
      case 'info':
        return 'bg-blue-500/15 text-blue-600 border-blue-500/30';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <div className="px-3 mb-2">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gradient-to-r from-quikle-primary/5 via-quikle-secondary/5 to-quikle-primary/5 hover:from-quikle-primary/10 hover:via-quikle-secondary/10 hover:to-quikle-primary/10 transition-all duration-300 group cursor-pointer border border-quikle-primary/10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-gradient-to-br from-quikle-primary/20 to-quikle-secondary/20">
                <Briefcase className="h-3.5 w-3.5 text-quikle-primary" />
              </div>
              <span className="text-xs font-semibold text-quikle-primary uppercase tracking-wide">
                My Workstation
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!isOpen && unreadCount > 0 && (
                <Badge 
                  variant="outline" 
                  className="h-5 min-w-5 text-[10px] bg-orange-500/15 text-orange-600 border-orange-500/30"
                >
                  {unreadCount}
                </Badge>
              )}
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-quikle-slate/50 transition-transform duration-200" />
              ) : (
                <ChevronRight className="h-4 w-4 text-quikle-slate/50 transition-transform duration-200" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="pt-1.5 space-y-0.5">
          {quickAccessItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 group",
                  "text-quikle-charcoal/70 hover:bg-quikle-crystal/40 hover:text-quikle-primary"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-quikle-slate/60 group-hover:text-quikle-primary transition-colors" />
                  <span>{item.label}</span>
                </div>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "h-5 min-w-5 text-[10px] font-medium transition-all",
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

export default WorkstationQuickPanel;
