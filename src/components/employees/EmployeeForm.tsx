
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="role" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Role & Status
          </TabsTrigger>
          <TabsTrigger value="privileges" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privileges
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <EmployeeBasicInfo formData={formData} onInputChange={handleInputChange} />
        </TabsContent>

        <TabsContent value="role" className="space-y-4">
          <EmployeeRoleInfo formData={formData} onInputChange={handleInputChange} />
        </TabsContent>

        <TabsContent value="privileges">
          <PrivilegesManager employeeId={employee?.id} />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 pt-6 border-t border-quikle-silver">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-quikle-silver text-quikle-charcoal hover:bg-quikle-crystal"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-quikle-primary hover:bg-quikle-secondary text-white"
        >
          {loading ? 'Saving...' : employee ? 'Update Employee' : 'Create Employee'}
        </Button>
      </div>
    </form>
  );
};

export default EmployeeForm;
