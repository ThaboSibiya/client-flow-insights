import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useActiveWorkspaceId } from '@/hooks/useActiveWorkspaceId';

export interface TeamMember {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  designation: string;
  title: string;
  department: string | null;
  role: 'admin' | 'manager' | 'employee';
  status: 'active' | 'inactive' | 'suspended' | 'terminated';
  hire_date: string;
  salary: number | null;
  is_invited: boolean;
  auth_user_id: string | null;
  last_login_at: string | null;
  manager_id: string | null;
  created_at: string;
}

export interface TeamFilters {
  search: string;
  roles: string[];
  statuses: string[];
  departments: string[];
  inviteStatus: 'all' | 'pending' | 'registered' | 'never_logged_in';
}

export interface TeamMetrics {
  total: number;
  active: number;
  pending: number;
  neverLoggedIn: number;
  byRole: Record<string, number>;
  byDepartment: Record<string, number>;
}

export interface UseTeamDataReturn {
  members: TeamMember[];
  filteredMembers: TeamMember[];
  loading: boolean;
  isCompanyOwner: boolean;
  filters: TeamFilters;
  setFilters: React.Dispatch<React.SetStateAction<TeamFilters>>;
  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  selectedMember: TeamMember | null;
  setSelectedMember: (member: TeamMember | null) => void;
  metrics: TeamMetrics;
  departments: string[];
  refetch: () => void;
  bulkUpdateStatus: (ids: string[], status: TeamMember['status']) => Promise<void>;
  bulkUpdateRole: (ids: string[], role: TeamMember['role']) => Promise<void>;
}

const DEFAULT_FILTERS: TeamFilters = {
  search: '',
  roles: [],
  statuses: [],
  departments: [],
  inviteStatus: 'all',
};

export const useTeamData = (): UseTeamDataReturn => {
  const { user } = useAuth();
  const workspaceId = useActiveWorkspaceId();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCompanyOwner, setIsCompanyOwner] = useState(false);
  const [filters, setFilters] = useState<TeamFilters>(DEFAULT_FILTERS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!user) {
      setMembers([]);
      setIsCompanyOwner(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      let query = supabase
        .from('employees')
        .select('*')
        .eq('company_owner_id', user.id);

      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        setIsCompanyOwner(false);
        setMembers([]);
      } else {
        setIsCompanyOwner(true);
        const ids = (data || []).map((e: any) => e.id);
        const salaryMap: Record<string, number | null> = {};
        if (ids.length > 0) {
          const { data: sensitive } = await supabase
            .from('employee_sensitive')
            .select('employee_id, salary')
            .in('employee_id', ids);
          for (const row of (sensitive || []) as any[]) {
            salaryMap[row.employee_id] = row.salary;
          }
        }
        const merged = (data || []).map((e: any) => ({
          ...e,
          salary: salaryMap[e.id] ?? null,
        }));
        setMembers(merged as TeamMember[]);
      }
    } catch (error: any) {
      console.error('Error fetching team members:', error);
      toast({
        title: 'Error',
        description: 'Failed to load team members',
        variant: 'destructive',
      });
      setIsCompanyOwner(false);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, workspaceId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Extract unique departments
  const departments = useMemo(() => {
    const depts = new Set<string>();
    members.forEach((m) => {
      if (m.department) depts.add(m.department);
    });
    return Array.from(depts).sort();
  }, [members]);

  // Filter members based on current filters
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const searchableFields = [
          member.first_name,
          member.last_name,
          member.email,
          member.designation,
          member.employee_number,
          member.title,
          member.department,
        ];
        const matches = searchableFields.some(
          (field) => field && field.toLowerCase().includes(searchLower)
        );
        if (!matches) return false;
      }

      // Role filter
      if (filters.roles.length > 0 && !filters.roles.includes(member.role)) {
        return false;
      }

      // Status filter
      if (filters.statuses.length > 0 && !filters.statuses.includes(member.status)) {
        return false;
      }

      // Department filter
      if (filters.departments.length > 0) {
        if (!member.department || !filters.departments.includes(member.department)) {
          return false;
        }
      }

      // Invite status filter
      if (filters.inviteStatus !== 'all') {
        switch (filters.inviteStatus) {
          case 'pending':
            if (member.auth_user_id) return false;
            break;
          case 'registered':
            if (!member.auth_user_id) return false;
            break;
          case 'never_logged_in':
            if (member.last_login_at) return false;
            break;
        }
      }

      return true;
    });
  }, [members, filters]);

  // Calculate metrics
  const metrics = useMemo<TeamMetrics>(() => {
    const byRole: Record<string, number> = {};
    const byDepartment: Record<string, number> = {};

    members.forEach((m) => {
      byRole[m.role] = (byRole[m.role] || 0) + 1;
      if (m.department) {
        byDepartment[m.department] = (byDepartment[m.department] || 0) + 1;
      }
    });

    return {
      total: members.length,
      active: members.filter((m) => m.status === 'active').length,
      pending: members.filter((m) => !m.auth_user_id).length,
      neverLoggedIn: members.filter((m) => !m.last_login_at).length,
      byRole,
      byDepartment,
    };
  }, [members]);

  // Bulk operations
  const bulkUpdateStatus = useCallback(
    async (ids: string[], status: TeamMember['status']) => {
      if (!user) return;

      try {
        let updateQuery = supabase
          .from('employees')
          .update({ status })
          .in('id', ids)
          .eq('company_owner_id', user.id);

        if (workspaceId) {
          updateQuery = updateQuery.eq('workspace_id', workspaceId);
        }

        const { error } = await updateQuery;
        if (error) throw error;

        toast({
          title: 'Success',
          description: `Updated ${ids.length} member(s) to ${status}`,
        });

        setSelectedIds(new Set());
        fetchMembers();
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to update members',
          variant: 'destructive',
        });
      }
    },
    [user, workspaceId, fetchMembers]
  );

  const bulkUpdateRole = useCallback(
    async (ids: string[], role: TeamMember['role']) => {
      if (!user) return;

      try {
        let updateQuery = supabase
          .from('employees')
          .update({ role })
          .in('id', ids)
          .eq('company_owner_id', user.id);

        if (workspaceId) {
          updateQuery = updateQuery.eq('workspace_id', workspaceId);
        }

        const { error } = await updateQuery;
        if (error) throw error;

        toast({
          title: 'Success',
          description: `Updated ${ids.length} member(s) to ${role}`,
        });

        setSelectedIds(new Set());
        fetchMembers();
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to update members',
          variant: 'destructive',
        });
      }
    },
    [user, fetchMembers]
  );

  return {
    members,
    filteredMembers,
    loading,
    isCompanyOwner,
    filters,
    setFilters,
    selectedIds,
    setSelectedIds,
    selectedMember,
    setSelectedMember,
    metrics,
    departments,
    refetch: fetchMembers,
    bulkUpdateStatus,
    bulkUpdateRole,
  };
};
