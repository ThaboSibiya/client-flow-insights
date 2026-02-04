import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { MobileSheet } from '@/components/mobile';
import { TeamFilters as TeamFiltersType } from '@/hooks/useTeamData';
import { cn } from '@/lib/utils';

interface MobileTeamFiltersProps {
  filters: TeamFiltersType;
  setFilters: React.Dispatch<React.SetStateAction<TeamFiltersType>>;
  departments: string[];
  metrics: {
    total: number;
    active: number;
    pending: number;
    neverLoggedIn: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MobileTeamFilters: React.FC<MobileTeamFiltersProps> = ({
  filters,
  setFilters,
  departments,
  metrics,
  open,
  onOpenChange,
}) => {
  const statusOptions = [
    { value: 'active', label: 'Active', count: metrics.active },
    { value: 'pending', label: 'Pending', count: metrics.pending },
    { value: 'inactive', label: 'Inactive' },
    { value: 'terminated', label: 'Terminated' },
  ];

  const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'staff', label: 'Staff' },
    { value: 'field_worker', label: 'Field Worker' },
  ];

  const quickFilters = [
    { label: 'All', active: filters.statuses.length === 0 && filters.roles.length === 0, onClick: () => setFilters(prev => ({ ...prev, statuses: [], roles: [], inviteStatus: 'all' })) },
    { label: 'Active', active: filters.statuses.includes('active'), onClick: () => toggleStatus('active') },
    { label: 'Pending Setup', active: filters.inviteStatus === 'pending', onClick: () => setFilters(prev => ({ ...prev, inviteStatus: prev.inviteStatus === 'pending' ? 'all' : 'pending' })) },
    { label: 'Never Logged In', active: filters.inviteStatus === 'never_logged_in', onClick: () => setFilters(prev => ({ ...prev, inviteStatus: prev.inviteStatus === 'never_logged_in' ? 'all' : 'never_logged_in' })) },
  ];

  const toggleStatus = (status: string) => {
    setFilters(prev => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter(s => s !== status)
        : [...prev.statuses, status],
    }));
  };

  const toggleRole = (role: string) => {
    setFilters(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role],
    }));
  };

  const activeFilterCount = filters.statuses.length + filters.roles.length + (filters.inviteStatus !== 'all' ? 1 : 0) + (filters.departments.length);

  return (
    <>
      {/* Horizontal Scroll Quick Filters */}
      <div className="bg-background border-b border-border/30">
        <ScrollArea className="w-full">
          <div className="flex items-center gap-2 px-4 py-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 flex-shrink-0"
              onClick={() => onOpenChange(true)}
            >
              <Filter className="h-3.5 w-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            
            {quickFilters.map((filter) => (
              <Button
                key={filter.label}
                variant={filter.active ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'h-8 flex-shrink-0 text-xs',
                  filter.active && 'bg-primary text-primary-foreground'
                )}
                onClick={filter.onClick}
              >
                {filter.label}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Full Filters Sheet */}
      <MobileSheet
        open={open}
        onOpenChange={onOpenChange}
        title="Filter Team Members"
        footer={
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setFilters(prev => ({ ...prev, statuses: [], roles: [], departments: [], neverLoggedIn: false }));
                onOpenChange(false);
              }}
            >
              Clear All
            </Button>
            <Button
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Apply Filters
            </Button>
          </div>
        }
      >
        <div className="space-y-6 pb-4">
          {/* Status */}
          <div>
            <h4 className="text-sm font-medium mb-3">Status</h4>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={filters.statuses.includes(option.value) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleStatus(option.value)}
                  className="gap-1.5"
                >
                  {option.label}
                  {option.count !== undefined && (
                    <span className="text-xs opacity-70">({option.count})</span>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Role */}
          <div>
            <h4 className="text-sm font-medium mb-3">Role</h4>
            <div className="flex flex-wrap gap-2">
              {roleOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={filters.roles.includes(option.value) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleRole(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Department */}
          {departments.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3">Department</h4>
              <div className="flex flex-wrap gap-2">
                {departments.map((dept) => (
                  <Button
                    key={dept}
                    variant={filters.departments.includes(dept) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilters(prev => ({
                      ...prev,
                      departments: prev.departments.includes(dept)
                        ? prev.departments.filter(d => d !== dept)
                        : [...prev.departments, dept],
                    }))}
                  >
                    {dept}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Special Filters */}
          <div>
            <h4 className="text-sm font-medium mb-3">Special Filters</h4>
            <Button
              variant={filters.inviteStatus === 'never_logged_in' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, inviteStatus: prev.inviteStatus === 'never_logged_in' ? 'all' : 'never_logged_in' }))}
            >
              Never Logged In ({metrics.neverLoggedIn})
            </Button>
          </div>
        </div>
      </MobileSheet>
    </>
  );
};

export default MobileTeamFilters;
