
import React from 'react';
import { Button } from "@/components/ui/button";
import { Database, RefreshCw } from "lucide-react";

interface PerformanceMonitorHeaderProps {
  isLoading: boolean;
  onClearCache: () => void;
  onRefresh: () => void;
}

const PerformanceMonitorHeader = ({ isLoading, onClearCache, onRefresh }: PerformanceMonitorHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold">Performance Monitor</h3>
        <p className="text-sm text-muted-foreground">
          Real-time automation performance and queue management
        </p>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClearCache}
        >
          <Database className="h-4 w-4 mr-1" />
          Clear Cache
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default PerformanceMonitorHeader;
