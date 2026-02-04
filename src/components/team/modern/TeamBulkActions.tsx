import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { X, ChevronDown, Shield, Power, Mail, Trash2 } from 'lucide-react';
import { TeamMember } from '@/hooks/useTeamData';

interface TeamBulkActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkUpdateStatus: (status: TeamMember['status']) => void;
  onBulkUpdateRole: (role: TeamMember['role']) => void;
}

const TeamBulkActions: React.FC<TeamBulkActionsProps> = ({
  selectedCount,
  onClearSelection,
  onBulkUpdateStatus,
  onBulkUpdateRole,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-full shadow-lg">
        <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground">
          {selectedCount} selected
        </Badge>

        {/* Status Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-primary-foreground hover:bg-primary-foreground/20">
              <Power className="h-3.5 w-3.5" />
              Status
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onBulkUpdateStatus('active')}>
              Set Active
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBulkUpdateStatus('inactive')}>
              Set Inactive
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBulkUpdateStatus('suspended')}>
              Set Suspended
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onBulkUpdateStatus('terminated')}
              className="text-destructive"
            >
              Terminate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Role Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-primary-foreground hover:bg-primary-foreground/20">
              <Shield className="h-3.5 w-3.5" />
              Role
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onBulkUpdateRole('admin')}>
              Set as Admin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBulkUpdateRole('manager')}>
              Set as Manager
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBulkUpdateRole('employee')}>
              Set as Employee
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* More Actions */}
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-primary-foreground hover:bg-primary-foreground/20">
          <Mail className="h-3.5 w-3.5" />
          Resend Invites
        </Button>

        {/* Close */}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-primary-foreground hover:bg-primary-foreground/20"
          onClick={onClearSelection}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TeamBulkActions;
