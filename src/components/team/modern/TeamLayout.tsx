import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { List, Network, Users, Settings, ArrowRight } from 'lucide-react';
import { useTeamData, TeamMember } from '@/hooks/useTeamData';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { useMediaQuery } from '@/hooks/use-media-query';
import TeamTable from './TeamTable';
import TeamDetailPanel from './TeamDetailPanel';
import TeamOrgChart from './TeamOrgChart';
import TeamBulkActions from './TeamBulkActions';
import { MobileTeamLayout } from '../mobile';
import EmployeeForm from '@/components/employees/EmployeeForm';
import EmployeeAccessChecker from '@/components/employees/EmployeeAccessChecker';
import LoadingSpinner from '@/components/auth/LoadingSpinner';
import { Button } from '@/components/ui/button';

const TeamLayout: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const {
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
    refetch,
    bulkUpdateStatus,
    bulkUpdateRole,
  } = useTeamData();

  const { profile } = useCompanyProfile();
  const [activeTab, setActiveTab] = useState<string>('list');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

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

  const handleBulkUpdateStatus = useCallback(
    (status: TeamMember['status']) => {
      bulkUpdateStatus(Array.from(selectedIds), status);
    },
    [selectedIds, bulkUpdateStatus]
  );

  const handleBulkUpdateRole = useCallback(
    (role: TeamMember['role']) => {
      bulkUpdateRole(Array.from(selectedIds), role);
    },
    [selectedIds, bulkUpdateRole]
  );

  // Access check
  if (!loading && !isCompanyOwner) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">
            You don't have permission to manage team members.
          </p>
        </div>
      </div>
    );
  }

  // Mobile layout
  if (isMobile) {
    return <MobileTeamLayout />;
  }

  return (
    <EmployeeAccessChecker requiredPrivilege="can_manage_employees">
      <div className="h-[calc(100dvh-4rem)] flex flex-col p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">Team Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage employee records, departments, and roles.{' '}
              <Link to="/settings/workspace" className="text-primary hover:underline inline-flex items-center gap-0.5">
                Workspace access <ArrowRight className="h-3 w-3" />
              </Link>
            </p>
          </div>

          {/* View Toggle */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-9">
              <TabsTrigger value="list" className="gap-1.5 px-3">
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </TabsTrigger>
              <TabsTrigger value="org" className="gap-1.5 px-3">
                <Network className="h-4 w-4" />
                <span className="hidden sm:inline">Org Chart</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Main Content */}
        {activeTab === 'list' ? (
          <ResizablePanelGroup direction="horizontal" className="flex-1 rounded-lg border">
            {/* Table Panel */}
            <ResizablePanel defaultSize={selectedMember ? 65 : 100} minSize={50}>
              <TeamTable
                members={filteredMembers}
                loading={loading}
                filters={filters}
                setFilters={setFilters}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
                selectedMember={selectedMember}
                setSelectedMember={setSelectedMember}
                departments={departments}
                metrics={metrics}
                onAddMember={handleAddMember}
                onEditMember={handleEditMember}
              />
            </ResizablePanel>

            {/* Detail Panel */}
            {selectedMember && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={35} minSize={25} maxSize={45}>
                  <TeamDetailPanel
                    member={selectedMember}
                    onClose={() => setSelectedMember(null)}
                    onEdit={() => handleEditMember(selectedMember)}
                  />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        ) : (
          <div className="flex-1 bg-background rounded-lg border p-4">
            <TeamOrgChart
              members={members}
              onSelectMember={(member) => {
                setSelectedMember(member);
                setActiveTab('list');
              }}
            />
          </div>
        )}

        {/* Bulk Actions Floating Bar */}
        <TeamBulkActions
          selectedCount={selectedIds.size}
          onClearSelection={() => setSelectedIds(new Set())}
          onBulkUpdateStatus={handleBulkUpdateStatus}
          onBulkUpdateRole={handleBulkUpdateRole}
        />

        {/* Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMember
                  ? 'Edit Team Member'
                  : `Add New Team Member${profile?.company ? ` to ${profile.company}` : ''}`}
              </DialogTitle>
            </DialogHeader>
            <EmployeeForm
              employee={editingMember}
              onSave={handleFormClose}
              onCancel={handleFormClose}
              companyName={profile?.company || 'Your Company'}
            />
          </DialogContent>
        </Dialog>
      </div>
    </EmployeeAccessChecker>
  );
};

export default TeamLayout;
