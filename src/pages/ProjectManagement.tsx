
import React from 'react';
import ProjectManagement from '@/components/project-management/ProjectManagement';
import ProjectErrorBoundary from '@/components/error/ProjectErrorBoundary';

const ProjectManagementPage: React.FC = () => {
  return (
    <ProjectErrorBoundary>
      <ProjectManagement />
    </ProjectErrorBoundary>
  );
};

export default ProjectManagementPage;
