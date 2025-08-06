
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Project } from '@/types/project';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Users, Target, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectCalendarProps {
  projects: Project[];
}

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'project-start' | 'project-due' | 'task-due' | 'milestone';
  priority: string;
  status: string;
  project: Project;
  assignees?: any[];
}

const ProjectCalendar = ({ projects }: ProjectCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  const calendarEvents = useMemo(() => {
    const events: CalendarEvent[] = [];

    projects.forEach(project => {
      // Project start dates
      events.push({
        id: `project-start-${project.id}`,
        title: `${project.name} - Start`,
        date: project.startDate,
        type: 'project-start',
        priority: project.priority,
        status: project.status,
        project,
      });

      // Project due dates
      events.push({
        id: `project-due-${project.id}`,
        title: `${project.name} - Due`,
        date: project.dueDate,
        type: 'project-due',
        priority: project.priority,
        status: project.status,
        project,
      });

      // Task due dates
      project.tasks.forEach(task => {
        events.push({
          id: `task-due-${task.id}`,
          title: task.title,
          date: task.dueDate,
          type: 'task-due',
          priority: task.priority,
          status: task.status,
          project,
          assignees: task.assignedTo,
        });
      });
    });

    return events;
  }, [projects]);

  const getEventsForDate = (date: Date) => {
    return calendarEvents.filter(event => isSameDay(event.date, date));
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'project-start':
        return <Target className="h-3 w-3 text-green-600" />;
      case 'project-due':
        return <AlertCircle className="h-3 w-3 text-red-600" />;
      case 'task-due':
        return <CheckCircle className="h-3 w-3 text-blue-600" />;
      default:
        return <Clock className="h-3 w-3 text-gray-600" />;
    }
  };

  const getEventTypeColor = (type: string, status: string) => {
    if (status === 'completed') return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'cancelled') return 'bg-red-100 text-red-700 border-red-200';
    
    switch (type) {
      case 'project-start':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'project-due':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'task-due':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
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

  const hasEventsOnDate = (date: Date) => {
    return getEventsForDate(date).length > 0;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-quikle-primary" />
              Project Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              month={selectedMonth}
              onMonthChange={setSelectedMonth}
              className="w-full pointer-events-auto"
              modifiers={{
                hasEvents: (date) => hasEventsOnDate(date)
              }}
              modifiersStyles={{
                hasEvents: {
                  fontWeight: 'bold',
                  backgroundColor: 'hsl(var(--primary) / 0.1)',
                  color: 'hsl(var(--primary))'
                }
              }}
              components={{
                Day: ({ date, ...props }) => {
                  const events = getEventsForDate(date);
                  const hasEvents = events.length > 0;
                  
                  return (
                    <div className="relative">
                      <button
                        {...props}
                        className={cn(
                          "h-9 w-9 p-0 font-normal hover:bg-accent hover:text-accent-foreground",
                          hasEvents && "font-bold bg-primary/10 text-primary",
                          isSameDay(date, selectedDate) && "bg-primary text-primary-foreground"
                        )}
                      >
                        {date.getDate()}
                        {hasEvents && (
                          <div className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full"></div>
                        )}
                      </button>
                    </div>
                  );
                }
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Event Details */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <div key={event.id} className="p-3 border rounded-lg bg-card hover:shadow-sm transition-shadow">
                    <div className="flex items-start gap-3">
                      {getEventTypeIcon(event.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-sm truncate">{event.title}</h4>
                          <Badge className={`${getEventTypeColor(event.type, event.status)} text-xs border`}>
                            {event.type.replace('-', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${getPriorityColor(event.priority)} text-xs border`}>
                            {event.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {event.project.name}
                          </span>
                        </div>

                        {event.assignees && event.assignees.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <div className="flex -space-x-1">
                              {event.assignees.slice(0, 3).map((assignee) => (
                                <Avatar key={assignee.id} className="h-5 w-5 border-2 border-background">
                                  <AvatarFallback className="text-xs bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700">
                                    {assignee.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {event.assignees.length > 3 && (
                                <div className="h-5 w-5 bg-gray-200 rounded-full border-2 border-background flex items-center justify-center">
                                  <span className="text-xs font-medium">+{event.assignees.length - 3}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No events scheduled for this date</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {format(selectedMonth, 'MMMM yyyy')} Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const monthStart = startOfMonth(selectedMonth);
              const monthEnd = endOfMonth(selectedMonth);
              const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
              
              const monthEvents = monthDays.flatMap(day => getEventsForDate(day));
              const projectStarts = monthEvents.filter(e => e.type === 'project-start').length;
              const projectDues = monthEvents.filter(e => e.type === 'project-due').length;
              const taskDues = monthEvents.filter(e => e.type === 'task-due').length;
              const urgent = monthEvents.filter(e => e.priority === 'urgent').length;

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-600" />
                      Project Starts
                    </span>
                    <span className="font-medium">{projectStarts}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      Project Deadlines
                    </span>
                    <span className="font-medium">{projectDues}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      Task Due Dates
                    </span>
                    <span className="font-medium">{taskDues}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      Urgent Items
                    </span>
                    <span className="font-medium text-orange-600">{urgent}</span>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectCalendar;
