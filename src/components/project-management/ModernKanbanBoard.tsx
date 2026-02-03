import React, { memo, useState } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Project, ProjectStatus } from '@/types/project';
import ModernProjectCard from './ModernProjectCard';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernKanbanBoardProps {
  projects: Project[];
  onProjectMove: (projectId: string, newStatus: ProjectStatus) => void;
  onProjectView?: (project: Project) => void;
  onProjectEdit?: (project: Project) => void;
  onProjectDelete?: (project: Project) => void;
  onAddProject?: () => void;
}

const statusConfig: Record<ProjectStatus, { title: string; color: string; dotColor: string }> = {
  'not-started': { title: 'Not Started', color: 'bg-muted/50', dotColor: 'bg-slate-400' },
  'in-progress': { title: 'In Progress', color: 'bg-primary/5', dotColor: 'bg-primary' },
  'on-hold': { title: 'On Hold', color: 'bg-amber-50 dark:bg-amber-900/10', dotColor: 'bg-amber-500' },
  'completed': { title: 'Completed', color: 'bg-emerald-50 dark:bg-emerald-900/10', dotColor: 'bg-emerald-500' },
  'cancelled': { title: 'Cancelled', color: 'bg-red-50 dark:bg-red-900/10', dotColor: 'bg-red-400' },
};

// Droppable Column Component
const DroppableColumn = memo(({ 
  status, 
  config, 
  projects,
  isOver,
  children,
  onAddProject,
}: { 
  status: ProjectStatus; 
  config: typeof statusConfig[ProjectStatus];
  projects: Project[];
  isOver: boolean;
  children: React.ReactNode;
  onAddProject?: () => void;
}) => {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div className="flex-shrink-0 w-72">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${config.dotColor}`} />
          <h3 className="text-sm font-medium text-foreground">{config.title}</h3>
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px] rounded-full">
            {projects.length}
          </Badge>
        </div>
        {status === 'not-started' && onAddProject && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={onAddProject}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Column Content */}
      <div 
        ref={setNodeRef}
        className={cn(
          "min-h-[400px] p-2 rounded-xl transition-all duration-200 border-2",
          config.color,
          isOver 
            ? 'border-primary/40 bg-primary/5' 
            : 'border-transparent'
        )}
      >
        <div className="space-y-2">
          {children}
        </div>
        
        {/* Empty State */}
        {projects.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-xs text-muted-foreground">
              No projects
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Drag projects here
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

DroppableColumn.displayName = 'DroppableColumn';

const ModernKanbanBoard = memo(({ 
  projects, 
  onProjectMove,
  onProjectView,
  onProjectEdit,
  onProjectDelete,
  onAddProject,
}: ModernKanbanBoardProps) => {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

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

  const handleDragOver = (event: any) => {
    setOverId(event.over?.id || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveProject(null);
    setOverId(null);

    if (!over) return;

    const projectId = active.id as string;
    const newStatus = over.id as ProjectStatus;
    const currentProject = projects.find(p => p.id === projectId);

    if (currentProject && currentProject.status !== newStatus) {
      onProjectMove(projectId, newStatus);
    }
  };

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 300, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {/* Scroll Indicators */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full shadow-md bg-background hidden md:flex"
        onClick={scrollLeft}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full shadow-md bg-background hidden md:flex"
        onClick={scrollRight}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <DndContext 
        onDragStart={handleDragStart} 
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCenter}
      >
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-4 px-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
        >
          {(Object.keys(statusConfig) as ProjectStatus[]).map((status) => (
            <DroppableColumn
              key={status}
              status={status}
              config={statusConfig[status]}
              projects={projectsByStatus[status] || []}
              isOver={overId === status}
              onAddProject={status === 'not-started' ? onAddProject : undefined}
            >
              <SortableContext 
                items={(projectsByStatus[status] || []).map(p => p.id)}
                strategy={verticalListSortingStrategy}
              >
                {projectsByStatus[status]?.map((project) => (
                  <ModernProjectCard 
                    key={project.id} 
                    project={project}
                    onView={onProjectView}
                    onEdit={onProjectEdit}
                    onDelete={onProjectDelete}
                  />
                ))}
              </SortableContext>
            </DroppableColumn>
          ))}
        </div>

        <DragOverlay>
          {activeProject ? (
            <div className="rotate-2 opacity-95 transform scale-105">
              <ModernProjectCard project={activeProject} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
});

ModernKanbanBoard.displayName = 'ModernKanbanBoard';

export default ModernKanbanBoard;
