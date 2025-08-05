
import React from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Project, ProjectStatus } from '@/types/project';
import ProjectCard from './ProjectCard';

interface ProjectKanbanBoardProps {
  projects: Project[];
  onProjectMove: (projectId: string, newStatus: ProjectStatus) => void;
}

const statusConfig = {
  'not-started': { title: 'Not Started', color: '#6B7280', count: 0 },
  'in-progress': { title: 'In Progress', color: '#3B82F6', count: 0 },
  'on-hold': { title: 'On Hold', color: '#F59E0B', count: 0 },
  'completed': { title: 'Completed', color: '#10B981', count: 0 },
  'cancelled': { title: 'Cancelled', color: '#EF4444', count: 0 },
};

const ProjectKanbanBoard = ({ projects, onProjectMove }: ProjectKanbanBoardProps) => {
  const [activeProject, setActiveProject] = React.useState<Project | null>(null);

  // Group projects by status
  const projectsByStatus = React.useMemo(() => {
    const grouped = projects.reduce((acc, project) => {
      if (!acc[project.status]) {
        acc[project.status] = [];
      }
      acc[project.status].push(project);
      return acc;
    }, {} as Record<ProjectStatus, Project[]>);

    // Update counts
    Object.keys(statusConfig).forEach(status => {
      statusConfig[status as ProjectStatus].count = grouped[status as ProjectStatus]?.length || 0;
    });

    return grouped;
  }, [projects]);

  const handleDragStart = (event: DragStartEvent) => {
    const project = projects.find(p => p.id === event.active.id);
    setActiveProject(project || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveProject(null);

    if (!over || active.id === over.id) return;

    const projectId = active.id as string;
    const newStatus = over.id as ProjectStatus;

    onProjectMove(projectId, newStatus);
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-4 h-full">
        {(Object.keys(statusConfig) as ProjectStatus[]).map((status) => (
          <div key={status} className="flex-shrink-0 w-80">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: statusConfig[status].color }}
                    />
                    {statusConfig[status].title}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {statusConfig[status].count}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-3 max-h-[600px] overflow-y-auto">
                <SortableContext items={projectsByStatus[status]?.map(p => p.id) || []}>
                  <div 
                    className="min-h-[400px] space-y-3"
                    data-droppable-id={status}
                  >
                    {projectsByStatus[status]?.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                </SortableContext>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeProject ? (
          <div className="rotate-3 opacity-90">
            <ProjectCard project={activeProject} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default ProjectKanbanBoard;
