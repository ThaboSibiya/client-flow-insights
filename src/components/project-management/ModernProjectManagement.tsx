import React, { useCallback, useState, Suspense, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Plus, 
  AlertCircle,
  MoreHorizontal,
  Settings,
  Download,
  Upload
} from "lucide-react";
import { useProjectManagement } from '@/hooks/useProjectManagement';
import { Skeleton } from "@/components/ui/skeleton";
import NewProjectModal from './NewProjectModal';
import ProjectSettingsModal from './ProjectSettingsModal';
import ProjectErrorBoundary from '@/components/error/ProjectErrorBoundary';
import { Project, ProjectStatus } from '@/types/project';
import InlineProjectFilters from './InlineProjectFilters';
import CompactStatsBar from './CompactStatsBar';
import IconViewSwitcher, { ProjectView } from './IconViewSwitcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Lazy load heavy components
const ModernProjectOverview = React.lazy(() => import('./ModernProjectOverview'));
const ModernKanbanBoard = React.lazy(() => import('./ModernKanbanBoard'));
const ProjectGanttChart = React.lazy(() => import('./ProjectGanttChart'));
const ProjectCalendar = React.lazy(() => import('./ProjectCalendar'));
const TaskManagement = React.lazy(() => import('./TaskManagement'));

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-48 rounded-xl" />
      ))}
    </div>
  </div>
);

const ModernProjectManagement: React.FC = () => {
  const [activeView, setActiveView] = useState<ProjectView>('overview');
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [selectedProjectForTasks, setSelectedProjectForTasks] = useState<string | null>(null);

  const {
    projects,
    allProjects,
    filters,
    setFilters,
    teamMembers,
    addProject,
    updateProjectStatus,
    isLoading,
    errors,
    clearErrors
  } = useProjectManagement();

  // Keyboard shortcuts for view switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      const viewMap: Record<string, ProjectView> = {
        '1': 'overview',
        '2': 'kanban',
        '3': 'tasks',
        '4': 'gantt',
        '5': 'calendar',
      };
      
      if (viewMap[e.key]) {
        setActiveView(viewMap[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const selectedProjectForTasksData = useMemo(() => {
    return selectedProjectForTasks 
      ? allProjects.find(p => p.id === selectedProjectForTasks) || null 
      : null;
  }, [selectedProjectForTasks, allProjects]);

  const handleCreateProject = useCallback(async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const success = await addProject(projectData);
    if (success) {
      setIsNewProjectModalOpen(false);
    }
    return success;
  }, [addProject]);

  const handleProjectMove = useCallback((projectId: string, newStatus: ProjectStatus) => {
    updateProjectStatus(projectId, newStatus);
  }, [updateProjectStatus]);

  const handleProjectSelect = useCallback((projectId: string) => {
    setSelectedProjectForTasks(projectId);
    setActiveView('tasks');
  }, []);

  const handleBackToProjects = useCallback(() => {
    setSelectedProjectForTasks(null);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 p-1">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full" />
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-5 p-1">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage and track your team's projects
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Switcher */}
          <IconViewSwitcher 
            activeView={activeView} 
            onViewChange={setActiveView} 
          />
          
          {/* More Options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsSettingsModalOpen(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Export Projects
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Upload className="h-4 w-4 mr-2" />
                Import Projects
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* New Project Button */}
          <Button 
            onClick={() => setIsNewProjectModalOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Project</span>
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <CompactStatsBar projects={allProjects} />

      {/* Error Display */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{errors[0]}</span>
            <Button variant="outline" size="sm" onClick={clearErrors}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Inline Filters */}
      <InlineProjectFilters 
        filters={filters} 
        onFiltersChange={setFilters} 
        teamMembers={teamMembers}
        projectCount={projects.length}
      />

      {/* Content Area */}
      <div className="min-h-[500px]">
        {activeView === 'overview' && (
          <ProjectErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <ModernProjectOverview 
                projects={projects} 
                onProjectSelect={(project) => handleProjectSelect(project.id)}
              />
            </Suspense>
          </ProjectErrorBoundary>
        )}

        {activeView === 'kanban' && (
          <ProjectErrorBoundary>
            <Suspense fallback={<Skeleton className="h-96" />}>
              <ModernKanbanBoard 
                projects={projects} 
                onProjectMove={handleProjectMove}
                onAddProject={() => setIsNewProjectModalOpen(true)}
              />
            </Suspense>
          </ProjectErrorBoundary>
        )}

        {activeView === 'tasks' && (
          <ProjectErrorBoundary>
            {!selectedProjectForTasksData ? (
              <div className="text-center py-16">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Select a Project</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  Choose a project to view and manage its tasks
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
                  {projects.slice(0, 6).map(project => (
                    <Button 
                      key={project.id} 
                      variant="outline"
                      size="sm"
                      onClick={() => handleProjectSelect(project.id)}
                    >
                      {project.name}
                    </Button>
                  ))}
                  {projects.length > 6 && (
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      +{projects.length - 6} more
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" onClick={handleBackToProjects}>
                    ← Back
                  </Button>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{selectedProjectForTasksData.name}</h2>
                    <p className="text-sm text-muted-foreground">{selectedProjectForTasksData.description}</p>
                  </div>
                </div>
                <Suspense fallback={<Skeleton className="h-96" />}>
                  <TaskManagement 
                    project={selectedProjectForTasksData} 
                    onTaskCreate={() => {}} 
                    onTaskUpdate={() => {}} 
                  />
                </Suspense>
              </div>
            )}
          </ProjectErrorBoundary>
        )}

        {activeView === 'gantt' && (
          <ProjectErrorBoundary>
            <Suspense fallback={<Skeleton className="h-96" />}>
              <ProjectGanttChart projects={projects} />
            </Suspense>
          </ProjectErrorBoundary>
        )}

        {activeView === 'calendar' && (
          <ProjectErrorBoundary>
            <Suspense fallback={<Skeleton className="h-96" />}>
              <ProjectCalendar projects={projects} />
            </Suspense>
          </ProjectErrorBoundary>
        )}
      </div>

      {/* Empty State */}
      {projects.length === 0 && !isLoading && activeView === 'overview' && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">No projects yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Get started by creating your first project. Track progress, assign tasks, 
            and collaborate with your team.
          </p>
          <Button onClick={() => setIsNewProjectModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Project
          </Button>
        </div>
      )}

      {/* Modals */}
      <NewProjectModal 
        isOpen={isNewProjectModalOpen} 
        onClose={() => setIsNewProjectModalOpen(false)} 
        onCreateProject={handleCreateProject} 
        teamMembers={teamMembers} 
      />

      <ProjectSettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
      />
    </div>
  );
};

export default ModernProjectManagement;
