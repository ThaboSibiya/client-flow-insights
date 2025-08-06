
import React from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, DragOverEvent, closestCenter, pointerWithin, rectIntersection } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

// Droppable Column Component
const DroppableColumn = ({ 
  status, 
  config, 
  projects, 
  children 
}: { 
  status: ProjectStatus; 
  config: typeof statusConfig[ProjectStatus];
  projects: Project[];
  children: React.ReactNode;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div key={status} className="flex-shrink-0 w-80">
      <Card className={`h-full transition-colors ${isOver ? 'ring-2 ring-quikle-primary ring-opacity-50 bg-quikle-crystal' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: config.color }}
              />
              {config.title}
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {projects.length}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-3 max-h-[600px] overflow-y-auto">
          <div 
            ref={setNodeRef}
            className={`min-h-[400px] space-y-3 p-2 rounded-lg transition-colors ${
              isOver ? 'bg-quikle-crystal/50' : ''
            }`}
            data-status={status}
          >
            {children}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ProjectKanbanBoard = ({ projects, onProjectMove }: ProjectKanbanBoardProps) => {
  const [activeProject, setActiveProject] = React.useState<Project | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);

  // Group projects by status
  const projectsByStatus = React.useMemo(() => {
    const grouped = projects.reduce((acc, project) => {
      if (!acc[project.status]) {
        acc[project.status] = [];
      }
      acc[project.status].push(project);
      return acc;
    }, {} as Record<ProjectStatus, Project[]>);

    return grouped;
  }, [projects]);

  const handleDragStart = (event: DragStartEvent) => {
    const project = projects.find(p => p.id === event.active.id);
    setActiveProject(project || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over ? over.id as string : null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveProject(null);
    setOverId(null);

    if (!over) return;

    const projectId = active.id as string;
    const newStatus = over.id as ProjectStatus;
    const currentProject = projects.find(p => p.id === projectId);

    // Only move if the status actually changed
    if (currentProject && currentProject.status !== newStatus) {
      onProjectMove(projectId, newStatus);
    }
  };

  // Custom collision detection to prioritize droppable areas
  const customCollisionDetection = (args: any) => {
    // First, let's see if there are any collisions with droppable areas
    const pointerIntersections = pointerWithin(args);
    const intersections = pointerIntersections.length > 0 
      ? pointerIntersections 
      : rectIntersection(args);

    // Return the first droppable area collision
    const droppableCollision = intersections.find(({ id }) => 
      Object.keys(statusConfig).includes(id as string)
    );

    if (droppableCollision) {
      return [droppableCollision];
    }

    return intersections;
  };

  return (
    <DndContext 
      onDragStart={handleDragStart} 
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      collisionDetection={customCollisionDetection}
    >
      <div className="flex gap-6 overflow-x-auto pb-4 h-full">
        {(Object.keys(statusConfig) as ProjectStatus[]).map((status) => (
          <DroppableColumn
            key={status}
            status={status}
            config={statusConfig[status]}
            projects={projectsByStatus[status] || []}
          >
            <SortableContext items={(projectsByStatus[status] || []).map(p => p.id)}>
              {projectsByStatus[status]?.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </SortableContext>
          </DroppableColumn>
        ))}
      </div>

      <DragOverlay>
        {activeProject ? (
          <div className="rotate-3 opacity-90 transform scale-105">
            <ProjectCard project={activeProject} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default ProjectKanbanBoard;
