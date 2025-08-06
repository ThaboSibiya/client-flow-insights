
import React from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, DragOverEvent, closestCenter, pointerWithin } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
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
    <div className="flex-shrink-0 w-80">
      <Card className={`h-full transition-all duration-200 ${isOver ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''}`}>
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
        
        <CardContent className="pt-0 space-y-3">
          <div 
            ref={setNodeRef}
            className={`min-h-[500px] space-y-3 p-2 rounded-lg transition-all duration-200 ${
              isOver ? 'bg-blue-50/30 border-2 border-dashed border-blue-300' : 'border-2 border-transparent'
            }`}
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveProject(null);

    if (!over) return;

    const projectId = active.id as string;
    const newStatus = over.id as ProjectStatus;
    const currentProject = projects.find(p => p.id === projectId);

    console.log('Drag end:', { projectId, newStatus, currentProject });

    // Only move if the status actually changed
    if (currentProject && currentProject.status !== newStatus) {
      console.log('Moving project:', projectId, 'to status:', newStatus);
      onProjectMove(projectId, newStatus);
    }
  };

  // Use closestCenter for better collision detection
  const collisionDetection = closestCenter;

  return (
    <DndContext 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
      collisionDetection={collisionDetection}
    >
      <div className="flex gap-6 overflow-x-auto pb-4 h-full">
        {(Object.keys(statusConfig) as ProjectStatus[]).map((status) => (
          <DroppableColumn
            key={status}
            status={status}
            config={statusConfig[status]}
            projects={projectsByStatus[status] || []}
          >
            <SortableContext 
              items={(projectsByStatus[status] || []).map(p => p.id)}
              strategy={verticalListSortingStrategy}
            >
              {projectsByStatus[status]?.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </SortableContext>
          </DroppableColumn>
        ))}
      </div>

      <DragOverlay>
        {activeProject ? (
          <div className="rotate-2 opacity-95 transform scale-105 shadow-xl">
            <ProjectCard project={activeProject} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default ProjectKanbanBoard;
