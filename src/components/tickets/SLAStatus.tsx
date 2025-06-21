
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { SLAStatus } from '@/services/slaService';
import { useSLAManagement } from '@/hooks/useSLAManagement';

interface SLAStatusProps {
  ticket: any;
  compact?: boolean;
}

const SLAStatusComponent = ({ ticket, compact = false }: SLAStatusProps) => {
  const { calculateTicketSLA, formatTimeRemaining, getStatusColor } = useSLAManagement();
  const slaStatus = calculateTicketSLA(ticket);

  const getStatusIcon = (status: 'met' | 'at-risk' | 'breached') => {
    switch (status) {
      case 'met':
        return <CheckCircle2 className="h-3 w-3" />;
      case 'at-risk':
        return <AlertTriangle className="h-3 w-3" />;
      case 'breached':
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {slaStatus.resolutionStatus !== 'met' && (
          <Badge variant="outline" className={`text-xs ${getStatusColor(slaStatus.resolutionStatus)}`}>
            {getStatusIcon(slaStatus.resolutionStatus)}
            <span className="ml-1">{formatTimeRemaining(slaStatus.timeToResolution || 0)}</span>
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700">SLA Status</div>
      
      {/* Response SLA */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">Response:</span>
        <Badge variant="outline" className={`text-xs ${getStatusColor(slaStatus.responseStatus)}`}>
          {getStatusIcon(slaStatus.responseStatus)}
          <span className="ml-1">
            {slaStatus.responseStatus === 'met' ? 'Met' : formatTimeRemaining(slaStatus.timeToResponse || 0)}
          </span>
        </Badge>
      </div>

      {/* Resolution SLA */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">Resolution:</span>
        <Badge variant="outline" className={`text-xs ${getStatusColor(slaStatus.resolutionStatus)}`}>
          {getStatusIcon(slaStatus.resolutionStatus)}
          <span className="ml-1">
            {slaStatus.resolutionStatus === 'met' ? 'Met' : formatTimeRemaining(slaStatus.timeToResolution || 0)}
          </span>
        </Badge>
      </div>

      {/* SLA Deadlines */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>Response Due: {slaStatus.responseDeadline.toLocaleString()}</div>
        <div>Resolution Due: {slaStatus.resolutionDeadline.toLocaleString()}</div>
      </div>
    </div>
  );
};

export default SLAStatusComponent;
