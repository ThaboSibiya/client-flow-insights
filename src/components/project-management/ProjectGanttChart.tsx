
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Project, GanttChartData } from '@/types/project';
import { format, eachDayOfInterval, eachWeekOfInterval, startOfWeek, endOfWeek, isSameDay, differenceInDays } from 'date-fns';

interface ProjectGanttChartProps {
  projects: Project[];
}

const ProjectGanttChart = ({ projects }: ProjectGanttChartProps) => {
  // Calculate the date range for the Gantt chart
  const dateRange = React.useMemo(() => {
    if (projects.length === 0) return { start: new Date(), end: new Date() };
    
    const allDates = projects.flatMap(p => [p.startDate, p.dueDate]);
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    
    return {
      start: startOfWeek(minDate),
      end: endOfWeek(maxDate),
    };
  }, [projects]);

  const weeks = eachWeekOfInterval({ start: dateRange.start, end: dateRange.end });
  const totalDays = differenceInDays(dateRange.end, dateRange.start) + 1;

  const getTaskPosition = (startDate: Date, endDate: Date) => {
    const startOffset = differenceInDays(startDate, dateRange.start);
    const duration = differenceInDays(endDate, startDate) + 1;
    
    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`,
    };
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {/* Header with weeks */}
          <div className="flex mb-4 border-b pb-2">
            <div className="w-64 flex-shrink-0"></div>
            <div className="flex-1 flex">
              {weeks.map((week, index) => (
                <div key={index} className="flex-1 text-center text-sm font-medium text-muted-foreground">
                  {format(week, 'MMM dd')}
                </div>
              ))}
            </div>
          </div>

          {/* Project rows */}
          <div className="space-y-6">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center">
                {/* Project info */}
                <div className="w-64 flex-shrink-0 pr-4">
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm truncate">{project.name}</h4>
                    <div className="flex items-center gap-2">
                      <Badge className="text-xs" variant="outline">
                        {project.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {project.progress}% complete
                      </span>
                    </div>
                    <div className="flex -space-x-1">
                      {project.team.slice(0, 3).map((member) => (
                        <Avatar key={member.id} className="h-5 w-5 border border-white">
                          <AvatarFallback className="text-xs">
                            {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {project.team.length > 3 && (
                        <div className="h-5 w-5 bg-gray-200 rounded-full border border-white flex items-center justify-center">
                          <span className="text-xs">+{project.team.length - 3}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Gantt bar */}
                <div className="flex-1 relative h-8">
                  <div className="absolute inset-0 bg-gray-100 rounded"></div>
                  <div
                    className={`absolute h-full rounded ${getProgressColor(project.progress)} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                    style={getTaskPosition(project.startDate, project.dueDate)}
                    title={`${project.name}: ${format(project.startDate, 'MMM dd')} - ${format(project.dueDate, 'MMM dd')}`}
                  >
                    <div className="h-full flex items-center justify-center text-white text-xs font-medium">
                      {project.progress > 20 ? `${project.progress}%` : ''}
                    </div>
                    
                    {/* Progress indicator */}
                    <div 
                      className="absolute top-0 left-0 h-full bg-white bg-opacity-30 rounded"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>

                  {/* Milestone indicators */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-green-600 rounded-full"
                    style={{ left: getTaskPosition(project.startDate, project.startDate).left }}
                    title={`Start: ${format(project.startDate, 'MMM dd, yyyy')}`}
                  ></div>
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-red-600 rounded-full -ml-1"
                    style={{ left: `calc(${getTaskPosition(project.startDate, project.dueDate).left} + ${getTaskPosition(project.startDate, project.dueDate).width})` }}
                    title={`Due: ${format(project.dueDate, 'MMM dd, yyyy')}`}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {projects.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-2">📊</div>
              <p>No projects to display</p>
              <p className="text-sm">Create a project to see the timeline</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectGanttChart;
