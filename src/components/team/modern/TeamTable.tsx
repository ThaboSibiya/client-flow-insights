import React, { useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, ArrowUpDown } from 'lucide-react';
import { TeamMember, TeamFilters, TeamMetrics } from '@/hooks/useTeamData';
import TeamMemberRow from './TeamMemberRow';
import TeamFiltersComponent from './TeamFilters';

interface TeamTableProps {
  members: TeamMember[];
  loading: boolean;
  filters: TeamFilters;
  setFilters: React.Dispatch<React.SetStateAction<TeamFilters>>;
  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  selectedMember: TeamMember | null;
  setSelectedMember: (member: TeamMember | null) => void;
  departments: string[];
  metrics: TeamMetrics;
  onAddMember: () => void;
  onEditMember: (member: TeamMember) => void;
}

const TeamTable: React.FC<TeamTableProps> = ({
  members,
  loading,
  filters,
  setFilters,
  selectedIds,
  setSelectedIds,
  selectedMember,
  setSelectedMember,
  departments,
  metrics,
  onAddMember,
  onEditMember,
}) => {
  const allSelected = members.length > 0 && selectedIds.size === members.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < members.length;

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(members.map((m) => m.id)));
    }
  }, [allSelected, members, setSelectedIds]);

  const toggleMember = useCallback(
    (id: string, checked: boolean) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (checked) {
          next.add(id);
        } else {
          next.delete(id);
        }
        return next;
      });
    },
    [setSelectedIds]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search focus
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        searchInput?.focus();
      }
      // N for new member (when not in input)
      if (e.key === 'n' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        onAddMember();
      }
      // Escape to deselect
      if (e.key === 'Escape') {
        setSelectedMember(null);
        setSelectedIds(new Set());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onAddMember, setSelectedMember, setSelectedIds]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <p className="text-sm text-muted-foreground">Loading team members...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="pb-3 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Team Directory</h2>
            <Badge variant="secondary" className="ml-2">
              {members.length} member{members.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <Button onClick={onAddMember} size="sm" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Member
            <kbd className="hidden sm:inline-flex ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-primary-foreground/20 rounded">
              N
            </kbd>
          </Button>
        </div>

        {/* Filters */}
        <TeamFiltersComponent
          filters={filters}
          setFilters={setFilters}
          departments={departments}
          metrics={metrics}
        />
      </CardHeader>

      {/* Table Header */}
      <div className="flex items-center gap-3 px-4 py-2 border-y bg-muted/30 text-xs font-medium text-muted-foreground">
        <Checkbox
          checked={allSelected}
          ref={(el) => {
            if (el) (el as any).indeterminate = someSelected;
          }}
          onCheckedChange={toggleAll}
          className="mr-1"
        />
        <div className="w-9" /> {/* Avatar space */}
        <div className="flex-1">Name</div>
        <div className="hidden md:block w-32">Title</div>
        <div className="hidden lg:block w-24">Department</div>
        <div className="w-20 text-center">Role</div>
        <div className="w-20 text-center">Status</div>
        <div className="hidden xl:block w-28">Last Activity</div>
        <div className="w-8" /> {/* Actions */}
      </div>

      {/* Table Body */}
      <CardContent className="flex-1 overflow-auto p-0">
        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-medium text-lg mb-1">No team members found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {filters.search || filters.roles.length || filters.statuses.length
                ? 'Try adjusting your filters'
                : 'Get started by adding your first team member'}
            </p>
            {!filters.search && !filters.roles.length && !filters.statuses.length && (
              <Button onClick={onAddMember} variant="outline" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Add Team Member
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {members.map((member) => (
              <TeamMemberRow
                key={member.id}
                member={member}
                isSelected={selectedIds.has(member.id)}
                isActive={selectedMember?.id === member.id}
                onSelect={(checked) => toggleMember(member.id, checked)}
                onClick={() => setSelectedMember(member)}
                onEdit={() => onEditMember(member)}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Footer with keyboard hints */}
      <div className="border-t px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>
            {selectedIds.size > 0
              ? `${selectedIds.size} selected`
              : `${members.length} member${members.length !== 1 ? 's' : ''}`}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">⌘K</kbd>
          <span>Search</span>
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">N</kbd>
          <span>New</span>
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Esc</kbd>
          <span>Deselect</span>
        </div>
      </div>
    </Card>
  );
};

export default TeamTable;
