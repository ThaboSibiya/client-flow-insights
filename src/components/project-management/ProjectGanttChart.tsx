
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Project } from '@/types/project';
import { format, eachDayOfInterval, eachWeekOfInterval, startOfWeek, endOfWeek, differenceInDays, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Users, Target, DollarSign, Clock, ArrowLeft } from 'lucide-react';

interface ProjectGanttChartProps {
  projects: Project[];
}

const ProjectGanttChart = ({ projects }: ProjectGanttChartProps) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [dateRange, setDateRange] = useState(() => {
    if (projects.length === 0) return { start: new Date(), end: new Date() };
    
    const allDates = projects.flatMap(p => [p.startDate, p.dueDate]);
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    
    return {
      start: startOfWeek(minDate),
      end: endOfWeek(maxDate),
    };
  });

  const weeks = eachWeekOfInterval({ start: dateRange.start, end: dateRange.end });
  const totalDays = differenceInDays(dateRange.end, dateRange.start) + 1;

  const navigateWeeks = (direction: 'prev' | 'next') => {
    const weeks = direction === 'prev' ? -2 : 2;
    setDateRange(prev => ({
      start: addWeeks(prev.start, weeks),
      end: addWeeks(prev.end, weeks),
    }));
  };

  const getTaskPosition = (startDate: Date, endDate: Date) => {
    const startOffset = differenceInDays(startDate, dateRange.start);
    const duration = differenceInDays(endDate, startDate) + 1;
    
    return {
      left: `${Math.max(0, (startOffset / totalDays) * 100)}%`,
      width: `${Math.min(100, (duration / totalDays) * 100)}%`,
    };
  };

  const getProgressColor = (progress: number, status: string) => {
    if (status === 'completed') return 'bg-green-500';
    if (status === 'cancelled') return 'bg-red-500';
    if (status === 'on-hold') return 'bg-yellow-500';
    
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 50) return 'bg-indigo-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-400';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'not-started': 'bg-gray-100 text-gray-700 border-gray-200',
      'in-progress': 'bg-blue-100 text-blue-700 border-blue-200',
      'on-hold': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'completed': 'bg-green-100 text-green-700 border-green-200',
      'cancelled': 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status as keyof typeof colors] || colors['not-started'];
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'low': 'bg-blue-50 text-blue-600 border-blue-200',
      'medium': 'bg-yellow-50 text-yellow-600 border-yellow-200',
      'high': 'bg-orange-50 text-orange-600 border-orange-200',
      'urgent': 'bg-red-50 text-red-600 border-red-200',
    };
    return colors[priority as keyof typeof colors] || colors['medium'];
  };

  if (selectedProject) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedProject(null)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Timeline
              </Button>
              <div>
                <CardTitle className="text-2xl font-bold">{selectedProject.name}</CardTitle>
                <p className="text-muted-foreground mt-1">{selectedProject.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(selectedProject.status)} border`}>
                {selectedProject.status.replace('-', ' ')}
              </Badge>
              <Badge className={`${getPriorityColor(selectedProject.priority)} border`}>
                {selectedProject.priority}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Project Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Progress</span>
              </div>
              <div className="text-2xl font-bold text-blue-800">{selectedProject.progress}%</div>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${selectedProject.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Budget</span>
              </div>
              <div className="text-2xl font-bold text-green-800">${selectedProject.budget.toLocaleString()}</div>
              <div className="text-xs text-green-600 mt-1">
                Spent: ${selectedProject.spent.toLocaleString()} ({Math.round((selectedProject.spent / selectedProject.budget) * 100)}%)
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Team Size</span>
              </div>
              <div className="text-2xl font-bold text-purple-800">{selectedProject.team.length}</div>
              <div className="text-xs text-purple-600 mt-1">Active members</div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">Duration</span>
              </div>
              <div className="text-2xl font-bold text-orange-800">
                {differenceInDays(selectedProject.dueDate, selectedProject.startDate)} days
              </div>
              <div className="text-xs text-orange-600 mt-1">
                {format(selectedProject.startDate, 'MMM dd')} - {format(selectedProject.dueDate, 'MMM dd')}
              </div>
            </div>
          </div>

          {/* Project Timeline Visual */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              Project Timeline
            </h3>
            
            <div className="relative">
              {/* Timeline bar */}
              <div className="h-8 bg-gray-200 rounded-lg relative overflow-hidden">
                <div
                  className={`absolute h-full rounded-lg ${getProgressColor(selectedProject.progress, selectedProject.status)} transition-all duration-500`}
                  style={{ width: `${selectedProject.progress}%` }}
                >
                  <div className="h-full flex items-center justify-center text-white text-sm font-medium">
                    {selectedProject.progress > 15 ? `${selectedProject.progress}%` : ''}
                  </div>
                </div>
                
                {/* Progress indicator */}
                <div 
                  className="absolute top-0 h-full bg-white bg-opacity-30 rounded-lg"
                  style={{ width: `${selectedProject.progress}%` }}
                ></div>
              </div>

              {/* Timeline markers */}
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Start: {format(selectedProject.startDate, 'MMM dd, yyyy')}
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Due: {format(selectedProject.dueDate, 'MMM dd, yyyy')}
                </span>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-600" />
              Team Members ({selectedProject.team.length})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedProject.team.map((member) => (
                <div key={member.id} className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-gray-100">
                      <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 font-medium">
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{member.name}</p>
                      <p className="text-sm text-gray-500 truncate">{member.role}</p>
                      <p className="text-xs text-gray-400 truncate">{member.department}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Owner */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Project Owner</h3>
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-100">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 ring-2 ring-indigo-200">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 font-medium">
                    {selectedProject.owner.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">{selectedProject.owner.name}</p>
                  <p className="text-sm text-gray-600">{selectedProject.owner.role}</p>
                  <p className="text-sm text-gray-500">{selectedProject.owner.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Project Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Project Type:</span>
                  <span className="font-medium capitalize">{selectedProject.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Client:</span>
                  <span className="font-medium">{selectedProject.client || 'Internal'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{format(selectedProject.createdAt, 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">{format(selectedProject.updatedAt, 'MMM dd, yyyy')}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {selectedProject.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-quikle-primary" />
            Project Timeline
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateWeeks('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-3">
              {format(dateRange.start, 'MMM dd')} - {format(dateRange.end, 'MMM dd')}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigateWeeks('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          {/* Enhanced Header with weeks */}
          <div className="flex mb-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3">
            <div className="w-80 flex-shrink-0 font-semibold text-gray-700">Projects</div>
            <div className="flex-1 flex">
              {weeks.map((week, index) => (
                <div key={index} className="flex-1 text-center">
                  <div className="text-sm font-semibold text-gray-700">
                    {format(week, 'MMM dd')}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {format(week, 'yyyy')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Project rows */}
          <div className="space-y-4">
            {projects.map((project) => (
              <div 
                key={project.id} 
                className="flex items-center bg-white rounded-lg border hover:shadow-md transition-all duration-200 cursor-pointer group"
                onClick={() => setSelectedProject(project)}
              >
                {/* Enhanced Project info */}
                <div className="w-80 flex-shrink-0 p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-gray-900 group-hover:text-quikle-primary transition-colors">
                        {project.name}
                      </h4>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        View Details
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(project.status)} text-xs border`}>
                        {project.status.replace('-', ' ')}
                      </Badge>
                      <Badge className={`${getPriorityColor(project.priority)} text-xs border`}>
                        {project.priority}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{project.progress}% complete</span>
                      <span>{project.type}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1">
                        {project.team.slice(0, 4).map((member) => (
                          <Avatar key={member.id} className="h-6 w-6 border-2 border-white">
                            <AvatarFallback className="text-xs bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700">
                              {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {project.team.length > 4 && (
                          <div className="h-6 w-6 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-xs font-medium">+{project.team.length - 4}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 ml-2">
                        {project.team.length} member{project.team.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Gantt bar */}
                <div className="flex-1 relative h-16 px-2">
                  <div className="absolute inset-2 bg-gray-100 rounded-lg"></div>
                  
                  {/* Main project bar */}
                  <div
                    className={`absolute top-2 bottom-2 rounded-lg ${getProgressColor(project.progress, project.status)} shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group/bar`}
                    style={getTaskPosition(project.startDate, project.dueDate)}
                    title={`${project.name}: ${format(project.startDate, 'MMM dd')} - ${format(project.dueDate, 'MMM dd')}`}
                  >
                    {/* Progress overlay */}
                    <div 
                      className="absolute top-0 left-0 h-full bg-white bg-opacity-25 rounded-lg transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                    
                    {/* Content */}
                    <div className="h-full flex items-center justify-between px-3 text-white text-xs font-medium">
                      <span className="truncate">
                        {project.progress > 30 ? project.name : ''}
                      </span>
                      <span>
                        {project.progress > 15 ? `${project.progress}%` : ''}
                      </span>
                    </div>

                    {/* Hover details */}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {format(project.startDate, 'MMM dd')} → {format(project.dueDate, 'MMM dd')} ({project.progress}%)
                    </div>
                  </div>

                  {/* Enhanced milestone indicators */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-green-600 rounded-full border-2 border-white shadow-sm"
                    style={{ left: getTaskPosition(project.startDate, project.startDate).left }}
                    title={`Start: ${format(project.startDate, 'MMM dd, yyyy')}`}
                  ></div>
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full border-2 border-white shadow-sm -ml-1.5"
                    style={{ left: `calc(${getTaskPosition(project.startDate, project.dueDate).left} + ${getTaskPosition(project.startDate, project.dueDate).width})` }}
                    title={`Due: ${format(project.dueDate, 'MMM dd, yyyy')}`}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced empty state */}
          {projects.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No projects to display</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Create your first project to see it visualized on the timeline with team assignments and progress tracking.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectGanttChart;
