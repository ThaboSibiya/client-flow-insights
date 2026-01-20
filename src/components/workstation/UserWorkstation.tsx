import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useEmployeeAuth } from '@/hooks/useEmployeeAuth';
import { useWorkstationData } from '@/hooks/useWorkstationData';
import { 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Target,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Inbox
} from 'lucide-react';
import { cn } from '@/lib/utils';

const UserWorkstation: React.FC = () => {
  const navigate = useNavigate();
  const { employeeProfile, isCompanyOwner } = useEmployeeAuth();
  const { myTasks, myProjects, stats, loading, error } = useWorkstationData();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-purple-500/10 text-purple-600 border-purple-200';
      case 'high': return 'bg-red-500/10 text-red-600 border-red-200';
      case 'medium': return 'bg-amber-500/10 text-amber-600 border-amber-200';
      case 'low': return 'bg-green-500/10 text-green-600 border-green-200';
      default: return 'bg-quikle-slate/10 text-quikle-slate border-quikle-silver';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'review': return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      default: return <AlertCircle className="h-4 w-4 text-quikle-slate" />;
    }
  };

  const completionRate = stats.tasksTotal > 0 
    ? Math.round((stats.tasksCompleted / stats.tasksTotal) * 100) 
    : 0;

  if (loading) {
    return (
      <Card className="shadow-luxury glass-effect border-quikle-silver/20 overflow-hidden">
        <CardHeader className="pb-3 border-b border-quikle-silver/20">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
          <Skeleton className="h-8" />
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-luxury glass-effect border-quikle-silver/20 overflow-hidden">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-quikle-slate">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const hasNoData = myTasks.length === 0 && myProjects.length === 0;

  return (
    <Card className="shadow-luxury glass-effect border-quikle-silver/20 overflow-hidden">
      <CardHeader className="pb-3 border-b border-quikle-silver/20 bg-gradient-to-r from-quikle-primary/5 to-quikle-secondary/5">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 luxury-text">
            <Sparkles className="h-5 w-5 text-amber-500" />
            My Workstation
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {isCompanyOwner ? 'Owner View' : employeeProfile?.role || 'Team Member'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-px bg-quikle-silver/20">
          <div className="bg-white p-3 text-center">
            <div className="text-2xl font-bold text-quikle-primary">{stats.tasksCompleted}</div>
            <div className="text-[10px] text-quikle-slate uppercase tracking-wide">Completed</div>
          </div>
          <div className="bg-white p-3 text-center">
            <div className="text-2xl font-bold text-amber-500">{stats.tasksTotal - stats.tasksCompleted}</div>
            <div className="text-[10px] text-quikle-slate uppercase tracking-wide">Pending</div>
          </div>
          <div className="bg-white p-3 text-center">
            <div className="text-2xl font-bold text-quikle-secondary">{stats.projectsActive}</div>
            <div className="text-[10px] text-quikle-slate uppercase tracking-wide">Projects</div>
          </div>
          <div className="bg-white p-3 text-center">
            <div className="text-2xl font-bold text-red-500">{stats.upcomingDeadlines}</div>
            <div className="text-[10px] text-quikle-slate uppercase tracking-wide">Due Soon</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-4 py-3 bg-quikle-crystal/30 border-b border-quikle-silver/20">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-quikle-charcoal flex items-center gap-1">
              <Target className="h-3 w-3" /> Weekly Progress
            </span>
            <span className="text-xs font-bold text-quikle-primary">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        {hasNoData ? (
          // Empty state
          <div className="p-8 text-center">
            <Inbox className="h-10 w-10 text-quikle-silver mx-auto mb-3" />
            <p className="text-sm font-medium text-quikle-charcoal mb-1">No tasks yet</p>
            <p className="text-xs text-quikle-slate mb-4">
              Create a project to start tracking your work
            </p>
            <Button 
              size="sm"
              onClick={() => navigate('/projects')}
              className="bg-quikle-primary hover:bg-quikle-secondary"
            >
              Go to Projects
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        ) : (
          <>
            {/* My Tasks */}
            <div className="p-4 border-b border-quikle-silver/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-quikle-charcoal flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-quikle-primary" />
                  My Tasks
                </h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs text-quikle-primary hover:text-quikle-secondary"
                  onClick={() => navigate('/projects')}
                >
                  View All <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {myTasks.length === 0 ? (
                    <p className="text-xs text-quikle-slate text-center py-4">
                      No pending tasks
                    </p>
                  ) : (
                    myTasks.map((task) => (
                      <div 
                        key={task.id}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-quikle-crystal/50 transition-colors cursor-pointer group"
                        onClick={() => navigate('/projects')}
                      >
                        {getStatusIcon(task.status)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-quikle-charcoal truncate group-hover:text-quikle-primary transition-colors">
                            {task.title}
                          </p>
                          <p className="text-[10px] text-quikle-slate">{task.project}</p>
                        </div>
                        <Badge className={cn("text-[10px] border", getPriorityColor(task.priority))}>
                          {task.priority}
                        </Badge>
                        <span className={cn(
                          "text-[10px] whitespace-nowrap",
                          task.dueDate === 'Overdue' ? 'text-red-500 font-medium' : 
                          task.dueDate === 'Today' ? 'text-amber-500 font-medium' : 
                          'text-quikle-slate'
                        )}>
                          {task.dueDate}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* My Projects */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-quikle-charcoal flex items-center gap-1.5">
                  <FolderKanban className="h-4 w-4 text-quikle-secondary" />
                  Active Projects
                </h4>
              </div>
              <div className="space-y-2">
                {myProjects.length === 0 ? (
                  <p className="text-xs text-quikle-slate text-center py-4">
                    No active projects
                  </p>
                ) : (
                  myProjects.slice(0, 3).map((project) => (
                    <div 
                      key={project.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-quikle-crystal/50 transition-colors cursor-pointer"
                      onClick={() => navigate('/projects')}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-quikle-charcoal truncate">{project.name}</p>
                          <Badge variant="outline" className="text-[10px]">{project.role}</Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={project.progress} className="h-1.5 flex-1" />
                          <span className="text-[10px] text-quikle-slate">{project.progress}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-medium text-quikle-primary">{project.tasksCount}</span>
                        <p className="text-[10px] text-quikle-slate">tasks</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UserWorkstation;
