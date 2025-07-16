
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Save } from 'lucide-react';

interface DashboardLayoutManagerProps {
  isEditMode: boolean;
  onToggleEditMode: () => void;
  children: React.ReactNode;
}

const DashboardLayoutManager: React.FC<DashboardLayoutManagerProps> = ({
  isEditMode,
  onToggleEditMode,
  children,
}) => {
  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button
          onClick={onToggleEditMode}
          variant={isEditMode ? 'default' : 'outline'}
        >
          {isEditMode ? <Save size={16} /> : <Edit size={16} />}
          {isEditMode ? 'Save Layout' : 'Edit Layout'}
        </Button>
      </div>
      {children}
    </div>
  );
};

export default DashboardLayoutManager;
