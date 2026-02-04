import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Mail, UserX, Shield, Clock } from 'lucide-react';
import { TeamMember } from '@/hooks/useTeamData';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface TeamMemberRowProps {
  member: TeamMember;
  isSelected: boolean;
  isActive: boolean;
  onSelect: (checked: boolean) => void;
  onClick: () => void;
  onEdit: () => void;
}

const getRoleStyles = (role: string) => {
  switch (role) {
    case 'admin':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'manager':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-emerald-100 text-emerald-700';
    case 'inactive':
      return 'bg-gray-100 text-gray-600';
    case 'suspended':
      return 'bg-amber-100 text-amber-700';
    case 'terminated':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

const TeamMemberRow: React.FC<TeamMemberRowProps> = ({
  member,
  isSelected,
  isActive,
  onSelect,
  onClick,
  onEdit,
}) => {
  const initials = `${member.first_name?.[0] || ''}${member.last_name?.[0] || ''}`.toUpperCase();
  const fullName = `${member.first_name} ${member.last_name}`;
  const isRegistered = !!member.auth_user_id;
  const hasLoggedIn = !!member.last_login_at;

  const getTimeAgo = (date: string | null) => {
    if (!date) return null;
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return null;
    }
  };

  return (
    <div
      className={cn(
        'group flex items-center gap-3 px-4 py-3 border-b border-border/50 cursor-pointer transition-colors',
        'hover:bg-muted/50',
        isActive && 'bg-primary/5 border-l-2 border-l-primary',
        isSelected && 'bg-primary/10'
      )}
      onClick={onClick}
    >
      {/* Checkbox */}
      <Checkbox
        checked={isSelected}
        onCheckedChange={(checked) => {
          onSelect(!!checked);
        }}
        onClick={(e) => e.stopPropagation()}
        className="opacity-0 group-hover:opacity-100 data-[state=checked]:opacity-100 transition-opacity"
      />

      {/* Avatar with status indicator */}
      <div className="relative">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
            {initials || '??'}
          </AvatarFallback>
        </Avatar>
        {member.status === 'active' && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background" />
        )}
      </div>

      {/* Name & Email */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm truncate">{fullName}</p>
          {!isRegistered && (
            <Badge variant="outline" className="text-[10px] h-4 px-1 text-amber-600 border-amber-200">
              <Clock className="h-2.5 w-2.5 mr-0.5" />
              Pending
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
      </div>

      {/* Title/Role */}
      <div className="hidden md:block w-32 text-sm text-muted-foreground truncate">
        {member.title || member.designation}
      </div>

      {/* Department */}
      <div className="hidden lg:block w-24 text-sm text-muted-foreground truncate">
        {member.department || '—'}
      </div>

      {/* Role Badge */}
      <Badge variant="outline" className={cn('text-xs capitalize', getRoleStyles(member.role))}>
        {member.role}
      </Badge>

      {/* Status Badge */}
      <Badge className={cn('text-xs capitalize', getStatusStyles(member.status))}>
        {member.status}
      </Badge>

      {/* Last Activity */}
      <div className="hidden xl:block w-28 text-xs text-muted-foreground">
        {hasLoggedIn ? getTimeAgo(member.last_login_at) : 'Never'}
      </div>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Details
          </DropdownMenuItem>
          {!isRegistered && (
            <DropdownMenuItem>
              <Mail className="h-4 w-4 mr-2" />
              Resend Invitation
            </DropdownMenuItem>
          )}
          <DropdownMenuItem>
            <Shield className="h-4 w-4 mr-2" />
            Manage Permissions
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">
            <UserX className="h-4 w-4 mr-2" />
            Deactivate
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default TeamMemberRow;
