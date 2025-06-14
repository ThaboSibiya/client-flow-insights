
import React from 'react';
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface EmptyStateProps {
  onAddGroup: () => void;
}

const EmptyState = ({ onAddGroup }: EmptyStateProps) => {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p>No condition groups defined</p>
      <Button size="sm" onClick={onAddGroup} className="mt-2">
        Add Your First Group
      </Button>
    </div>
  );
};

export default EmptyState;
