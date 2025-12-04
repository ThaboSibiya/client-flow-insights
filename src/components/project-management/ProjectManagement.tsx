import React, { useCallback, useState, Suspense, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, LayoutGrid, BarChart3, Calendar, Settings, CheckSquare, AlertCircle } from "lucide-react";
import { useProjectManagement } from '@/hooks/useProjectManagement';
import { Skeleton } from "@/components/ui/skeleton";
import ProjectFilters from './ProjectFilters';
import NewProjectModal from './NewProjectModal';
import ProjectSettingsModal from './ProjectSettingsModal';
import ProjectErrorBoundary from '@/components/error/ProjectErrorBoundary';
import { Project, ProjectStatus } from '@/types/project';

// Lazy load heavy components
const OptimizedProjectOverview = React.lazy(() => import('./OptimizedProjectOverview'));
const ProjectKanbanBoard = React.lazy(() => import('./ProjectKanbanBoard'));
const ProjectGanttChart = React.lazy(() => import('./ProjectGanttChart'));
const ProjectCalendar = React.lazy(() => import('./ProjectCalendar'));
const TaskManagement = React.lazy(() => import('./TaskManagement'));

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-20" />
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-64" />
      ))}
    </div>
  </div>
);

type ProjectView = 'overview' | 'kanban' | 'gantt' | 'calendar' | 'tasks';

const ProjectManagement: React.FC = () => {
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

  const totalCount = projects.length;

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

  const handleTabChange = useCallback((value: string) => {
    setActiveView(value as ProjectView);
  }, []);

  const handleNewProjectClick = useCallback(() => {
    setIsNewProjectModalOpen(true);
  }, []);

  const handleSettingsClick = useCallback(() => {
    setIsSettingsModalOpen(true);
  }, []);

  const handleProjectSelect = useCallback((projectId: string) => {
    setSelectedProjectForTasks(projectId);
  }, []);

  const handleBackToProjects = useCallback(() => {
    setSelectedProjectForTasks(null);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-quikle-charcoal">Project Management</h1>
            <p className="text-quikle-slate mt-1">Loading your projects...</p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-quikle-charcoal text-2xl">Project Management</h1>
          <p className="text-quikle-slate mt-1 text-base">
            Manage and track your projects with Kanban boards, Gantt charts, and team collaboration
          </p>
        </div>
        <div className="flex gap-3">
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span className="text-sm">Loading...</span>
            </div>
          )}
          <Button variant="outline" className="flex items-center gap-2" onClick={handleSettingsClick}>
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button className="bg-quikle-primary hover:bg-quikle-secondary text-white" onClick={handleNewProjectClick}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

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

      {/* View Tabs */}
      <Tabs value={activeView} onValueChange={handleTabChange} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <TabsList className="grid w-fit grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              Kanban
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="gantt" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
          </TabsList>

          <div className="text-sm text-muted-foreground">
            {totalCount} project{totalCount !== 1 ? 's' : ''} 
            {filters.search && ` matching "${filters.search}"`}
          </div>
        </div>

        {/* Filters */}
        <ProjectFilters filters={filters} onFiltersChange={setFilters} teamMembers={teamMembers} />

        {/* Content */}
        <div className="min-h-[600px]">
          <TabsContent value="overview" className="mt-0">
            <ProjectErrorBoundary>
              <Suspense fallback={<LoadingSkeleton />}>
                <OptimizedProjectOverview projects={projects} />
              </Suspense>
            </ProjectErrorBoundary>
          </TabsContent>

          <TabsContent value="kanban" className="mt-0">
            <ProjectErrorBoundary>
              <Card>
                <CardContent className="p-6">
                  <Suspense fallback={<Skeleton className="h-96" />}>
                    <ProjectKanbanBoard projects={projects} onProjectMove={handleProjectMove} />
                  </Suspense>
                </CardContent>
              </Card>
            </ProjectErrorBoundary>
          </TabsContent>

          <TabsContent value="tasks" className="mt-0">
            {!selectedProjectForTasksData ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Select a Project</h3>
                  <p className="text-muted-foreground mb-4">
                    Choose a project to manage its tasks and assignments
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {projects.map(project => (
                      <Button 
                        key={project.id} 
                        variant="outline" 
                        onClick={() => handleProjectSelect(project.id)}
                      >
                        {project.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={handleBackToProjects}>
                    ← Back to Projects
                  </Button>
                  <div>
                    <h2 className="text-xl font-semibold">{selectedProjectForTasksData.name}</h2>
                    <p className="text-muted-foreground">{selectedProjectForTasksData.description}</p>
                  </div>
                </div>
                <ProjectErrorBoundary>
                  <Suspense fallback={<Skeleton className="h-96" />}>
                    <TaskManagement 
                      project={selectedProjectForTasksData} 
                      onTaskCreate={() => {}} 
                      onTaskUpdate={() => {}} 
                    />
                  </Suspense>
                </ProjectErrorBoundary>
              </div>
            )}
          </TabsContent>

          <TabsContent value="gantt" className="mt-0">
            <ProjectErrorBoundary>
              <Suspense fallback={<Skeleton className="h-96" />}>
                <ProjectGanttChart projects={projects} />
              </Suspense>
            </ProjectErrorBoundary>
          </TabsContent>

          <TabsContent value="calendar" className="mt-0">
            <ProjectErrorBoundary>
              <Suspense fallback={<Skeleton className="h-96" />}>
                <ProjectCalendar projects={projects} />
              </Suspense>
            </ProjectErrorBoundary>
          </TabsContent>
        </div>
      </Tabs>

      {/* Empty State */}
      {projects.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-2xl font-semibold mb-2">No projects yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get started by creating your first project. You can track progress, assign tasks, 
              and collaborate with your team all in one place.
            </p>
            <Button className="bg-quikle-primary hover:bg-quikle-secondary text-white" onClick={handleNewProjectClick}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Project
            </Button>
          </CardContent>
        </Card>
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

export default ProjectManagement;