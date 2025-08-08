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

const EmployeeForm = ({ employee, onSave, onCancel, companyName = 'Your Company' }: EmployeeFormProps) => {
  const { 
    formData, 
    loading, 
    creationResult, 
    handleInputChange, 
    handleSubmit, 
    retryEmployeeInvitation 
  } = useEmployeeForm(employee, onSave, companyName);

  return (
    <div className="bg-gradient-to-br from-white to-quikle-crystal p-6 rounded-xl border border-quikle-silver/30 shadow-platinum">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Show invitation status for new employees */}
        {!employee && creationResult && (
          <Alert className={creationResult.invitationSent ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
            {creationResult.invitationSent ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-orange-600" />
            )}
            <AlertDescription className="flex items-center justify-between">
              <div>
                {creationResult.invitationSent ? (
                  <span className="text-green-800">
                    Employee created successfully! Invitation sent to {formData.email}
                  </span>
                ) : (
                  <span className="text-orange-800">
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
                  className="ml-4 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {loading ? 'Sending...' : 'Retry Invitation'}
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-quikle-crystal border border-quikle-silver/30">
            <TabsTrigger 
              value="basic" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-quikle-primary data-[state=active]:shadow-sm"
            >
              <User className="h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger 
              value="role" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-quikle-primary data-[state=active]:shadow-sm"
            >
              <Shield className="h-4 w-4" />
              Role & Status
            </TabsTrigger>
            <TabsTrigger 
              value="privileges" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-quikle-primary data-[state=active]:shadow-sm"
            >
              <Calendar className="h-4 w-4" />
              Privileges
            </TabsTrigger>
            <TabsTrigger 
              value="automation" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-quikle-primary data-[state=active]:shadow-sm"
            >
              <Lock className="h-4 w-4" />
              Automation
            </TabsTrigger>
            <TabsTrigger 
              value="audit" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-quikle-primary data-[state=active]:shadow-sm"
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
                <p>Save the employee first to manage automation permissions</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="audit" className="mt-6">
            {(employee?.id || creationResult?.employee?.id) ? (
              <PrivilegeAuditLog employeeId={employee?.id || creationResult?.employee?.id} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Save the employee first to view audit logs</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 pt-6 border-t border-quikle-silver/30">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-quikle-silver/50 text-quikle-charcoal hover:bg-quikle-crystal hover:border-quikle-silver"
            disabled={loading}
          >
            Cancel
          </Button>
          
          {/* Only show save button if invitation hasn't been sent successfully, or if editing */}
          {(!creationResult?.invitationSent || employee) && (
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-quikle-primary to-quikle-secondary hover:from-quikle-primary/90 hover:to-quikle-secondary/90 text-white shadow-md hover:shadow-luxury"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {employee ? 'Updating...' : 'Creating & Sending Invitation...'}
                </div>
              ) : (
                employee ? 'Update Employee' : 'Create Employee & Send Invitation'
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
