import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Search, Filter, X, Users, Clock, UserCheck, UserX } from 'lucide-react';
import { TeamFilters as Filters, TeamMetrics } from '@/hooks/useTeamData';
import { cn } from '@/lib/utils';

interface TeamFiltersProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  departments: string[];
  metrics: TeamMetrics;
}

const ROLES = ['admin', 'manager', 'employee'] as const;
const STATUSES = ['active', 'inactive', 'suspended', 'terminated'] as const;
const INVITE_STATUSES = [
  { value: 'all', label: 'All Members', icon: Users },
  { value: 'pending', label: 'Pending Setup', icon: Clock },
  { value: 'registered', label: 'Registered', icon: UserCheck },
  { value: 'never_logged_in', label: 'Never Logged In', icon: UserX },
] as const;

const TeamFilters: React.FC<TeamFiltersProps> = ({
  filters,
  setFilters,
  departments,
  metrics,
}) => {
  const activeFilterCount =
    filters.roles.length +
    filters.statuses.length +
    filters.departments.length +
    (filters.inviteStatus !== 'all' ? 1 : 0);

  const clearFilters = () => {
    setFilters({
      search: filters.search,
      roles: [],
      statuses: [],
      departments: [],
      inviteStatus: 'all',
    });
  };

  const toggleRole = (role: string) => {
    setFilters((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const toggleStatus = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status],
    }));
  };

  const toggleDepartment = (dept: string) => {
    setFilters((prev) => ({
      ...prev,
      departments: prev.departments.includes(dept)
        ? prev.departments.filter((d) => d !== dept)
        : [...prev.departments, dept],
    }));
  };

  return (
    <div className="space-y-3">
      {/* Search and Filter Row */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, title..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="pl-9 h-9 bg-background"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Role</DropdownMenuLabel>
            {ROLES.map((role) => (
              <DropdownMenuCheckboxItem
                key={role}
                checked={filters.roles.includes(role)}
                onCheckedChange={() => toggleRole(role)}
              >
                <span className="capitalize">{role}</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {metrics.byRole[role] || 0}
                </Badge>
              </DropdownMenuCheckboxItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            {STATUSES.map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={filters.statuses.includes(status)}
                onCheckedChange={() => toggleStatus(status)}
              >
                <span className="capitalize">{status}</span>
              </DropdownMenuCheckboxItem>
            ))}

            {departments.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Department</DropdownMenuLabel>
                {departments.map((dept) => (
                  <DropdownMenuCheckboxItem
                    key={dept}
                    checked={filters.departments.includes(dept)}
                    onCheckedChange={() => toggleDepartment(dept)}
                  >
                    {dept}
                    <Badge variant="outline" className="ml-auto text-xs">
                      {metrics.byDepartment[dept] || 0}
                    </Badge>
                  </DropdownMenuCheckboxItem>
                ))}
              </>
            )}

            {activeFilterCount > 0 && (
              <>
                <DropdownMenuSeparator />
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center text-xs"
                  onClick={clearFilters}
                >
                  Clear all filters
                </Button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Quick Filter Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {INVITE_STATUSES.map(({ value, label, icon: Icon }) => (
          <Button
            key={value}
            variant={filters.inviteStatus === value ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'h-7 text-xs gap-1.5',
              filters.inviteStatus === value && 'bg-primary text-primary-foreground'
            )}
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                inviteStatus: value as Filters['inviteStatus'],
              }))
            }
          >
            <Icon className="h-3 w-3" />
            {label}
            {value === 'all' && (
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                {metrics.total}
              </Badge>
            )}
            {value === 'pending' && metrics.pending > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                {metrics.pending}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Active Filter Tags */}
      {(filters.roles.length > 0 ||
        filters.statuses.length > 0 ||
        filters.departments.length > 0) && (
        <div className="flex items-center gap-2 flex-wrap">
          {filters.roles.map((role) => (
            <Badge key={role} variant="secondary" className="gap-1 pr-1">
              <span className="capitalize">{role}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => toggleRole(role)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {filters.statuses.map((status) => (
            <Badge key={status} variant="secondary" className="gap-1 pr-1">
              <span className="capitalize">{status}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => toggleStatus(status)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {filters.departments.map((dept) => (
            <Badge key={dept} variant="secondary" className="gap-1 pr-1">
              {dept}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => toggleDepartment(dept)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamFilters;
