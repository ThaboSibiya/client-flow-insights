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
  Briefcase,
  ExternalLink,
  Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useWorkstationData } from '@/hooks/useWorkstationData';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { formatDistanceToNow } from 'date-fns';

interface WorkstationQuickPanelProps {
  variant?: 'sidebar' | 'mobile';
  onItemClick?: () => void;
}

const WorkstationQuickPanel = ({ variant = 'sidebar', onItemClick }: WorkstationQuickPanelProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const { notifications, unreadCount } = useRealtimeNotifications();
  const { myProjects, myTasks, stats, loading } = useWorkstationData();

  const pendingTasksCount = myTasks.filter(t => t.status !== 'done').length;
  const activeProjectsCount = stats.projectsActive;
  const todayDeadlines = stats.upcomingDeadlines;

  // Get recent items for previews
  const recentNotifications = notifications.slice(0, 3);
  const recentProjects = myProjects.slice(0, 3);
  const recentTasks = myTasks.slice(0, 3);
  const upcomingTasks = myTasks.filter(t => 
    t.dueDate === 'Today' || t.dueDate === 'Tomorrow' || t.dueDate === 'Overdue'
  ).slice(0, 3);

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

  const NotificationsPreview = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase">Recent Notifications</span>
        <Link to="/notifications" className="text-xs text-primary hover:underline flex items-center gap-1" onClick={onItemClick}>
          View all <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
      {recentNotifications.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">No notifications</p>
      ) : (
        recentNotifications.map((n) => (
          <div key={n.id} className={cn(
            "p-2 rounded-md border text-xs",
            !n.read && "bg-primary/5 border-primary/20"
          )}>
            <p className="font-medium truncate">{n.title}</p>
            <p className="text-muted-foreground truncate">{n.message}</p>
            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
            </p>
          </div>
        ))
      )}
    </div>
  );

  const ProjectsPreview = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase">Active Projects</span>
        <Link to="/projects" className="text-xs text-primary hover:underline flex items-center gap-1" onClick={onItemClick}>
          View all <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
      {recentProjects.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">No active projects</p>
      ) : (
        recentProjects.map((p) => (
          <div key={p.id} className="p-2 rounded-md border text-xs">
            <div className="flex items-center justify-between">
              <p className="font-medium truncate">{p.name}</p>
              <Badge variant="outline" className="text-[10px] h-4">{p.role}</Badge>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all" 
                  style={{ width: `${p.progress}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{p.progress}%</span>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const TasksPreview = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase">Pending Tasks</span>
        <Link to="/projects" className="text-xs text-primary hover:underline flex items-center gap-1" onClick={onItemClick}>
          View all <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
      {recentTasks.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">No pending tasks</p>
      ) : (
        recentTasks.map((t) => (
          <div key={t.id} className="p-2 rounded-md border text-xs">
            <p className="font-medium truncate">{t.title}</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-muted-foreground truncate">{t.project}</span>
              <Badge 
                variant="outline" 
                className={cn("text-[10px] h-4", {
                  'bg-red-500/10 text-red-600 border-red-500/20': t.priority === 'urgent' || t.priority === 'high',
                  'bg-orange-500/10 text-orange-600 border-orange-500/20': t.priority === 'medium',
                  'bg-green-500/10 text-green-600 border-green-500/20': t.priority === 'low',
                })}
              >
                {t.dueDate}
              </Badge>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const SchedulePreview = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase">Today's Schedule</span>
        <Link to="/dashboard" className="text-xs text-primary hover:underline flex items-center gap-1" onClick={onItemClick}>
          View all <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
      {upcomingTasks.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">No upcoming deadlines</p>
      ) : (
        upcomingTasks.map((t) => (
          <div key={t.id} className={cn(
            "p-2 rounded-md border text-xs",
            t.dueDate === 'Overdue' && "bg-red-500/5 border-red-500/20"
          )}>
            <p className="font-medium truncate">{t.title}</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-muted-foreground truncate">{t.project}</span>
              <Badge 
                variant="outline" 
                className={cn("text-[10px] h-4", {
                  'bg-red-500/10 text-red-600 border-red-500/20': t.dueDate === 'Overdue',
                  'bg-orange-500/10 text-orange-600 border-orange-500/20': t.dueDate === 'Today',
                  'bg-yellow-500/10 text-yellow-600 border-yellow-500/20': t.dueDate === 'Tomorrow',
                })}
              >
                {t.dueDate}
              </Badge>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const quickAccessItems = [
    { 
      path: '/notifications', 
      icon: Bell, 
      label: 'Notifications', 
      count: unreadCount,
      countType: 'warning' as const,
      preview: <NotificationsPreview />
    },
    { 
      path: '/projects', 
      icon: FolderKanban, 
      label: 'My Projects', 
      count: activeProjectsCount,
      countType: 'info' as const,
      preview: <ProjectsPreview />
    },
    { 
      path: '/projects', 
      icon: CheckSquare, 
      label: 'My Tasks', 
      count: pendingTasksCount,
      countType: 'default' as const,
      preview: <TasksPreview />
    },
    { 
      path: '/dashboard', 
      icon: Calendar, 
      label: "Today's Schedule", 
      count: todayDeadlines,
      countType: todayDeadlines > 0 ? 'urgent' as const : 'default' as const,
      preview: <SchedulePreview />
    },
  ];

  const isMobile = variant === 'mobile';

  const ItemContent = ({ item }: { item: typeof quickAccessItems[0] }) => {
    const Icon = item.icon;
    return (
      <Link
        to={item.path}
        onClick={onItemClick}
        className={cn(
          "flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 group w-full",
          "text-quikle-charcoal/70 hover:bg-quikle-crystal/40 hover:text-quikle-primary",
          isMobile && "py-3 text-sm"
        )}
      >
        <div className="flex items-center gap-2.5">
          <Icon className={cn(
            "h-4 w-4 text-quikle-slate/60 group-hover:text-quikle-primary transition-colors",
            isMobile && "h-5 w-5"
          )} />
          <span>{item.label}</span>
        </div>
        <Badge 
          variant="outline" 
          className={cn(
            "h-5 min-w-5 text-[10px] font-medium transition-all",
            getCountBadgeClass(item.countType, item.count),
            isMobile && "h-6 min-w-6 text-xs"
          )}
        >
          {loading ? '...' : item.count}
        </Badge>
      </Link>
    );
  };

  return (
    <div className={cn("px-3 mb-2", isMobile && "px-0 mb-4")}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className={cn(
            "flex items-center justify-between px-3 py-2 rounded-lg bg-gradient-to-r from-quikle-primary/5 via-quikle-secondary/5 to-quikle-primary/5 hover:from-quikle-primary/10 hover:via-quikle-secondary/10 hover:to-quikle-primary/10 transition-all duration-300 group cursor-pointer border border-quikle-primary/10",
            isMobile && "py-3 px-4"
          )}>
            <div className="flex items-center gap-2">
              <div className={cn(
                "p-1.5 rounded-md bg-gradient-to-br from-quikle-primary/20 to-quikle-secondary/20",
                isMobile && "p-2"
              )}>
                <Briefcase className={cn("h-3.5 w-3.5 text-quikle-primary", isMobile && "h-4 w-4")} />
              </div>
              <span className={cn(
                "text-xs font-semibold text-quikle-primary uppercase tracking-wide",
                isMobile && "text-sm"
              )}>
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
        
        <CollapsibleContent className={cn("pt-1.5 space-y-0.5", isMobile && "pt-2 space-y-1")}>
          {quickAccessItems.map((item) => (
            isMobile ? (
              <ItemContent key={item.label} item={item} />
            ) : (
              <HoverCard key={item.label} openDelay={200} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <div>
                    <ItemContent item={item} />
                  </div>
                </HoverCardTrigger>
                <HoverCardContent 
                  side="right" 
                  align="start"
                  className="w-72 p-3"
                  sideOffset={8}
                >
                  {item.preview}
                </HoverCardContent>
              </HoverCard>
            )
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default WorkstationQuickPanel;
