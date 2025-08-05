
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, LayoutGrid, BarChart3, Calendar, Settings } from "lucide-react";
import { useProjectManagement } from '@/hooks/useProjectManagement';
import ProjectOverview from './ProjectOverview';
import ProjectKanbanBoard from './ProjectKanbanBoard';
import ProjectGanttChart from './ProjectGanttChart';
import ProjectFilters from './ProjectFilters';

const ProjectManagement = () => {
  const {
    projects,
    filters,
    setFilters,
    teamMembers,
    updateProjectStatus,
  } = useProjectManagement();

  const [activeView, setActiveView] = React.useState<'overview' | 'kanban' | 'gantt' | 'calendar'>('overview');

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
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button className="bg-quikle-primary hover:bg-quikle-secondary text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* View Tabs */}
      <Tabs value={activeView} onValueChange={(value: any) => setActiveView(value)}>
        <div className="flex items-center justify-between">
          <TabsList className="grid w-fit grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              Kanban
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

          <TabsContent value="gantt" className="mt-0">
            <ProjectGanttChart projects={projects} />
          </TabsContent>

          <TabsContent value="calendar" className="mt-0">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">📅</div>
                <h3 className="text-lg font-semibold mb-2">Calendar View</h3>
                <p className="text-muted-foreground">
                  Calendar view coming soon! This will show project deadlines and milestones in a calendar format.
                </p>
              </CardContent>
            </Card>
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
            <Button className="bg-quikle-primary hover:bg-quikle-secondary text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Project
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectManagement;
