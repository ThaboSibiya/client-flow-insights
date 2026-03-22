import React from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Shield, Calendar, Lock, FileText, Mail, AlertCircle, CheckCircle } from "lucide-react";
import PrivilegesManager from './PrivilegesManager';
import AutomationSecurityManager from './AutomationSecurityManager';
import PrivilegeAuditLog from './PrivilegeAuditLog';
import EmployeeBasicInfo from './EmployeeBasicInfo';
import EmployeeRoleInfo from './EmployeeRoleInfo';
import { useEmployeeForm } from '@/hooks/useEmployeeForm';
import { EmployeeFormProps } from './types';

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onSave, onCancel, companyName = 'Your Company' }) => {
  const { 
    formData, 
    loading, 
    creationResult, 
    handleInputChange, 
    handleSubmit, 
    retryEmployeeInvitation 
  } = useEmployeeForm(employee, onSave, companyName);

  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Show invitation status for new employees */}
        {!employee && creationResult && (
          <Alert className={creationResult.invitationSent ? "border-green-500/30 bg-green-500/10" : "border-orange-500/30 bg-orange-500/10"}>
            {creationResult.invitationSent ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-orange-500" />
            )}
            <AlertDescription className="flex items-center justify-between">
              <div>
                {creationResult.invitationSent ? (
                  <span className="text-green-600 dark:text-green-400">
                    Team member created successfully! Invitation sent to {formData.email}
                  </span>
                ) : (
                  <span className="text-orange-600 dark:text-orange-400">
                    {creationResult.error}
                  </span>
                )}
              </div>
              {!creationResult.invitationSent && (
                <Button
                  type="button"
                  onClick={retryEmployeeInvitation}
                  disabled={loading}
                  size="sm"
                  className="ml-4"
                  variant="destructive"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {loading ? 'Sending...' : 'Retry Invitation'}
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-muted border border-border p-1">
            <TabsTrigger 
              value="basic" 
              className="flex items-center gap-2 text-muted-foreground font-medium transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:font-semibold hover:text-foreground hover:bg-accent"
            >
              <User className="h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger 
              value="role" 
              className="flex items-center gap-2 text-muted-foreground font-medium transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:font-semibold hover:text-foreground hover:bg-accent"
            >
              <Shield className="h-4 w-4" />
              Role & Status
            </TabsTrigger>
            <TabsTrigger 
              value="privileges" 
              className="flex items-center gap-2 text-muted-foreground font-medium transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:font-semibold hover:text-foreground hover:bg-accent"
            >
              <Calendar className="h-4 w-4" />
              Privileges
            </TabsTrigger>
            <TabsTrigger 
              value="automation" 
              className="flex items-center gap-2 text-muted-foreground font-medium transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:font-semibold hover:text-foreground hover:bg-accent"
            >
              <Lock className="h-4 w-4" />
              Automation
            </TabsTrigger>
            <TabsTrigger 
              value="audit" 
              className="flex items-center gap-2 text-muted-foreground font-medium transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:font-semibold hover:text-foreground hover:bg-accent"
            >
              <FileText className="h-4 w-4" />
              Audit Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-6">
            <EmployeeBasicInfo formData={formData} onInputChange={handleInputChange} />
          </TabsContent>

          <TabsContent value="role" className="space-y-4 mt-6">
            <EmployeeRoleInfo formData={formData} onInputChange={handleInputChange} />
          </TabsContent>

          <TabsContent value="privileges" className="mt-6">
            <PrivilegesManager employeeId={employee?.id || creationResult?.employee?.id} />
          </TabsContent>

          <TabsContent value="automation" className="mt-6">
            {(employee?.id || creationResult?.employee?.id) ? (
              <AutomationSecurityManager employeeId={employee?.id || creationResult?.employee?.id} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Save the team member first to manage automation permissions</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="audit" className="mt-6">
            {(employee?.id || creationResult?.employee?.id) ? (
              <PrivilegeAuditLog employeeId={employee?.id || creationResult?.employee?.id} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Save the team member first to view audit logs</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 pt-6 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          
          {/* Only show save button if invitation hasn't been sent successfully, or if editing */}
          {(!creationResult?.invitationSent || employee) && (
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                  {employee ? 'Updating...' : 'Creating & Sending Invitation...'}
                </div>
              ) : (
                employee ? 'Update Team Member' : 'Create Team Member & Send Invitation'
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
