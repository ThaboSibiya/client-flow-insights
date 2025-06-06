
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Move, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DashboardWidget {
  id: string;
  type: 'status' | 'chart' | 'activity' | 'actions';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  enabled: boolean;
}

interface DashboardLayoutManagerProps {
  children: React.ReactNode;
  isEditMode?: boolean;
  onToggleEditMode: () => void;
}

const DashboardLayoutManager = ({ children, isEditMode = false, onToggleEditMode }: DashboardLayoutManagerProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Dashboard Layout</h2>
          {isEditMode && (
            <Badge variant="secondary" className="bg-broker-primary/10 text-broker-primary">
              Edit Mode
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant={isEditMode ? "default" : "outline"}
            size="sm"
            onClick={onToggleEditMode}
            className={isEditMode ? "bg-broker-primary" : ""}
          >
            <Settings className="h-4 w-4 mr-2" />
            {isEditMode ? 'Save Layout' : 'Customize'}
          </Button>
        </div>
      </div>
      
      <div className={`transition-all duration-300 ${isEditMode ? 'border-2 border-dashed border-broker-primary/30 rounded-lg p-4' : ''}`}>
        {children}
      </div>
      
      {isEditMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-700">
            <Move className="h-4 w-4" />
            <span className="text-sm font-medium">Drag and drop widgets to rearrange your dashboard</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayoutManager;
