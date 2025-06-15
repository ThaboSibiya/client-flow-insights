
import React from 'react';
import { GitBranch, RefreshCw, AlertTriangle, UserCheck, Play } from "lucide-react";
import { WorkflowNodeType } from './types';

export const getDefaultNodeName = (type: WorkflowNodeType): string => {
  switch (type) {
    case 'condition': return 'If/Then Branch';
    case 'loop': return 'For Each Loop';
    case 'approval': return 'Approval Step';
    case 'error_handler': return 'Error Handler';
    default: return 'Action Step';
  }
};

export const getNodeIcon = (type: WorkflowNodeType, size: string = 'h-4 w-4') => {
    const iconProps = { className: size };
    switch (type) {
      case 'condition': return <GitBranch {...iconProps} />;
      case 'loop': return <RefreshCw {...iconProps} />;
      case 'approval': return <UserCheck {...iconProps} />;
      case 'error_handler': return <AlertTriangle {...iconProps} />;
      default: return <Play {...iconProps} />;
    }
};
