
import React from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, Calendar } from "lucide-react";
import PrivilegesManager from './PrivilegesManager';
import EmployeeBasicInfo from './EmployeeBasicInfo';
import EmployeeRoleInfo from './EmployeeRoleInfo';
import { useEmployeeForm } from '@/hooks/useEmployeeForm';
import { EmployeeFormProps } from './types';

const EmployeeForm = ({ employee, onSave, onCancel }: EmployeeFormProps) => {
  const { formData, loading, handleInputChange, handleSubmit } = useEmployeeForm(employee, onSave);

  return (
    <div className="bg-gradient-to-br from-white to-quikle-crystal p-6 rounded-xl border border-quikle-silver/30 shadow-platinum">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-quikle-crystal border border-quikle-silver/30">
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
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-6">
            <EmployeeBasicInfo formData={formData} onInputChange={handleInputChange} />
          </TabsContent>

          <TabsContent value="role" className="space-y-4 mt-6">
            <EmployeeRoleInfo formData={formData} onInputChange={handleInputChange} />
          </TabsContent>

          <TabsContent value="privileges" className="mt-6">
            <PrivilegesManager employeeId={employee?.id} />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 pt-6 border-t border-quikle-silver/30">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-quikle-silver/50 text-quikle-charcoal hover:bg-quikle-crystal hover:border-quikle-silver"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-quikle-primary to-quikle-secondary hover:from-quikle-primary/90 hover:to-quikle-secondary/90 text-white shadow-md hover:shadow-luxury"
          >
            {loading ? 'Saving...' : employee ? 'Update Employee' : 'Create Employee'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
