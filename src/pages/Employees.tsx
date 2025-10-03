import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Users, Network, List } from "lucide-react";
import OptimizedEmployeeList from '../components/employees/OptimizedEmployeeList';
import EmployeeForm from '../components/employees/EmployeeForm';
import EmployeeHierarchy from '../components/employees/EmployeeHierarchy';
import EmployeeAccessChecker from '../components/employees/EmployeeAccessChecker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useOptimizedEmployeeData } from '../hooks/useOptimizedEmployeeData';
import { useCompanyProfile } from '../hooks/useCompanyProfile';

interface BasicEmployee {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string;
  designation: string;
  role: string;
  status: string;
  is_invited: boolean;
  auth_user_id: string | null;
}

const Employees: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<BasicEmployee | null>(null);
  const [activeTab, setActiveTab] = useState<string>('list');
  const {
    employees,
    loading,
    isCompanyOwner,
    refetch
  } = useOptimizedEmployeeData();
  const {
    profile
  } = useCompanyProfile();

  // Early return if user is not a company owner
  if (!loading && !isCompanyOwner) {
    return <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-quikle-silver" />
          <h2 className="text-xl font-semibold text-quikle-charcoal mb-2">Access Restricted</h2>
          <p className="text-quikle-slate">You don't have permission to manage team members.</p>
        </div>
      </div>;
  }
  const handleAddEmployee = useCallback(() => {
    setSelectedEmployee(null);
    setIsFormOpen(true);
  }, []);

  const handleEditEmployee = useCallback((employee: BasicEmployee) => {
    setSelectedEmployee(employee);
    setIsFormOpen(true);
  }, []);

  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setSelectedEmployee(null);
    refetch();
  }, [refetch]);

  const handleInvitationSent = useCallback(() => {
    refetch();
  }, [refetch]);

  // Fixed filtering logic to work with available BasicEmployee fields
  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) return employees;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return employees.filter((employee: BasicEmployee) => {
      // Only search on fields that are guaranteed to exist in BasicEmployee
      const searchableFields = [
        employee.first_name, 
        employee.last_name, 
        employee.email, 
        employee.designation, 
        employee.employee_number, 
        employee.role, 
        employee.status
      ];
      return searchableFields.some(field => field && field.toLowerCase().includes(lowerSearchTerm));
    });
  }, [employees, searchTerm]);
  return <EmployeeAccessChecker requiredPrivilege="can_manage_employees">
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-bold text-quikle-charcoal text-xl">Team Management</h1>
            <p className="text-quikle-slate mt-1">Manage your team members and their access</p>
          </div>
          <Button onClick={handleAddEmployee} className="bg-quikle-primary hover:bg-quikle-secondary text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Team Member
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-quikle-charcoal">
              <Users className="h-5 w-5 text-quikle-primary" />
              Team Directory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-quikle-crystal/50 to-quikle-crystal/30 border border-quikle-silver/30 p-1">
                <TabsTrigger 
                  value="list" 
                  className="flex items-center gap-2 text-quikle-slate/70 font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-quikle-primary data-[state=active]:to-quikle-secondary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-quikle-primary/20 data-[state=active]:font-semibold hover:text-quikle-primary hover:bg-white/50"
                >
                  <List className="h-4 w-4" />
                  Team List
                </TabsTrigger>
                <TabsTrigger 
                  value="hierarchy" 
                  className="flex items-center gap-2 text-quikle-slate/70 font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-quikle-primary data-[state=active]:to-quikle-secondary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-quikle-primary/20 data-[state=active]:font-semibold hover:text-quikle-primary hover:bg-white/50"
                >
                  <Network className="h-4 w-4" />
                  Organization Chart
                </TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-4 mt-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-quikle-slate h-4 w-4" />
                    <Input 
                      placeholder="Search by name, email, designation, team member number, role, or status..." 
                      value={searchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} 
                      className="pl-10 border-quikle-silver" 
                    />
                  </div>
                </div>

                <OptimizedEmployeeList employees={filteredEmployees} loading={loading} onEditEmployee={handleEditEmployee} onInvitationSent={handleInvitationSent} />
              </TabsContent>

              <TabsContent value="hierarchy" className="mt-6">
                <EmployeeHierarchy />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-quikle-charcoal">
                {selectedEmployee ? 'Edit Team Member' : `Add New Team Member${profile?.company ? ` to ${profile.company}` : ''}`}
              </DialogTitle>
            </DialogHeader>
            <EmployeeForm employee={selectedEmployee} onSave={handleFormClose} onCancel={handleFormClose} companyName={profile?.company || 'Your Company'} />
          </DialogContent>
        </Dialog>
      </div>
    </EmployeeAccessChecker>;
};
export default Employees;