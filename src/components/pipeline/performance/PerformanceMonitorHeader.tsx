
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2 } from "lucide-react";

interface PerformanceMonitorHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
  onClearCache: () => void;
}

const PerformanceMonitorHeader = ({ isLoading, onRefresh, onClearCache }: PerformanceMonitorHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-xl font-semibold">Performance Monitor</h3>
        <p className="text-muted-foreground">Real-time automation performance and system health</p>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={onClearCache}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Cache
        </Button>
        <Button 
          variant="outline" 
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default PerformanceMonitorHeader;
