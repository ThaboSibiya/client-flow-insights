import React from 'react';
import ModernProjectManagement from '@/components/project-management/ModernProjectManagement';
import ProjectErrorBoundary from '@/components/error/ProjectErrorBoundary';

const ProjectManagementPage: React.FC = () => {
  return (
    <ProjectErrorBoundary>
      <ModernProjectManagement />
    </ProjectErrorBoundary>
  );
};

export default ProjectManagementPage;
