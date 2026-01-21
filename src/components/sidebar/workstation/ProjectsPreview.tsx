import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { WorkstationProject } from '@/hooks/useWorkstationData';

interface ProjectsPreviewProps {
  projects: WorkstationProject[];
  onItemClick?: () => void;
}

const ProjectsPreview = ({ projects, onItemClick }: ProjectsPreviewProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase">Active Projects</span>
        <Link to="/projects" className="text-xs text-primary hover:underline flex items-center gap-1" onClick={onItemClick}>
          View all <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
      {projects.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">No active projects</p>
      ) : (
        projects.map((p) => (
          <div key={p.id} className="p-2 rounded-md border text-xs">
            <div className="flex items-center justify-between">
              <p className="font-medium truncate">{p.name}</p>
              <Badge variant="outline" className="text-[10px] h-4">{p.role}</Badge>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all" 
                  style={{ width: `${p.progress}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{p.progress}%</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ProjectsPreview;
