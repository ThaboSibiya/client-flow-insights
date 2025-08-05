
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  Users, 
  Target,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { Project } from '@/types/project';

interface ProjectOverviewProps {
  projects: Project[];
}

const ProjectOverview = ({ projects }: ProjectOverviewProps) => {
  const stats = React.useMemo(() => {
    const total = projects.length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const inProgress = projects.filter(p => p.status === 'in-progress').length;
    const overdue = projects.filter(p => p.dueDate < new Date() && p.status !== 'completed').length;
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
    const avgProgress = total > 0 ? projects.reduce((sum, p) => sum + p.progress, 0) / total : 0;
    
    const urgentProjects = projects.filter(p => p.priority === 'urgent' && p.status !== 'completed').length;
    const teamMembers = new Set(projects.flatMap(p => p.team.map(t => t.id))).size;

    return {
      total,
      completed,
      inProgress,
      overdue,
      totalBudget,
      totalSpent,
      avgProgress,
      urgentProjects,
      teamMembers,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
    };
  }, [projects]);

  const upcomingDeadlines = React.useMemo(() => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return projects
      .filter(p => p.status !== 'completed' && p.dueDate >= now && p.dueDate <= nextWeek)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, 5);
  }, [projects]);

  const recentActivity = React.useMemo(() => {
    return projects
      .filter(p => p.updatedAt)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 5);
  }, [projects]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stats.inProgress} active
                </p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{stats.completionRate.toFixed(0)}%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {stats.completed} completed
                </p>
              </div>
              <div className="text-right">
                <Progress value={stats.completionRate} className="w-16 h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Budget</p>
                <p className="text-2xl font-bold">${(stats.totalBudget / 1000).toFixed(0)}k</p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {stats.budgetUtilization.toFixed(0)}% utilized
                </p>
              </div>
              <div className="text-right">
                <Progress value={stats.budgetUtilization} className="w-16 h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                <p className="text-2xl font-bold">{stats.teamMembers}</p>
                <p className="text-xs text-purple-600 flex items-center mt-1">
                  <Users className="h-3 w-3 mr-1" />
                  Active contributors
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Warnings */}
      {(stats.overdue > 0 || stats.urgentProjects > 0) && (
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.overdue > 0 && (
                <Badge variant="destructive">
                  {stats.overdue} overdue project{stats.overdue > 1 ? 's' : ''}
                </Badge>
              )}
              {stats.urgentProjects > 0 && (
                <Badge className="bg-orange-100 text-orange-800">
                  {stats.urgentProjects} urgent project{stats.urgentProjects > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length > 0 ? (
              <div className="space-y-3">
                {upcomingDeadlines.map((project) => {
                  const daysUntilDue = Math.ceil(
                    (project.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );
                  
                  return (
                    <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{project.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {project.priority}
                          </Badge>
                          <Progress value={project.progress} className="w-20 h-2" />
                          <span className="text-xs text-muted-foreground">{project.progress}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${daysUntilDue <= 2 ? 'text-red-600' : daysUntilDue <= 5 ? 'text-orange-600' : 'text-blue-600'}`}>
                          {daysUntilDue === 0 ? 'Today' : daysUntilDue === 1 ? 'Tomorrow' : `${daysUntilDue} days`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No upcoming deadlines in the next 7 days
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{project.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={project.status === 'completed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {project.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          by {project.owner.name}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {project.updatedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No recent activity
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectOverview;
