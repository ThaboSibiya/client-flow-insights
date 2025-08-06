
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, LayoutGrid, BarChart3, Calendar, Settings, CheckSquare } from "lucide-react";
import { useProjectManagement } from '@/hooks/useProjectManagement';
import ProjectOverview from './ProjectOverview';
import ProjectKanbanBoard from './ProjectKanbanBoard';
import ProjectGanttChart from './ProjectGanttChart';
import ProjectCalendar from './ProjectCalendar';
import ProjectFilters from './ProjectFilters';
import NewProjectModal from './NewProjectModal';
import ProjectSettingsModal from './ProjectSettingsModal';
import TaskManagement from './TaskManagement';

const ProjectManagement = () => {
  const {
    projects,
    filters,
    setFilters,
    teamMembers,
    updateProjectStatus,
    addProject,
    addTask,
    updateTask,
  } = useProjectManagement();

  const [activeView, setActiveView] = React.useState<'overview' | 'kanban' | 'gantt' | 'calendar' | 'tasks'>('overview');
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = React.useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState(false);
  const [selectedProjectForTasks, setSelectedProjectForTasks] = React.useState<string | null>(null);

  const handleCreateProject = (projectData: Parameters<typeof addProject>[0]) => {
    addProject(projectData);
  };

  const selectedProject = selectedProjectForTasks 
    ? projects.find(p => p.id === selectedProjectForTasks) 
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-quikle-charcoal">Project Management</h1>
          <p className="text-quikle-slate mt-1">
            Manage and track your projects with Kanban boards, Gantt charts, and team collaboration
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setIsSettingsModalOpen(true)}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button 
            className="bg-quikle-primary hover:bg-quikle-secondary text-white"
            onClick={() => setIsNewProjectModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* View Tabs */}
      <Tabs value={activeView} onValueChange={(value: any) => setActiveView(value)}>
        <div className="flex items-center justify-between">
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
            {projects.length} project{projects.length !== 1 ? 's' : ''} 
            {filters.search && ` matching "${filters.search}"`}
          </div>
        </div>

        {/* Filters */}
        <ProjectFilters
          filters={filters}
          onFiltersChange={setFilters}
          teamMembers={teamMembers}
        />

        {/* Content */}
        <div className="min-h-[600px]">
          <TabsContent value="overview" className="mt-0">
            <ProjectOverview projects={projects} />
          </TabsContent>

          <TabsContent value="kanban" className="mt-0">
            <Card>
              <CardContent className="p-6">
                <ProjectKanbanBoard
                  projects={projects}
                  onProjectMove={updateProjectStatus}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="mt-0">
            {!selectedProject ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Select a Project</h3>
                  <p className="text-muted-foreground mb-4">
                    Choose a project to manage its tasks and assignments
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {projects.map((project) => (
                      <Button
                        key={project.id}
                        variant="outline"
                        onClick={() => setSelectedProjectForTasks(project.id)}
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
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedProjectForTasks(null)}
                  >
                    ← Back to Projects
                  </Button>
                  <div>
                    <h2 className="text-xl font-semibold">{selectedProject.name}</h2>
                    <p className="text-muted-foreground">{selectedProject.description}</p>
                  </div>
                </div>
                <TaskManagement
                  project={selectedProject}
                  onTaskCreate={(taskData) => addTask(selectedProject.id, taskData)}
                  onTaskUpdate={(taskId, updates) => updateTask(selectedProject.id, taskId, updates)}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="gantt" className="mt-0">
            <ProjectGanttChart projects={projects} />
          </TabsContent>

          <TabsContent value="calendar" className="mt-0">
            <ProjectCalendar projects={projects} />
          </TabsContent>
        </div>
      </Tabs>

      {/* Empty State */}
      {projects.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-2xl font-semibold mb-2">No projects yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get started by creating your first project. You can track progress, assign tasks, 
              and collaborate with your team all in one place.
            </p>
            <Button 
              className="bg-quikle-primary hover:bg-quikle-secondary text-white"
              onClick={() => setIsNewProjectModalOpen(true)}
            >
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
