
import React, { useState } from 'react';
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

const Employees = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState('list');
  const { employees, loading, isCompanyOwner, refetch } = useOptimizedEmployeeData();

  // Early return if user is not a company owner
  if (!loading && !isCompanyOwner) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-quikle-silver" />
          <h2 className="text-xl font-semibold text-quikle-charcoal mb-2">Access Restricted</h2>
          <p className="text-quikle-slate">You don't have permission to manage employees.</p>
        </div>
      </div>
    );
  }

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setIsFormOpen(true);
  };

  const handleEditEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedEmployee(null);
    refetch();
  };

  const handleInvitationSent = () => {
    refetch();
  };

  // Optimized filtering with useMemo to prevent unnecessary recalculations
  const filteredEmployees = React.useMemo(() => {
    if (!searchTerm.trim()) return employees;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return employees.filter(employee =>
      employee.first_name.toLowerCase().includes(lowerSearchTerm) ||
      employee.last_name.toLowerCase().includes(lowerSearchTerm) ||
      employee.email.toLowerCase().includes(lowerSearchTerm) ||
      employee.designation.toLowerCase().includes(lowerSearchTerm)
    );
  }, [employees, searchTerm]);

  return (
    <EmployeeAccessChecker requiredPrivilege="can_manage_employees">
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-quikle-charcoal">Employee Management</h1>
            <p className="text-quikle-slate mt-1">Manage your company employees and their access</p>
          </div>
          <Button 
            onClick={handleAddEmployee}
            className="bg-quikle-primary hover:bg-quikle-secondary text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-quikle-charcoal">
              <Users className="h-5 w-5 text-quikle-primary" />
              Employee Directory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-quikle-crystal border border-quikle-silver/30">
                <TabsTrigger 
                  value="list" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-quikle-primary data-[state=active]:shadow-sm"
                >
                  <List className="h-4 w-4" />
                  Employee List
                </TabsTrigger>
                <TabsTrigger 
                  value="hierarchy" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-quikle-primary data-[state=active]:shadow-sm"
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
                      placeholder="Search employees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-quikle-silver"
                    />
                  </div>
                </div>

                <OptimizedEmployeeList 
                  employees={filteredEmployees}
                  loading={loading}
                  onEditEmployee={handleEditEmployee}
                  onInvitationSent={handleInvitationSent}
                />
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
                {selectedEmployee ? 'Edit Employee' : 'Add New Employee'}
              </DialogTitle>
            </DialogHeader>
            <EmployeeForm
              employee={selectedEmployee}
              onSave={handleFormClose}
              onCancel={handleFormClose}
            />
          </DialogContent>
        </Dialog>
      </div>
    </EmployeeAccessChecker>
  );
};

export default Employees;
