import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Plus, Phone, Mail, Search } from 'lucide-react';
import { useTeamData, TeamMember } from '@/hooks/useTeamData';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { MobileHeader, MobileCard, MobileEmptyState, FloatingActionButton, PullToRefresh } from '@/components/mobile';
import MobileTeamFilters from './MobileTeamFilters';
import MobileTeamDetail from './MobileTeamDetail';
import EmployeeForm from '@/components/employees/EmployeeForm';
import EmployeeAccessChecker from '@/components/employees/EmployeeAccessChecker';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import SwipeableRow from '@/components/mobile/SwipeableRow';

const MobileTeamLayout: React.FC = () => {
  const {
    members,
    filteredMembers,
    loading,
    isCompanyOwner,
    filters,
    setFilters,
    selectedMember,
    setSelectedMember,
    metrics,
    departments,
    refetch,
  } = useTeamData();

  const { profile } = useCompanyProfile();
  const [showDetail, setShowDetail] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleSelectMember = useCallback((member: TeamMember) => {
    setSelectedMember(member);
    setShowDetail(true);
  }, [setSelectedMember]);

  const handleBack = useCallback(() => {
    setShowDetail(false);
    setSelectedMember(null);
  }, [setSelectedMember]);

  const handleAddMember = useCallback(() => {
    setEditingMember(null);
    setIsFormOpen(true);
  }, []);

  const handleEditMember = useCallback((member: TeamMember) => {
    setEditingMember(member);
    setIsFormOpen(true);
  }, []);

  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setEditingMember(null);
    refetch();
  }, [refetch]);

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '??';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      active: { variant: 'default', label: 'Active' },
      inactive: { variant: 'secondary', label: 'Inactive' },
      pending: { variant: 'outline', label: 'Pending' },
      terminated: { variant: 'destructive', label: 'Terminated' },
    };
    return variants[status] || { variant: 'secondary', label: status };
  };

  // Access check
  if (!loading && !isCompanyOwner) {
    return (
      <MobileEmptyState
        icon={<Users />}
        title="Access Restricted"
        description="You don't have permission to manage team members."
      />
    );
  }

  // Detail View
  if (showDetail && selectedMember) {
    return (
      <MobileTeamDetail
        member={selectedMember}
        onBack={handleBack}
        onEdit={() => handleEditMember(selectedMember)}
      />
    );
  }

  // List View
  return (
    <EmployeeAccessChecker requiredPrivilege="can_manage_employees">
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="px-4 py-3 bg-background border-b border-border/50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold text-foreground">Team</h1>
              <p className="text-xs text-muted-foreground">
                {metrics.total} members · {metrics.active} active
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search team members..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-9 h-10"
            />
          </div>
        </div>

        {/* Filters */}
        <MobileTeamFilters
          filters={filters}
          setFilters={setFilters}
          departments={departments}
          metrics={metrics}
          open={showFilters}
          onOpenChange={setShowFilters}
        />

        {/* Content */}
        <PullToRefresh onRefresh={handleRefresh} className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            ) : filteredMembers.length === 0 ? (
              <MobileEmptyState
                icon={<Users />}
                title="No team members"
                description={filters.search ? 'Try adjusting your search or filters' : 'Add your first team member to get started'}
                action={!filters.search ? { label: 'Add Member', onClick: handleAddMember } : undefined}
              />
            ) : (
              <div className="divide-y divide-border/50">
                {filteredMembers.map((member) => {
                  const statusBadge = getStatusBadge(member.status);
                  
                  return (
                    <SwipeableRow
                      key={member.id}
                      leftActions={member.phone ? [{
                        icon: <Phone className="h-4 w-4" />,
                        label: 'Call',
                        color: 'text-white',
                        bgColor: 'bg-green-500',
                        onClick: () => window.location.href = `tel:${member.phone}`,
                      }] : []}
                      rightActions={[{
                        icon: <Mail className="h-4 w-4" />,
                        label: 'Email',
                        color: 'text-white',
                        bgColor: 'bg-blue-500',
                        onClick: () => window.location.href = `mailto:${member.email}`,
                      }]}
                    >
                      <MobileCard
                        title={`${member.first_name} ${member.last_name}`}
                        subtitle={member.title}
                        description={member.department || member.email}
                        avatar={{
                          fallback: getInitials(member.first_name, member.last_name),
                        }}
                      badges={[
                          { 
                            label: statusBadge.label, 
                            variant: statusBadge.variant,
                          },
                          ...(member.role !== 'employee' ? [{
                            label: member.role.replace('_', ' '),
                            variant: 'outline' as const,
                          }] : []),
                        ]}
                        onClick={() => handleSelectMember(member)}
                        showChevron
                      />
                    </SwipeableRow>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </PullToRefresh>

        {/* FAB */}
        <FloatingActionButton
          onClick={handleAddMember}
          icon={<Plus className="h-6 w-6" />}
          position="bottom-right"
        />

        {/* Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-full h-[90vh] p-0 m-0 rounded-t-xl">
            <DialogHeader className="p-4 border-b">
              <DialogTitle>
                {editingMember ? 'Edit Team Member' : 'Add New Team Member'}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-4">
              <EmployeeForm
                employee={editingMember}
                onSave={handleFormClose}
                onCancel={handleFormClose}
                companyName={profile?.company || 'Your Company'}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </EmployeeAccessChecker>
  );
};

export default MobileTeamLayout;
