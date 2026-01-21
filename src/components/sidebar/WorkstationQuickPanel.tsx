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
  Briefcase
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useWorkstationData, WorkstationTask } from '@/hooks/useWorkstationData';
import { useProjectManagement } from '@/hooks/useProjectManagement';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { useToast } from '@/hooks/use-toast';
import { projectService } from '@/services/projectService';
import NotificationsPreview from './workstation/NotificationsPreview';
import ProjectsPreview from './workstation/ProjectsPreview';
import TasksPreview from './workstation/TasksPreview';
import SchedulePreview from './workstation/SchedulePreview';

interface WorkstationQuickPanelProps {
  variant?: 'sidebar' | 'mobile';
  onItemClick?: () => void;
}

const WorkstationQuickPanel = ({ variant = 'sidebar', onItemClick }: WorkstationQuickPanelProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useRealtimeNotifications();
  const { myProjects, myTasks, stats, loading, refetch } = useWorkstationData();
  const { updateTaskStatus } = useProjectManagement();
  const { toast } = useToast();

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

  const handleMarkNotificationAsRead = useCallback((id: string) => {
    markAsRead(id);
    toast({
      title: "Notification marked as read",
      duration: 2000,
    });
  }, [markAsRead, toast]);

  const handleMarkAllNotificationsAsRead = useCallback(() => {
    markAllAsRead();
    toast({
      title: "All notifications marked as read",
      duration: 2000,
    });
  }, [markAllAsRead, toast]);

  const handleCompleteTask = useCallback((projectId: string, taskId: string) => {
    updateTaskStatus(projectId, taskId, 'done');
    toast({
      title: "Task marked as done",
      duration: 2000,
    });
    // Refetch to update counts
    setTimeout(() => refetch(), 500);
  }, [updateTaskStatus, toast, refetch]);

  const handleReorderTasks = useCallback(async (reorderedTasks: WorkstationTask[]) => {
    try {
      await projectService.updateTaskPriorities(
        reorderedTasks.map(t => ({ id: t.id, priority: t.priority }))
      );
      toast({
        title: "Task priorities updated",
        duration: 2000,
      });
      // Refetch to sync with database
      setTimeout(() => refetch(), 500);
    } catch (error) {
      console.error('Failed to update task priorities:', error);
      toast({
        title: "Failed to update priorities",
        variant: "destructive",
        duration: 3000,
      });
    }
  }, [toast, refetch]);

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

  const quickAccessItems = [
    { 
      path: '/notifications', 
      icon: Bell, 
      label: 'Notifications', 
      count: unreadCount,
      countType: 'warning' as const,
      preview: (
        <NotificationsPreview 
          notifications={recentNotifications}
          onMarkAsRead={handleMarkNotificationAsRead}
          onMarkAllAsRead={handleMarkAllNotificationsAsRead}
          hasUnread={unreadCount > 0}
          onItemClick={onItemClick}
        />
      )
    },
    { 
      path: '/projects', 
      icon: FolderKanban, 
      label: 'My Projects', 
      count: activeProjectsCount,
      countType: 'info' as const,
      preview: (
        <ProjectsPreview 
          projects={recentProjects}
          onItemClick={onItemClick}
        />
      )
    },
    { 
      path: '/projects', 
      icon: CheckSquare, 
      label: 'My Tasks', 
      count: pendingTasksCount,
      countType: 'default' as const,
      preview: (
        <TasksPreview 
          tasks={recentTasks}
          onCompleteTask={handleCompleteTask}
          onReorderTasks={handleReorderTasks}
          onItemClick={onItemClick}
        />
      )
    },
    { 
      path: '/dashboard', 
      icon: Calendar, 
      label: "Today's Schedule", 
      count: todayDeadlines,
      countType: todayDeadlines > 0 ? 'urgent' as const : 'default' as const,
      preview: (
        <SchedulePreview 
          tasks={upcomingTasks}
          onCompleteTask={handleCompleteTask}
          onItemClick={onItemClick}
        />
      )
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
